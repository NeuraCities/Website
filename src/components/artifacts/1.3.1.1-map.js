//30.265813, -97.751391
// UpdatedFloodInfraIntersectionMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const UpdatedFloodInfraIntersectionMap = ({ onLayersReady, onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'floodplains', 'intersections', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);


  const [activeLayers, setActiveLayers] = useState({
    floodplains: true,
    intersectingBuildings: true,
    intersectingStreets: true,
    neighborhood: false,
    building: false,
    street: false
  });

  const COLORS = {
    flood: '#0074D9',
    intersect: '#FF4136',
    base: '#AAAAAA',
    primary: '#2C3E50',
    neighborhood: '#3498DB',
    street: '#008080',
    building: '#008080',
    coral: '#008080',
    white: '#FFFFFF'
  };
  
  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'floodplains': return 'Loading floodplain data...';
      case 'intersections': return 'Identifying flooded infrastructure...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };
  const [isMobile, setIsMobile] = useState(false);
        // Check for mobile viewport
        useEffect(() => {
          const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
          };
          
          // Initial check
          checkIfMobile();
          
          // Add resize listener
          window.addEventListener('resize', checkIfMobile);
          
          // Cleanup
          return () => window.removeEventListener('resize', checkIfMobile);
        }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (onFullscreenChange) {
      onFullscreenChange(!isFullScreen);
    }
  };

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  useEffect(() => {
    const initializeMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
  
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (map || !mapContainerRef.current) return;
      
      setLoadingProgress(20);
      setLoadingStage('map');

      // Initialize empty layer groups
      const neighborhoodLayer = L.layerGroup();
      const buildingLayer = L.layerGroup();
      const streetLayer = L.layerGroup();
      const floodLayer = L.layerGroup();
      const intersectLayerBuildings = L.layerGroup();
      const intersectLayerStreets = L.layerGroup();

      const leafletMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 11,
        maxZoom: 18
      }).setView([30.267, -97.743], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletMap);

      L.control.zoom({ position: 'topright' }).addTo(leafletMap);
      
      // Set map reference early
      setMap(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));

      const fetchGeoJson = async (url) => {
        const res = await fetch(url);
        return await res.json();
      };

      const pointInPolygon = (point, polygon) => {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i][0], yi = polygon[i][1];
          const xj = polygon[j][0], yj = polygon[j][1];
          const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi + 0.00000001) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      };
      
      // Load background data in the background (for layers that will be hidden by default)
      const bgPromises = [];
      
      // Load neighborhoods, base buildings, and streets in background
      const fetchNeighborhoods = async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const data = await res.json();
        data.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            const polygon = L.polygon(coords, {
              color: COLORS.primary,
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname}</strong>`);
            neighborhoodLayer.addLayer(polygon);
          } catch {}
        });
        leafletMap.neighborhoodLayer = neighborhoodLayer;
        return neighborhoodLayer;
      };
      
      const fetchBuildings = async () => {
        const res = await fetch('/data/building-data.json');
        const data = await res.json();
        data.forEach(b => {
          try {
            const coords = b.the_geom.coordinates[0][0];
            const lat = _.meanBy(coords, c => c[1]);
            const lng = _.meanBy(coords, c => c[0]);
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: '',
                html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.building};opacity:0.3"></div>`
              })
            }).bindPopup(`<strong>Building ID: ${b.objectid}</strong>`);
            buildingLayer.addLayer(marker);
          } catch {}
        });
        leafletMap.buildingLayer = buildingLayer;
        return buildingLayer;
      };
      
      const fetchStreets = async () => {
        const res = await fetch('/data/street-data.json');
        const data = await res.json();
        data.forEach(s => {
          try {
            s.the_geom.coordinates[0].forEach(coord => {
              const [lng, lat] = coord;
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: '',
                  html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.street};opacity:0.3"></div>`
                })
              }).bindPopup(`<strong>${s.full_street_name_from_gis}</strong>`);
              streetLayer.addLayer(marker);
            });
          } catch {}
        });
        leafletMap.streetLayer = streetLayer;
        return streetLayer;
      };
      
      // Start loading background layers
      bgPromises.push(fetchNeighborhoods());
      bgPromises.push(fetchBuildings());
      bgPromises.push(fetchStreets());
      
      // Launch these in the background
      Promise.all(bgPromises);
      
      // STEP 1: Load and visibly add floodplains data
      setLoadingStage('floodplains');
      setLoadingProgress(30);
      
      const drawFloodplains = async () => {
        const floodData = await fetchGeoJson('/data/floodplains-data.json');
        
        // Add floodplain polygons in batches to create visual loading effect
        const batchSize = Math.ceil(floodData.length / 10); // 10 batches
        
        for (let i = 0; i < floodData.length; i += batchSize) {
          const batch = floodData.slice(i, i + batchSize);
          
          batch.forEach(f => {
            try {
              const coordsList = f.the_geom.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]));
              const polygon = L.polygon(coordsList, {
                color: COLORS.flood,
                fillOpacity: 0.3,
                weight: 1
              }).bindPopup(`Flood Zone: ${f.flood_zone}`);
              floodLayer.addLayer(polygon);
            } catch {}
          });
          
          // Update loading progress
          setLoadingProgress(30 + (i / floodData.length) * 35);
          
          // Wait a bit before adding next batch to create visual effect
          await new Promise(r => setTimeout(r, 50));
        }
        
        // Add floodplain layer to map
        floodLayer.addTo(leafletMap);
        leafletMap.floodLayer = floodLayer;
        
        return floodData;
      };
      
      const floodData = await drawFloodplains();
      
      // Pause briefly between floodplains and intersections data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and visibly add intersection data
      setLoadingStage('intersections');
      setLoadingProgress(65);
      
      const highlightIntersections = async () => {
        const [buildingData, streetData] = await Promise.all([
          fetchGeoJson('/data/building-data.json'),
          fetchGeoJson('/data/street-data.json')
        ]);

        const floodPolygons = floodData.map(f => f.the_geom.coordinates[0].map(([lng, lat]) => [lng, lat]));
        
        // Process buildings in batches
        const buildingBatchSize = Math.ceil(buildingData.length / 10);
        for (let i = 0; i < buildingData.length; i += buildingBatchSize) {
          const batch = buildingData.slice(i, i + buildingBatchSize);
          
          batch.forEach(b => {
            const coords = b.the_geom.coordinates[0][0];
            const center = [_.meanBy(coords, c => c[0]), _.meanBy(coords, c => c[1])];
            if (floodPolygons.some(poly => pointInPolygon(center, poly))) {
              const marker = L.circleMarker([center[1], center[0]], {
                radius: 4,
                color: COLORS.intersect,
                fillOpacity: 0.9
              }).bindPopup(`Flooded Building<br>ID: ${b.objectid}`);
              intersectLayerBuildings.addLayer(marker);
            }
          });
          
          // Update progress
          setLoadingProgress(65 + (i / buildingData.length) * 15);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        
        // Add intersecting buildings layer to map
        intersectLayerBuildings.addTo(leafletMap);
        leafletMap.intersectLayerBuildings = intersectLayerBuildings;
        
        // Process streets in batches
        const streetPoints = [];
        streetData.forEach(s => {
          s.the_geom.coordinates[0].forEach(([lng, lat]) => {
            streetPoints.push({ lng, lat, name: s.full_street_name_from_gis });
          });
        });
        
        const streetBatchSize = Math.ceil(streetPoints.length / 10);
        for (let i = 0; i < streetPoints.length; i += streetBatchSize) {
          const batch = streetPoints.slice(i, i + streetBatchSize);
          
          batch.forEach(({ lng, lat, name }) => {
            const point = [lng, lat];
            if (floodPolygons.some(poly => pointInPolygon(point, poly))) {
              const marker = L.circleMarker([lat, lng], {
                radius: 3,
                color: COLORS.intersect,
                fillOpacity: 0.9
              }).bindPopup(`Flooded Street: ${name}`);
              intersectLayerStreets.addLayer(marker);
            }
          });
          
          // Update progress
          setLoadingProgress(80 + (i / streetPoints.length) * 20);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
        
        // Add intersecting streets layer to map
        intersectLayerStreets.addTo(leafletMap);
        leafletMap.intersectLayerStreets = intersectLayerStreets;
        
        // Add manual marker for public library
        const manualLatLng = [30.265813, -97.751391];
        const manualMarker = L.circleMarker(manualLatLng, {
          radius: 4,
          color: COLORS.intersect,
          fillOpacity: 0.9
        }).bindPopup(`Public Library<br>Lat: ${manualLatLng[0].toFixed(6)}, Lng: ${manualLatLng[1].toFixed(6)}`);
        intersectLayerBuildings.addLayer(manualMarker);
      };
      
      await highlightIntersections();
      
      // All layers are now loaded
      setLoadingProgress(100);
      setLoadingStage('complete');
      
      // Store layer references
      leafletMap.floodLayer = floodLayer;
      leafletMap.intersectLayerBuildings = intersectLayerBuildings;
      leafletMap.intersectLayerStreets = intersectLayerStreets;
      leafletMap.neighborhoodLayer = neighborhoodLayer;
      leafletMap.buildingLayer = buildingLayer;
      leafletMap.streetLayer = streetLayer;
      
      
      setLoadingProgress(100);
    setLoadingStage('complete');
    if (onLayersReady) {
      onLayersReady();
    }
    
    if (window.setResponseReady) {
      window.setResponseReady(true);
    }
    };

    initializeMap();
    return () => map?.remove();
  }, [COLORS.building, COLORS.flood, COLORS.intersect, COLORS.primary, COLORS.street, map, onLayersReady]);

  useEffect(() => {
    const handleTransitionEnd = (e) => {
      // Check if the transition was on an element that could affect map size
      if (e.target.id === 'draggable-panel-header' || 
          e.target.closest('.draggable-artifact-panel') || 
          e.target.classList.contains('draggable-artifact-panel')) {
        if (map) map.invalidateSize();
      }
    };
    
    document.addEventListener('transitionend', handleTransitionEnd);
    
    return () => {
      document.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [map]);

  useEffect(() => {
    if (map) {
      // Create global resize function
      window.resizeActiveMap = () => {
        console.log("Map resize triggered");
        
        // For Leaflet maps, invalidateSize is the key method 
        // that recalculates the map container size
        
        // Add a small delay to let the DOM update first
        setTimeout(() => {
          map.invalidateSize({animate: false, pan: false});
          console.log("Map size invalidated");
        }, 100);
      };
      
      // Also set up resize handler for window resize events
      const handleWindowResize = _.debounce(() => {
        if (map) map.invalidateSize();
      }, 100);
      
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        // Clean up
        window.removeEventListener('resize', handleWindowResize);
        delete window.resizeActiveMap;
      };
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const layers = {
      floodplains: map.floodLayer,
      intersectingBuildings: map.intersectLayerBuildings,
      intersectingStreets: map.intersectLayerStreets,
      neighborhood: map.neighborhoodLayer,
      building: map.buildingLayer,
      street: map.streetLayer
    };
    Object.entries(activeLayers).forEach(([key, active]) => {
      if (layers[key]) {
        if (active) {
          map.addLayer(layers[key]);
        } else {
          map.removeLayer(layers[key]);
        }
      }    });
  }, [map, activeLayers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowSources(false);
      }
    };
  
    if (showSources) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSources]);
  
  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white relative' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Floodplain & Infrastructure Intersection Map
        </h2>
        <div className="flex items-center space-x-1">
          <button onClick={() => setShowLegend(prev => !prev)} title="Layers & Legend" style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = COLORS.coral;
          }}>
            <Layers size={20} />
          </button>
          <button onClick={() => setShowSources(prev => !prev)} title="View Sources" style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = COLORS.coral;
          }}>
            <Info size={20} />
          </button>
          {!isMobile && (
          <button onClick={toggleFullScreen} title="Fullscreen" style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            transition: 'all 0.2s ease-in-out',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = COLORS.coral;
          }}>
            {isFullScreen ? <X size={20} /> : <Maximize2 size={20} />}
          </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Loading indicator that shows the current stage while keeping map visible */}
        {loadingStage !== 'complete' && (
          <div className="absolute bottom-12 right-4 flex flex-col items-center bg-white bg-opacity-90 z-100 p-4 rounded-lg shadow-lg max-w-xs border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-800">{getLoadingMessage()}</p>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Layer indicators */}
            <div className="grid grid-cols-3 gap-1 mt-2 w-full">
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'floodplains' || loadingStage === 'intersections' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'floodplains' || loadingStage === 'intersections' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Floodplains
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'intersections' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Intersections
              </div>
            </div>
          </div>
        )}
        
        {showSources && (

          <div ref={infoRef} className="absolute top-4 right-4 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in">
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <a
                  href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8/about_data" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Infrastructure Charts
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Street-Segment-Condition-Data/pcwe-pwxe/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Street Condition
                </a>
              </div>
              <div>
                <a>
                  Building Condition (contains building footprints, maintenance details, conditions, and year built)
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Locations-and-Maps/Neighborhoods/a7ap-j2yt/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Neighborhoods
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Public-Safety/Greater-Austin-Fully-Developed-Floodplain/pjz8-kff2/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Floodplains
                </a>
              </div>
              <div>
                <a>
                  Heat island (contains temperature increase, tree coverage, impervious surface, and heat related emergency calls)
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/w635-mmjr" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Historic Disaster Data
                </a>
              </div>
            </div>
          </div>
        )}

        {showLegend && (
          <div
            className="absolute bottom-4 left-4 w-15 bg-white border rounded shadow-md p-3 text-sm resize"
            style={{ zIndex: 1000, overflow: 'auto', maxHeight: '70vh' }}
          >
            <h3 className="font-semibold mb-2">Layers</h3>
            {/* Create a modified array of layer keys to display */}
            {[
              'floodplains',
              'priority', // Custom entry that will handle both intersecting layers
              'neighborhood',
              'building',
              'street'
            ].map(layer => {
              // Handle the special "priority" case
              if (layer === 'priority') {
                return (
                  <label key="priority" className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={activeLayers.intersectingBuildings || activeLayers.intersectingStreets}
                      onChange={() => {
                        // Toggle both intersection layers together
                        toggleLayer('intersectingBuildings');
                        toggleLayer('intersectingStreets');
                      }}
                    />
                    {(activeLayers.intersectingBuildings || activeLayers.intersectingStreets) && (
                      <span
                        style={{
                          backgroundColor: COLORS.intersect,
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          display: 'inline-block'
                        }}
                      />
                    )}
                    <span>Priority</span>
                  </label>
                );
              }

              // For other layers, determine the color and display normally
              const colorKey = {
                floodplains: 'flood',
                priority: 'priority',
                neighborhood: 'neighborhood',
                building: 'building',
                street: 'street'
              }[layer];

              const layerLabel = {
                neighborhood: 'Neighborhood',
                building: 'Building Conditions',
                street: 'Street Conditions',
                floodplains: 'Floodplains',
                priority: 'Priority',
              }[layer]; 

              return (
                <label key={layer} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={activeLayers[layer]}
                    onChange={() => toggleLayer(layer)}
                  />
                  {activeLayers[layer] && (
                    <span
                      style={{
                        backgroundColor: COLORS[colorKey],
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        display: 'inline-block'
                      }}
                    />
                  )}
                  <span>{layerLabel}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-2 bg-white border-t text-xs text-gray-500">
        <p><strong>Source:</strong> City of Austin Floodplain and Infrastructure Data (March 2025)</p>
      </div>
    </div>
  );
};

export default UpdatedFloodInfraIntersectionMap;