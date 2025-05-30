//30.265813, -97.751391
// AreasOfConcernMap.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const AreasOfConcernMap = ({ onLayersReady, onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
    const mapInitializedRef = useRef(false);
    


    const cleanupMap = useCallback(() => {
      if (map) {
        try {
          Object.entries(map).forEach(([key, layer]) => {
            if (key.includes('Layer') && layer instanceof L.LayerGroup) {
              layer.clearLayers();
            }
          });
          map.remove();
          console.log("Map successfully removed");
        } catch (err) {
          console.error("Error cleaning up map:", err);
        }
        mapInitializedRef.current = false;
      }
    }, [map]);
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
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'concerns', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [activeLayers, setActiveLayers] = useState({
    transport: false,
    plans: false,
    neighborhood: false,
    building: false,
    street: false,
    crash: false,
    traffic: false,
    concern: true
  });

  const COLORS = {
    blue: '#9B59B6',
    green: '#27AE60',
    orange: '#E67E22',
    red: '#E74C3C',
    yellow: '#F1C40F',
    lightblue: '#85C1E9',
    primary: '#2C3E50',
    concern: '#FF0000', // Changed from black to red
    coral: '#008080',
    white: '#FFFFFF'
  };

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'concerns': return 'Identifying areas of concern...';
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
    cleanupMap();
    const initializeMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);

      if (mapInitializedRef.current || !mapContainerRef.current) return;
mapInitializedRef.current = true;
      
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
      
      // Initialize layer groups
      const layers = {
        transportLayer: L.layerGroup(),
        plansLayer: L.layerGroup(),
        neighborhoodLayer: L.layerGroup(),
        buildingLayer: L.layerGroup(),
        streetMarkerLayer: L.layerGroup(),
        crashHeatmapLayer: L.layerGroup(),
        crashMarkerLayer: L.layerGroup(),
        trafficMarkerLayer: L.layerGroup(),
        concernLayer: L.layerGroup()
      };
      
      // Store layers in the leaflet map for later reference
      Object.entries(layers).forEach(([key, layer]) => {
        leafletMap[key] = layer;
      });
      
      // Set map reference early
      setMap(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));
      
      // Function to load background data (not visible initially)
      const loadBackgroundData = async () => {
        // Load and process transport data
        const transportData = await (await fetch('/data/transportmaintenance-data.json')).json();
        transportData.forEach(item => {
          try {
            if (item.the_geom?.type === 'MultiLineString') {
              item.the_geom.coordinates.forEach(line => {
                const latlngs = line.map(([lng, lat]) => [lat, lng]);
                const polyline = L.polyline(latlngs, {
                  color: COLORS.blue,
                  weight: 3
                }).bindPopup(`
                  <strong>${item.project_description || 'Transport Project'}</strong><br/>
                  Treatment: ${item.treatment}<br/>
                  Year: ${item.year}<br/>
                  Street: ${item.full_street_name || 'N/A'}<br/>
                  From: ${item.from_street || 'N/A'} To: ${item.to_street || 'N/A'}<br/>
                  Comments: ${item.comments || 'N/A'}`);
                layers.transportLayer.addLayer(polyline);
              });
            }
          } catch {}
        });

        // Load and process plans data
        const plansData = await (await fetch('/data/smallareaplans-data.json')).json();
        plansData.forEach(plan => {
          try {
            if (plan.the_geom?.type === 'MultiPolygon') {
              plan.the_geom.coordinates.forEach(polygonGroup => {
                const latlngs = polygonGroup[0].map(([lng, lat]) => [lat, lng]);
                const area = L.polygon(latlngs, {
                  color: COLORS.green,
                  weight: 2,
                  fillOpacity: 0.2
                }).bindPopup(`
                  <strong>${plan.plan_name || 'Development Plan'}</strong><br/>
                  Action: ${plan.action_i_1 || 'N/A'}<br/>
                  Category: ${plan.detailed_c || 'N/A'}<br/>
                  Status: ${plan.status || 'N/A'}`);
                layers.plansLayer.addLayer(area);
              });
            }
          } catch {}
        });

        // Load and process neighborhoods data
        const neighborhoods = await (await fetch('/data/neighborhood-data.json')).json();
        neighborhoods.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            const polygon = L.polygon(coords, {
              color: COLORS.primary,
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname || 'Neighborhood'}</strong>`);
            layers.neighborhoodLayer.addLayer(polygon);
          } catch {}
        });
        
        // Load and process crash data
        const crashes = await (await fetch('/data/crashes-data.json')).json();
        const crashHeatData = [];
        crashes.forEach(crash => {
          try {
            const lat = parseFloat(crash.latitude);
            const lng = parseFloat(crash.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              crashHeatData.push([lat, lng, crash.severity]);
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.red};opacity:0.3"></div>` })
              }).bindPopup(`
                <strong>Crash Report</strong><br/>
                Address: ${crash.address_primary || 'N/A'}<br/>
                Severity: ${(crash.severity * 100).toFixed(0)}%<br/>
                Injuries: ${crash.tot_injry_cnt || '0'}<br/>
                Deaths: ${crash.death_cnt || '0'}<br/>
                Units: ${crash.units_involved || '0'}`);
              layers.crashMarkerLayer.addLayer(marker);
            }
          } catch {}
        });
        
        if (crashHeatData.length > 0) {
          try {
            const crashHeat = window.L.heatLayer(crashHeatData, {
              radius: 25,
              max: 0.6,
              blur: 15,
              gradient: { 0.1: COLORS.green, 0.5: COLORS.yellow, 0.9: COLORS.red }
            });
            layers.crashHeatmapLayer.addLayer(crashHeat);
          } catch (e) {
            console.error('Error creating heat map:', e);
          }
        }

        // Load and process traffic data
        const traffic = await (await fetch('/data/traffic-data.json')).json();
        traffic.forEach(segment => {
          try {
            const coords = segment.location?.coordinates;
            if (coords?.length === 2) {
              const [lng, lat] = coords;
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.blue};opacity:0.3"></div>` })
              }).bindPopup(`
                <strong>Traffic Detector</strong><br/>
                Location: ${segment.location_name || 'N/A'}<br/>
                Direction: ${segment.detector_direction || 'N/A'}<br/>
                Movement: ${segment.detector_movement || 'N/A'}<br/>
                Condition: ${(segment.condition * 100).toFixed(0)}%`);
              layers.trafficMarkerLayer.addLayer(marker);
            }
          } catch {}
        });
      };
      
      
      // Start loading background data in parallel, but don't wait for it
      const backgroundPromise = loadBackgroundData();
      
      // STEP 1: Load and add concern data (visible by default)
      setLoadingStage('concerns');
      setLoadingProgress(40);
      
      // Function to load concern data
      const loadConcernData = async () => {
        // Load building and street data for concern areas
        const [buildingData, streetData] = await Promise.all([
          fetch('/data/building-data.json').then(res => res.json()),
          fetch('/data/street-data.json').then(res => res.json())
        ]);
        
        // Process buildings data in batches
        const buildingBatchSize = Math.ceil(buildingData.length / 10); // 10 batches
        for (let i = 0; i < buildingData.length; i += buildingBatchSize) {
          const batch = buildingData.slice(i, i + buildingBatchSize);
          
          batch.forEach(b => {
            try {
              const coords = b.the_geom.coordinates[0][0];
              const lat = _.meanBy(coords, c => c[1]);
              const lng = _.meanBy(coords, c => c[0]);
              
              const elevation = parseFloat(b.elevation);
              
              // Add to buildingLayer (not visible by default)
              const buildingMarker = L.circleMarker([lat, lng], {
                radius: 4,
                fillColor: COLORS.lightblue,
                fillOpacity: 0.3,
                color: COLORS.lightblue,
                weight: 0
              }).bindPopup(`<strong>Building ID: ${b.objectid}</strong><br/>Elevation: ${elevation.toFixed(2)} ft`);
              layers.buildingLayer.addLayer(buildingMarker);
              
              // Also add to concernLayer if elevation is high
              if (elevation > 550) {
                const concernMarker = L.circleMarker([lat, lng], {
                  radius: 5,
                  fillColor: COLORS.concern,
                  fillOpacity: 0.5,
                  color: COLORS.concern,
                  weight: 1
                }).bindPopup(`<strong>Concern Area</strong><br/>Building ID: ${b.objectid}<br/>Elevation: ${elevation.toFixed(2)} ft<br/><span style="color:${COLORS.concern}">High Elevation</span>`);
                layers.concernLayer.addLayer(concernMarker);
              }
            } catch {}
          });
          
          // Update progress (40% - 70%)
          setLoadingProgress(40 + (i / buildingData.length) * 30);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        
        // Process streets data in batches
        const streetBatchSize = Math.ceil(streetData.length / 10); // 10 batches
        for (let i = 0; i < streetData.length; i += streetBatchSize) {
          const batch = streetData.slice(i, i + streetBatchSize);
          
          batch.forEach(s => {
            try {
              const coords = s.the_geom.coordinates[0].map(([lng, lat]) => [lat, lng]);
              
              // Add to streetMarkerLayer (not visible by default)
              coords.forEach(([lat, lng]) => {
                const marker = L.marker([lat, lng], {
                  icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:#008080;opacity:0.3"></div>` })
                }).bindPopup(`
                  <strong>${s.full_street_name_from_gis || 'Street'}</strong><br>
                  Grade: ${s.final_grade || 'N/A'}<br>
                  Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}<br>
                  Type: ${s.functional_class || 'N/A'}<br>
                  Pavement: ${s.pavement_type || 'N/A'}`);
                layers.streetMarkerLayer.addLayer(marker);
              });
              
              // Add streets with 'F' grade to concern areas
              if (s.final_grade === 'F') {
                const polyline = L.polyline(coords, {
                  color: COLORS.concern,
                  weight: 4,
                  opacity: 0.8,
                }).bindPopup(`<strong>Concern Area</strong><br/>Street: ${s.full_street_name_from_gis || 'Street'}<br/>Final Grade: F<br/><span style="color:${COLORS.concern}">Poor Condition</span>`);
                layers.concernLayer.addLayer(polyline);
              }
            } catch {}
          });
          
          // Update progress (70% - 95%)
          setLoadingProgress(70 + (i / streetData.length) * 25);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
        
        // Add manual concern data point
        const manualConcernPoint = L.circleMarker([30.265813, -97.751391], {
          radius: 6,
          fillColor: COLORS.concern,
          fillOpacity: 0.7,
          color: COLORS.concern,
          weight: 1
        }).bindPopup(`<strong>Critical Concern Area</strong><br/>Lat: 30.265813<br/>Lng: -97.751391<br/><span style="color:${COLORS.concern}">Priority Location</span>`);
        
        layers.concernLayer.addLayer(manualConcernPoint);
        
        // Add concernLayer to map (visible by default)
        setLoadingProgress(100);
    setLoadingStage('complete');
    if (onLayersReady) {
      onLayersReady();
    }
    
    if (window.setResponseReady) {
      window.setResponseReady(true);
    }
      };
      
      await loadConcernData();
      
      // Wait for background loading to complete (optional)
      await backgroundPromise;
    };
    if (!mapInitializedRef.current) {
      initializeMap();
    }
    return () => {
      cleanupMap();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

useEffect(() => {
  return () => {
    cleanupMap();
  };
}, [cleanupMap]);

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
    if (!map) return;
    Object.entries(map).forEach(([key, layer]) => {
      if (layer instanceof L.LayerGroup) {
        const shortKey = key
          .replace('MarkerLayer', '')
          .replace('HeatmapLayer', '')
          .replace('Layer', '');
        
          if (activeLayers[shortKey]) {
            map.addLayer(layer);
          } else {
            map.removeLayer(layer);
          }      }
    });
  }, [map, activeLayers]);

  return (
<div className={`flex flex-col h-full ${isFullScreen ? 'inset-0 z-50 bg-white relative' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Austin Areas of Concern Map
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
            <div className="grid grid-cols-2 gap-1 mt-2 w-full">
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'concerns' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'concerns' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Concern Areas
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
                  href="https://data.austintexas.gov/d/dn4m-2fjj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Projects
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/g5k8-8sud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Budget
                </a>
              </div>
            </div>
          </div>
        )}
        
        {showLegend && (
          <div className="absolute bottom-4 left-4 w-15 bg-white border rounded shadow-md p-3 text-sm resize"
            style={{ zIndex: 1000, overflow: 'auto', maxHeight: '70vh' }}
          >
            <h3 className="font-semibold mb-2 text-primary">Layers</h3>
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                transport: 'blue',
                plans: 'green',
                neighborhood: 'primary',
                building: 'lightblue',
                street: 'lightblue',
                crash: 'red',
                traffic: 'blue',
                concern: 'concern'
              }[layer];

              const layerLabel = {
                transport: 'Projects',
                plans: 'Plans',
                building: 'Building Conditions',
                street: 'Street Conditions',
                neighborhood: 'Neighborhoods',
                crash: 'Crashes',
                traffic: 'Traffic',
                concern: 'Priority'
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

export default AreasOfConcernMap;