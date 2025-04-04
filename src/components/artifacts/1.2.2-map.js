// TransportMap.jsx
// Fixed to properly hide loading indicator when complete
import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const TransportMap = ({ onLayersReady, onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'biking', 'transit', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add explicit loading state
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);
  const leafletInitializedRef = useRef(false);

  const [activeLayers, setActiveLayers] = useState({
    biking: true,
    transit: true,
    neighborhoods: false,
    buildings: false,
    streets: false,
    crashes: false,
    traffic: false
  });

  const COLORS = {
    biking: '#008080',
    transit: '#FF5747',
    primary: '#2C3E50',
    blue: '#3498DB',
    red: '#E74C3C',
    yellow: '#F1C40F',
    lightblue: '#85C1E9',
    orange: '#E67E22',
    green: '#2ECC71',
    coral: '#008080',
    white: '#FFFFFF'
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (onFullscreenChange) {
      onFullscreenChange(!isFullScreen);
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

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };
  
  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'biking': return 'Loading bike facilities...';
      case 'transit': return 'Loading transit corridors...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };
  
  useEffect(() => {
    return () => {
      if (map) {
        // Explicitly remove each layer first
        Object.keys(activeLayers).forEach(layerKey => {
          const mapLayerKey = `${layerKey}Layer`;
          if (map[mapLayerKey]) {
            map.removeLayer(map[mapLayerKey]);
          }
        });
        
        // Then remove the map
        map.remove();
        setMap(null);
      }
    };
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

  useEffect(() => {
    const initializeMap = async () => {
      setIsLoading(true);
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Set map reference early
      // Create empty layer groups
      const bikingLayer = L.layerGroup();
      const transitLayer = L.layerGroup();
      const neighborhoodLayer = L.layerGroup();
      const buildingLayer = L.layerGroup();
      const streetLayer = L.layerGroup();
      const crashMarkerLayer = L.layerGroup();
      const trafficMarkerLayer = L.layerGroup();
      
      try {
        // Check if the script is already loaded
        if (!document.querySelector('script[src*="leaflet-heat.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
          document.head.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            // Add a timeout to prevent hanging
            setTimeout(resolve, 5000);
          });
        }
      } catch (error) {
        console.error("Error loading heatmap script:", error);
        // Continue anyway as this is not critical
      }

      if (leafletInitializedRef.current || !mapContainerRef.current) return;
      leafletInitializedRef.current = true;
      setLoadingProgress(20);
      setLoadingStage('map');

      // Initialize base map
      const leafletMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 11,
        maxZoom: 18
      }).setView([30.267, -97.743], 13);
      setMap(leafletMap);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletMap);

      L.control.zoom({ position: 'topright' }).addTo(leafletMap);
      L.control.attribution({ position: 'bottomright' }).addTo(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));
      setLoadingProgress(30);
      
      // STEP 1: Load background data (to be hidden by default)
      const bgPromises = [];
      
      // Load neighborhoods in background
      const neighborhoodPromise = (async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const neighborhoods = await res.json();
        neighborhoods.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            const polygon = L.polygon(coords, {
              color: COLORS.primary,
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname}</strong>`);
            neighborhoodLayer.addLayer(polygon);
          } catch {}
        });
        leafletMap.neighborhoodLayer = neighborhoodLayer;
      })();
      bgPromises.push(neighborhoodPromise);

      // Load buildings in background
      const buildingPromise = (async () => {
        const res = await fetch('/data/building-data.json');
        const buildings = await res.json();
        buildings.forEach(b => {
          try {
            const coords = b.the_geom.coordinates[0][0];
            const lat = _.meanBy(coords, c => c[1]);
            const lng = _.meanBy(coords, c => c[0]);
            const circle = L.circleMarker([lat, lng], {
              radius: 4,
              fillColor: '#008080',
              color: '#008080',
              weight: 0,
              fillOpacity: 0.3
            }).bindPopup(`
              <strong>Building ID: ${b.objectid}</strong><br/>
              Condition: ${(b.condition * 100).toFixed(1)}%<br/>
              Height: ${b.max_height} ft
            `);
            buildingLayer.addLayer(circle);
          } catch {}
        });
        leafletMap.buildingLayer = buildingLayer;
      })();
      bgPromises.push(buildingPromise);

      // Load streets in background
      const streetPromise = (async () => {
        const res = await fetch('/data/street-data.json');
        const streets = await res.json();
        streets.forEach(s => {
          try {
            s.the_geom.coordinates[0].forEach(coord => {
              const [lng, lat] = coord;
              const circle = L.circleMarker([lat, lng], {
                radius: 4,
                fillColor: '#008080',
                color: '#008080',
                weight: 0,
                fillOpacity: 0.3
              }).bindPopup(`
                <strong>${s.full_street_name_from_gis}</strong><br/>
                Grade: ${s.final_grade}<br/>
                Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}
              `);
              streetLayer.addLayer(circle);
            });
          } catch {}
        });
        leafletMap.streetLayer = streetLayer;
      })();
      bgPromises.push(streetPromise);

      // Load crashes in background
      const crashPromise = (async () => {
        const res = await fetch('/data/crashes-data.json');
        const crashes = await res.json();
        crashes.forEach(crash => {
          const lat = parseFloat(crash.latitude);
          const lng = parseFloat(crash.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.circleMarker([lat, lng], {
              radius: 4,
              fillColor: COLORS.red,
              color: COLORS.red,
              weight: 1,
              fillOpacity: 0.7
            }).bindPopup(`
              <strong>Crash Report</strong><br/>
              Address: ${crash.address_primary}<br/>
              Severity: ${(crash.severity * 100).toFixed(0)}%<br/>
              Injuries: ${crash.tot_injry_cnt}<br/>
              Deaths: ${crash.death_cnt}<br/>
              Units: ${crash.units_involved}
            `);
            crashMarkerLayer.addLayer(marker);
          }
        });
        leafletMap.crashMarkerLayer = crashMarkerLayer;
      })();
      bgPromises.push(crashPromise);

      // Load traffic in background
      const trafficPromise = (async () => {
        const res = await fetch('/data/traffic-data.json');
        const traffic = await res.json();
        traffic.forEach(segment => {
          const coords = segment.location?.coordinates;
          if (coords?.length === 2) {
            const [lng, lat] = coords;
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.blue};opacity:0.3"></div>` })
            }).bindPopup(`
              <strong>Traffic Detector</strong><br/>
              Location: ${segment.location_name}<br/>
              Direction: ${segment.detector_direction}<br/>
              Movement: ${segment.detector_movement}<br/>
              Condition: ${(segment.condition * 100).toFixed(0)}%
            `);
            trafficMarkerLayer.addLayer(marker);
          }
        });
        leafletMap.trafficMarkerLayer = trafficMarkerLayer;
      })();
      bgPromises.push(trafficPromise);
      
      // Start background data loading
      Promise.all(bgPromises);
      
      // STEP 2: Load and visibly add biking data
      setLoadingStage('biking');
      setLoadingProgress(40);
      
      const bikingRes = await fetch('/data/bikingfacilities-data.json');
      const bikingData = await bikingRes.json();
      
      // Add biking items in batches to create visual loading effect
      const bikingBatchSize = Math.ceil(bikingData.length / 10); // 10 batches
      
      for (let i = 0; i < bikingData.length; i += bikingBatchSize) {
        const batch = bikingData.slice(i, i + bikingBatchSize);
        
        batch.forEach(item => {
          if (item.the_geom?.coordinates) {
            item.the_geom.coordinates.forEach(line => {
              const latlngs = line.map(c => [c[1], c[0]]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.biking,
                weight: 3,
                opacity: 0.8
              }).bindPopup(`
                <strong>${item.full_street_name || 'Unnamed Street'}</strong><br/>
                Facility: ${item.bicycle_facility || 'Unknown'}<br/>
                Comfort: ${item.bike_level_of_comfort || 'N/A'}
              `);
              bikingLayer.addLayer(polyline);
            });
          }
        });
        
        // Update loading progress
        setLoadingProgress(40 + (i / bikingData.length) * 30);
        
        // Wait a bit before adding next batch to create visual effect
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Add biking layer to map after slight delay to ensure map container is attached
      setTimeout(() => {
        if (leafletMap && leafletMap.getContainer && leafletMap.getContainer().parentNode) {
          bikingLayer.addTo(leafletMap);
          leafletMap.bikingLayer = bikingLayer;
        } else {
          console.warn("Map container not ready for bikingLayer");
        }
      }, 50);
      
      // Pause briefly between biking and transit data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 3: Load and visibly add transit data
      setLoadingStage('transit');
      setLoadingProgress(70);
      
      const transitRes = await fetch('/data/transitcorridors-data.json');
      const transitData = await transitRes.json();
      
      // Add transit in batches to create visual loading effect
      const transitBatchSize = Math.ceil(transitData.length / 10); // 10 batches
      
      for (let i = 0; i < transitData.length; i += transitBatchSize) {
        const batch = transitData.slice(i, i + transitBatchSize);
        
        batch.forEach(item => {
          if (item.the_geom?.coordinates) {
            item.the_geom.coordinates.forEach(line => {
              const latlngs = line.map(c => [c[1], c[0]]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.yellow,
                weight: 3,
                opacity: 0.8
              }).bindPopup(`
                <strong>${item.street_name}</strong><br/>
                Type: ${item.corridor_type}
              `);
              transitLayer.addLayer(polyline);
            });
          }
        });
        
        // Update loading progress
        setLoadingProgress(70 + (i / transitData.length) * 30);
        
        // Wait a bit before adding next batch to create visual effect
        await new Promise(r => setTimeout(r, 50));
      }
      
      if (leafletMap && !leafletMap._isDestroyed) {
        transitLayer.addTo(leafletMap);
        leafletMap.transitLayer = transitLayer;
      }
      
      // All layers are now loaded
      setLoadingProgress(100);
      setLoadingStage('complete');
      
      // Add a delay before hiding the loading indicator to ensure the user sees 100%
      setTimeout(() => {
        setIsLoading(false); // Hide loading indicator after a short delay
      }, 1000);
      
      if (onLayersReady) {
        onLayersReady();
      }
      
      if (window.setResponseReady) {
        window.setResponseReady(true);
      }
    };

    initializeMap();
  }, [COLORS.biking, COLORS.blue, COLORS.primary, COLORS.red, COLORS.yellow, map, onLayersReady]);

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
    const layers = [
      ['bikingLayer', 'biking'],
      ['transitLayer', 'transit'],
      ['neighborhoodLayer', 'neighborhoods'],
      ['buildingLayer', 'buildings'],
      ['streetLayer', 'streets'],
      ['crashMarkerLayer', 'crashes'],
      ['trafficMarkerLayer', 'traffic'],
    ];
    layers.forEach(([layerKey, activeKey]) => {
      if (map[layerKey]) {
        if (activeLayers[activeKey]) {
          map.addLayer(map[layerKey]);
        } else {
          map.removeLayer(map[layerKey]);
        }
      }
    });
  }, [map, activeLayers]);

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''} ${isFullScreen ? 'relative' : ''}`}>
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-[#2C3E50]">Bike & Transit Corridors Map</h2>
        <div className="flex items-center space-x-3">
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
            <Layers size={20}  />
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
          <button onClick={(e) => {
            e.preventDefault(); 
            toggleFullScreen();
          }}  style={{ 
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
            {isFullScreen ? <X size={20} /> : <Maximize2 size={20}  />}
          </button>
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Loading indicator that shows only when isLoading is true */}
        {isLoading && (
          <div className="absolute bottom-12 right-4 flex flex-col items-center bg-white bg-opacity-90 z-[1001] p-4 rounded-lg shadow-lg max-w-xs border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'biking' || loadingStage === 'transit' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'biking' || loadingStage === 'transit' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Biking
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'transit' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Transit
              </div>
            </div>
          </div>
        )}
        
        {showSources && (
          <div ref={infoRef} className="absolute top-0 right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]">
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
                  href="https://data.austintexas.gov/Transportation-and-Mobility/Traffic-Detectors/qpuw-8eeb/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Traffic          
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Transportation-and-Mobility/Austin-Crash-Report-Data-Crash-Level-Records/y2wy-tgr5/about_data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Crash          
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Sidewalk-Condition-Data/8e5u-8itq/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Sidewalk Condition          
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Transportation-and-Mobility/TRANSPORTATION_bicycle_facilities/uwbq-ycek"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Bike Lanes          
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/dataset/Core-Transit-Corridors/g4jr-h8r2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Transit Corridors          
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
            <h3 className="font-semibold mb-2 text-[#2C3E50]">Legend & Layers</h3>
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                biking: 'biking',
                transit: 'yellow',
                neighborhoods: 'primary',
                buildings: 'lightblue',
                streets: 'lightblue',
                crashes: 'red',
                traffic: 'blue'
              }[layer];

              const layerLabel = {
                biking: 'Biking',
                transit: 'Transit',
                neighborhoods: 'Neighborhood',
                buildings: 'Building Conditions',
                streets: 'Street Conditions',
                crashes: 'Crashes',
                traffic: 'Traffic'
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

export default TransportMap;