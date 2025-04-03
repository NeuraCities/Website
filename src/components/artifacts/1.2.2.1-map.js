// CombinedTransportPlanningMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const CombinedTransportPlanningMap = ({onLayersReady, onFullscreenChange}) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
  
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'traffic', 'plans', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [activeLayers, setActiveLayers] = useState({
    biking: false,
    transit: false,
    transport: false,
    plans: true,
    neighborhoods: false,
    buildings: false,
    streets: false,
    crash: false,
    traffic: true
  });

  const COLORS = {
    biking: '#008080',
    transit: '#FF5747',
    blue: '#3498DB',
    transport: '#008080',
    green: '#2ECC71',
    orange: '#E67E22',
    red: '#E74C3C',
    yellow: '#F1C40F',
    lightblue: '#85C1E9',
    primary: '#2C3E50',
    coral: '#008080',
    white: '#FFFFFF'
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

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'traffic': return 'Loading traffic data...';
      case 'plans': return 'Loading planning data...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };

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
      if (!mapContainerRef.current) return;
    if (mapContainerRef.current._leaflet_id != null) {
      mapContainerRef.current._leaflet_id = null;
    }
    if (map) return;

    setLoadingStage('initializing');
    setLoadingProgress(10);

    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
      
      // Load heat map script if needed
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);

      if (map || !mapContainerRef.current) return;
      
      setLoadingProgress(20);
      setLoadingStage('map');

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
      
      // Initialize all layer groups
      const layers = {
        biking: L.layerGroup(),
        transit: L.layerGroup(),
        transport: L.layerGroup(),
        plans: L.layerGroup(),
        neighborhoods: L.layerGroup(),
        buildings: L.layerGroup(),
        streets: L.layerGroup(),
        crash: L.layerGroup(),
        traffic: L.layerGroup()
      };
      
      // Store layers in the map object for later reference
      Object.entries(layers).forEach(([key, layer]) => {
        leafletMap[key] = layer;
      });
      
      // Set map reference early
      setMap(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));
      
      // Helper functions for adding features to layers
      const addPolylineLayer = (data, layer, color, popupFn) => {
        data.forEach(item => {
          if (item.the_geom?.coordinates) {
            item.the_geom.coordinates.forEach(line => {
              const latlngs = line.map(c => [c[1], c[0]]);
              const polyline = L.polyline(latlngs, { color, weight: 3 }).bindPopup(popupFn(item));
              layer.addLayer(polyline);
            });
          }
        });
      };

      const geoFetch = async (url) => (await fetch(url)).json();
      
      // Load background data in the background (for layers that will be hidden by default)
      const bgPromises = [];
      
      // Function to fetch background data
      const fetchBackgroundData = async () => {
        const [biking, transit, transport, neighborhoods, buildings, streets, crash] = await Promise.all([
          geoFetch('/data/bikingfacilities-data.json'),
          geoFetch('/data/transitcorridors-data.json'),
          geoFetch('/data/transportmaintenance-data.json'),
          geoFetch('/data/neighborhood-data.json'),
          geoFetch('/data/building-data.json'),
          geoFetch('/data/street-data.json'),
          geoFetch('/data/crashes-data.json')
        ]);
        
        // Process background layers (not visible by default)
        addPolylineLayer(biking, layers.biking, COLORS.biking, i => `Street: ${i.full_street_name || 'Unnamed'}<br/>Comfort: ${i.bike_level_of_comfort}`);
        addPolylineLayer(transit, layers.transit, COLORS.transit, i => `Corridor: ${i.street_name}<br/>Type: ${i.corridor_type}`);
        addPolylineLayer(transport, layers.transport, COLORS.blue, i => `Treatment: ${i.treatment}<br/>Year: ${i.year}`);
        
        neighborhoods.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            layers.neighborhoods.addLayer(L.polygon(coords, { color: COLORS.primary, weight: 2, fillOpacity: 0 }).bindPopup(`Neighborhood: ${n.neighname}`));
          } catch {}
        });

        buildings.forEach(b => {
          try {
            const coords = b.the_geom.coordinates[0][0];
            const lat = _.meanBy(coords, c => c[1]);
            const lng = _.meanBy(coords, c => c[0]);
            layers.buildings.addLayer(L.circleMarker([lat, lng], { radius: 4, fillColor: '#008080', fillOpacity: 0.3, color: '#008080', weight: 0 })
              .bindPopup(`Building ID: ${b.objectid}<br/>Condition: ${(b.condition * 100).toFixed(1)}%`));
          } catch {}
        });

        streets.forEach(s => {
          try {
            s.the_geom.coordinates[0].forEach(([lng, lat]) => {
              layers.streets.addLayer(L.circleMarker([lat, lng], { radius: 4, fillColor: '#008080', fillOpacity: 0.3, color: '#008080', weight: 0 })
                .bindPopup(`Street: ${s.full_street_name_from_gis}<br/>Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}`));
            });
          } catch {}
        });

        crash.forEach(c => {
          try {
            const lat = parseFloat(c.latitude);
            const lng = parseFloat(c.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              layers.crash.addLayer(L.marker([lat, lng], {
                icon: L.divIcon({
                  className: '',
                  html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.red};opacity:0.3"></div>`
                })
              }).bindPopup(`Crash: ${c.address_primary}<br/>Severity: ${(c.severity * 100).toFixed(0)}%`));
            }
          } catch {}
        });
      };
      
      // Start loading background data, but don't wait for it
      bgPromises.push(fetchBackgroundData());
      Promise.all(bgPromises);
      
      // STEP 1: Load and add traffic data (visible by default)
      setLoadingStage('traffic');
      setLoadingProgress(40);
      
      const loadTrafficData = async () => {
        const traffic = await geoFetch('/data/traffic-data.json');
        
        // Process traffic data in batches to show visual loading
        const batchSize = Math.ceil(traffic.length / 10); // 10 batches
        
        for (let i = 0; i < traffic.length; i += batchSize) {
          const batch = traffic.slice(i, i + batchSize);
          
          batch.forEach(t => {
            try {
              const coords = t.location?.coordinates;
              if (coords?.length === 2) {
                const [lng, lat] = coords;
                layers.traffic.addLayer(L.circleMarker([lat, lng], {
                  radius: 5,
                  fillColor: COLORS.orange,
                  fillOpacity: 0.6,
                  color: COLORS.orange,
                  weight: 1
                }).bindPopup(`Location: ${t.location_description || 'Unknown'}<br/>Condition: ${(t.condition * 100).toFixed(0)}%`));
              }
            } catch {}
          });
          
          // Update progress (40% - 70%)
          setLoadingProgress(40 + (i / traffic.length) * 30);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        
        // Add traffic layer to map
        if (activeLayers.traffic) {
          leafletMap.addLayer(layers.traffic);
        }
        
        return traffic;
      };
      
      await loadTrafficData();
      
      // Pause briefly between traffic and plans data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and add plans data (visible by default)
      setLoadingStage('plans');
      setLoadingProgress(70);
      
      const loadPlansData = async () => {
        const plans = await geoFetch('/data/smallareaplans-data.json');
        
        // Process plans data in batches to show visual loading
        const batchSize = Math.ceil(plans.length / 10); // 10 batches
        
        for (let i = 0; i < plans.length; i += batchSize) {
          const batch = plans.slice(i, i + batchSize);
          
          batch.forEach(item => {
            try {
              if (item.the_geom?.type === 'MultiPolygon') {
                item.the_geom.coordinates.forEach(polygonGroup => {
                  const latlngs = polygonGroup[0].map(([lng, lat]) => [lat, lng]);
                  const polygon = L.polygon(latlngs, { 
                    color: COLORS.green, 
                    weight: 2, 
                    fillOpacity: 0.2 
                  }).bindPopup(`Plan: ${item.plan_name}<br/>Status: ${item.status}`);
                  layers.plans.addLayer(polygon);
                });
              }
            } catch {}
          });
          
          // Update progress (70% - 100%)
          setLoadingProgress(70 + (i / plans.length) * 30);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        
        // Add plans layer to map
        if (activeLayers.plans) {
          leafletMap.addLayer(layers.plans);
        }
        
        return plans;
      };
      
      
      await loadPlansData();
      
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
    return () => {
      try {
        if (map) {
          map.off();
          map.remove();
        }
      } catch (e) {
        console.warn("Map cleanup error:", e);
      }
  
      // 💡 Add DOM safeguard
      if (mapContainerRef.current?._leaflet_id != null) {
        delete mapContainerRef.current._leaflet_id;
      }
  
      setMap(null); // Clear state
    };
  }, [onLayersReady]);

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
    Object.entries(activeLayers).forEach(([key, active]) => {
      if (map[key]) {
        if (active) {
          map.addLayer(map[key]);
        } else {
          map.removeLayer(map[key]);
        }      }
    });
  }, [map, activeLayers]);

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Austin Combined Transport + Planning Map</h2>
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
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'traffic' || loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'traffic' || loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Traffic
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Plans
              </div>
            </div>
          </div>
        )}
        
        {showSources && (
          <div ref={infoRef}className="absolute top-4 right-4 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in">
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
              <div>
                <a
                  href="https://data.austintexas.gov/d/phcn-uuu3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Street Maintenance
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/dn4m-2fjj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Projects
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
            <h3 className="font-semibold mb-2 text-primary">Layers</h3>
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                biking: 'biking',
                transit: 'transit',
                transport: 'blue',
                plans: 'green',
                neighborhoods: 'primary',
                buildings: 'lightblue',
                streets: 'lightblue',
                crash: 'red',
                traffic: 'orange'
              }[layer];

              const layerLabel = {
                biking: 'Biking',
                transit: 'Transit',
                neighborhoods: 'Neighborhood',
                buildings: 'Building Conditions',
                streets: 'Street Conditions',
                crash: 'Crashes',
                traffic: 'Traffic',
                transport: 'Projects',
                plans: 'Plans',
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

export default CombinedTransportPlanningMap;