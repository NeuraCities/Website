import React, { useEffect, useState, useRef } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';
import * as turf from '@turf/turf';

const ConcernAreasMap = (props) => {
  const { onLayersReady, onFullscreenChange } = props;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [map, setMap] = useState(null);
  const infoRef = useRef(null);
  
  // Enhanced loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'floodplains', 'concerns', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the isFullscreen prop passed from the parent component
  const isFullScreen = props?.isFullscreen || false;
  
  const [activeLayers, setActiveLayers] = useState({
    neighborhood: false,
    building: false,
    street: false,
    floodplain: true,
    concernArea: true
  });

  const COLORS = {
    flood: '#0074D9',
    neighborhood: '#3498DB',
    street: '#AAAAAA',
    building: '#2ECC40',
    concern: '#FF4136',
    primary: '#2C3E50',
    coral: '#008080',
    white: '#FFFFFF'
  };

  
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
    // Only call the parent's fullscreen handler, don't manage state locally
    if (onFullscreenChange) {
      onFullscreenChange(!isFullScreen);
    }
  };

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Handle clicks outside the info panel
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

  // Handle transition end events for map resize
  useEffect(() => {
    const handleTransitionEnd = (e) => {
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

  // Set up global resize function for the map
  useEffect(() => {
    if (map) {
      window.resizeActiveMap = () => {
        console.log("Map resize triggered");
        
        setTimeout(() => {
          map.invalidateSize({animate: false, pan: false});
          console.log("Map size invalidated");
        }, 100);
      };
      
      const handleWindowResize = _.debounce(() => {
        if (map) map.invalidateSize();
      }, 100);
      
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        window.removeEventListener('resize', handleWindowResize);
        delete window.resizeActiveMap;
      };
    }
  }, [map]);

  // Invalid size after initial render
  useEffect(() => {
    if (map) {
      const timeout = setTimeout(() => {
        map.invalidateSize();
      }, 500);
  
      return () => clearTimeout(timeout);
    }
  }, [map]);

  // Main map initialization 
  useEffect(() => {
    let isCurrent = true;
    const initializeMap = async () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!mapContainerRef.current || !isCurrent) return;
      
      setLoadingProgress(20);
      setLoadingStage('map');

      // Initialize base map
      const leafletMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 11,
        maxZoom: 18
      }).setView([30.267, -97.743], 13);
        // Initialize empty layer groups
      leafletMap.buildingLayer = L.layerGroup();
      leafletMap.streetLayer = L.layerGroup();
      leafletMap.neighborhoodLayer = L.layerGroup();
      // Safely add all layers to map
if (leafletMap.floodplainLayer) {
  leafletMap.floodplainLayer.addTo(leafletMap);
} else {
  console.warn("floodplainLayer is undefined when trying to add to map");
  leafletMap.floodplainLayer = L.layerGroup().addTo(leafletMap);
}

if (leafletMap.concernLayer) {
  leafletMap.concernLayer.addTo(leafletMap);
} else {
  console.warn("concernLayer is undefined when trying to add to map");
  leafletMap.concernLayer = L.layerGroup().addTo(leafletMap);
}

      //leafletMap.floodplainLayer = L.layerGroup();
      //leafletMap.concernLayer = L.layerGroup();

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletMap);

      L.control.zoom({ position: 'topright' }).addTo(leafletMap);
      
    

      // Set map references
      mapInstanceRef.current = leafletMap;
      setMap(leafletMap);
      
      // Force Leaflet to recalculate its container size
      leafletMap.whenReady(() => {
        setTimeout(() => {
          leafletMap.invalidateSize();
          console.log('Manually invalidated size after init');
        }, 200);
      });
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));

      // Load background data in the background (for layers that will be hidden by default)
      const bgPromises = [];
      
      // Load neighborhoods, buildings, and streets in background
      const fetchNeighborhoods = async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const data = await res.json();
        data.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
            const polygon = L.polygon(coords, {
              color: COLORS.primary,
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname}</strong>`);
            leafletMap.neighborhoodLayer.addLayer(polygon);
          } catch {}
        });
        return leafletMap.neighborhoodLayer;
      };
      
      const fetchBuildings = async () => {
        const res = await fetch('/data/building-data.json');
        const data = await res.json();
        return data;
      };
      
      const fetchStreets = async () => {
        const res = await fetch('/data/street-data.json');
        const data = await res.json();
        return data;
      };
      
      // Start loading background layers
      const neighborhoodsPromise = fetchNeighborhoods();
      const buildingsPromise = fetchBuildings();
      const streetsPromise = fetchStreets();
      
      bgPromises.push(neighborhoodsPromise);
      bgPromises.push(buildingsPromise);
      bgPromises.push(streetsPromise);
      
      // Launch neighborhood layer loading in the background
      Promise.resolve(neighborhoodsPromise);

      // STEP 1: Load and visibly add floodplains data
      setLoadingStage('floodplains');
      setLoadingProgress(30);
      
      const drawFloodplains = async () => {
        // First check if map is still valid
        if (!leafletMap || !mapContainerRef.current || !isCurrent) {
          console.warn("Map context invalid when drawing floodplains");
          return [];
        }
        
        try {
          // Fetch the floodplain data
          const res = await fetch('/data/floodplains-data.json');
          const floodplainData = await res.json();
          
          // Create a temporary layer group instead of using the one on leafletMap
          const tempFloodplainLayer = L.layerGroup();
          
          // Add floodplain polygons in batches
          const batchSize = Math.ceil(floodplainData.length / 10);
          
          for (let i = 0; i < floodplainData.length; i += batchSize) {
            if (!isCurrent) break; // Stop if component is unmounting
            
            const batch = floodplainData.slice(i, i + batchSize);
            
            batch.forEach(f => {
              try {
                const coordsList = f.the_geom.coordinates.map(ring => 
                  ring.map(([lng, lat]) => [lat, lng])
                );
                
                const polygon = L.polygon(coordsList, {
                  color: COLORS.flood,
                  fillOpacity: 0.4,
                  weight: 1
                }).bindPopup(`Flood Zone: ${f.flood_zone}`);
                
                tempFloodplainLayer.addLayer(polygon);
              } catch (err) {
                console.warn("Error adding floodplain polygon:", err);
              }
            });
            
            setLoadingProgress(30 + (i / floodplainData.length) * 35);
            await new Promise(r => setTimeout(r, 50));
          }
          
          // Check if map is still valid before adding the layer
          if (leafletMap && isCurrent && leafletMap._container) {
            // Replace the original floodplain layer with our new one
            leafletMap.floodplainLayer = tempFloodplainLayer;
            
            // Safely add the layer to the map with proper timing
            leafletMap.whenReady(() => {
              try {
                if (leafletMap._container && isCurrent) {
                  tempFloodplainLayer.addTo(leafletMap);
                  console.log("Successfully added floodplain layer to map");
                }
              } catch (err) {
                console.error("Error adding floodplain layer in whenReady:", err);
              }
            });
          }
          
          return floodplainData;
        } catch (err) {
          console.error("Error in drawFloodplains:", err);
          return [];
        }
      };
      
      const floodplainData = await drawFloodplains();
      
      // Prepare floodplain polygons for intersection testing
      const floodplainPolygons = floodplainData
        .filter(f => f.the_geom.coordinates.every(ring => ring.length >= 4))
        .map(f => turf.polygon(f.the_geom.coordinates));
      
      // Pause briefly between floodplains and concerns data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and visibly add concern areas data
      setLoadingStage('concerns');
      setLoadingProgress(65);
      
      const processBuildingConcerns = async () => {
        const buildingData = await buildingsPromise;
        
        // Process buildings in batches
        const buildingBatchSize = Math.ceil(buildingData.length / 10);
        for (let i = 0; i < buildingData.length; i += buildingBatchSize) {
          const batch = buildingData.slice(i, i + buildingBatchSize);
          
          batch.forEach(b => {
            try {
              const coords = b.the_geom.coordinates[0][0];
              const lat = _.meanBy(coords, c => c[1]);
              const lng = _.meanBy(coords, c => c[0]);
              
              // Add to regular building layer (hidden by default)
              leafletMap.buildingLayer.addLayer(L.circleMarker([lat, lng], {
                radius: 3,
                color: COLORS.building,
                fillOpacity: 0.3
              }).bindPopup(`<strong>Building ID: ${b.objectid}</strong>`));
              
              // Add to concern layer if it meets criteria
              if (b.condition < 0.75 || b.max_height > 22) {
                leafletMap.concernLayer.addLayer(L.circleMarker([lat, lng], {
                  radius: 5,
                  color: COLORS.concern,
                  fillOpacity: 0.6
                }).bindPopup(`<strong>Concern: Building ${b.objectid}</strong><br>
                  ${b.condition < 0.75 ? 'Poor Condition' : ''}
                  ${(b.condition < 0.75 && b.max_height > 22) ? '<br>' : ''}
                  ${b.max_height > 22 ? 'Excessive Height' : ''}`));
              }
            } catch {}
          });
          
          // Update progress
          setLoadingProgress(65 + (i / buildingData.length) * 15);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
      };
      
      const processStreetConcerns = async () => {
        const streetData = await streetsPromise;
        
        // Process streets in batches
        const streetBatchSize = Math.ceil(streetData.length / 10);
        for (let i = 0; i < streetData.length; i += streetBatchSize) {
          const batch = streetData.slice(i, i + streetBatchSize);
          
          batch.forEach(s => {
            try {
              const coords = s.the_geom.coordinates[0].map(([lng, lat]) => [lat, lng]);
              
              // Add to regular street layer (hidden by default)
              leafletMap.streetLayer.addLayer(L.polyline(coords, {
                color: COLORS.street,
                weight: 2,
                opacity: 0.3
              }).bindPopup(`${s.full_street_name_from_gis}`));
              
              // Check for concerns
              const streetLine = turf.lineString(s.the_geom.coordinates[0]);
              const intersectsFloodplain = floodplainPolygons.some(fp => turf.booleanIntersects(streetLine, fp));
              
              if (s.final_grade === 'F' || intersectsFloodplain) {
                leafletMap.concernLayer.addLayer(L.polyline(coords, {
                  color: COLORS.concern,
                  weight: 4,
                  opacity: 0.8
                }).bindPopup(`
                  <strong>Concern: ${s.full_street_name_from_gis}</strong><br/>
                  ${s.final_grade === 'F' ? 'Grade F (Poor Condition)' : ''}
                  ${(s.final_grade === 'F' && intersectsFloodplain) ? '<br/>' : ''}
                  ${intersectsFloodplain ? 'Floodplain Intersection' : ''}
                `));
              }
            } catch {}
          });
          
          // Update progress
          setLoadingProgress(80 + (i / streetData.length) * 20);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
      };
      
      // Process building and street concerns
      await processBuildingConcerns();
      await processStreetConcerns();
      
      // Add concern layer to map
      leafletMap.concernLayer.addTo(leafletMap);
      
      setTimeout(() => {
        leafletMap.invalidateSize();
        console.log('Map stabilized after initialization');
      }, 300);

      // Only update state if this effect is still the current one
      if (isCurrent) {
        setLoadingProgress(100);
        setLoadingStage('complete');
        
        if (onLayersReady) {
          onLayersReady();
        }
        
        if (window.setResponseReady) {
          window.setResponseReady(true);
        }
      }
    };
  
    initializeMap();
    
    return () => {
      isCurrent = false; 
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // Make sure the map is properly initialized when the component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update active layers
  useEffect(() => {
    if (!map) return;
    
    const layers = {
      neighborhood: map.neighborhoodLayer,
      building: map.buildingLayer,
      street: map.streetLayer,
      floodplain: map.floodplainLayer,
      concernArea: map.concernLayer
    };
    
    Object.entries(activeLayers).forEach(([key, active]) => {
      if (layers[key]) {
        if (active) {
          map.addLayer(layers[key]);
        } else {
          map.removeLayer(layers[key]);
        }
      }
    });
  }, [map, activeLayers]);

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'floodplains': return 'Loading floodplain data...';
      case 'concerns': return 'Identifying areas of concern...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Austin Areas of Concern Map
        </h2>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setShowLegend(prev => !prev)} 
            title="Layers & Legend" 
            style={{ 
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
            }}
          >
            <Layers size={20} />
          </button>
          
          <button 
            onClick={() => setShowSources(prev => !prev)} 
            title="View Sources" 
            style={{ 
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
            }}
          >
            <Info size={20} />
          </button>
          
          {!isMobile && (
            <button 
              onClick={toggleFullScreen} 
              title="Fullscreen" 
              style={{ 
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
              }}
            >
              {isFullScreen ? <X size={20} /> : <Maximize2 size={20} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Loading indicator that shows the current stage while keeping map visible */}
        {loadingStage !== 'complete' && (
          <div className="absolute bottom-12 right-4 flex flex-col items-center bg-white bg-opacity-90 z-[1001] p-4 rounded-lg shadow-lg max-w-xs border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 border-3 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-800">{getLoadingMessage()}</p>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Layer indicators */}
            <div className="grid grid-cols-3 gap-1 mt-2 w-full">
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'floodplains' || loadingStage === 'concerns' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'floodplains' || loadingStage === 'concerns' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Floodplains
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'concerns' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Concerns
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
              <div>
                <a
                  href="https://data.austintexas.gov/d/gjtj-jt2d" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  EMS
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/fszi-c96k" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  EMS Satisfaction
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
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                neighborhood: 'primary',
                building: 'building',
                street: 'street',
                floodplain: 'flood',
                concernArea: 'concern'
              }[layer];

              const layerLabel = {
                neighborhood: 'Neighborhood',
                building: 'Building Conditions',
                street: 'Street Conditions',
                floodplain: 'Floodplains',
                concernArea: 'Priority'
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
    </div>
  );
};

export default ConcernAreasMap;