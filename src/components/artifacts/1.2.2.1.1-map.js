import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const CombinedTransportPlanningFloodMap = ({onLayersReady,onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'floodplains', 'priority', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add explicit loading state

  const [activeLayers, setActiveLayers] = useState({
    biking: false,
    transit: false,
    transport: false,
    plans: false,
    neighborhoods: false,
    buildings: false,
    streets: false,
    crash: false,
    traffic: false,
    floodplains: true,
    priority: true,
  });
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

  const COLORS = {
    biking: '#008080',
    transit: '#FF5747',
    transport: '#9B59B6',
    plans: '#27AE60',
    neighborhoods: '#3498DB',
    buildings: '#008080',
    streets: '#008080',
    crash: '#E74C3C',
    traffic: '#3498DB',
    floodplains: '#0074D9',
    priority: '#FF0000',
    primary: '#2C3E50',
    coral: '#008080',
    white: '#FFFFFF'
  };

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'floodplains': return 'Loading floodplain data...';
      case 'priority': return 'Identifying priority areas...';
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
    const currentRef = mapContainerRef.current;
    const initializeMap = async () => {
      setIsLoading(true); // Set loading state to true initially
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

      // Initialize layer groups
      const layers = {
        biking: L.layerGroup(),
        transit: L.layerGroup(),
        transport: L.layerGroup(),
        plans: L.layerGroup(),
        neighborhoods: L.layerGroup(),
        buildings: L.layerGroup(),
        streets: L.layerGroup(),
        crashMarkers: L.layerGroup(),
        trafficMarkers: L.layerGroup(),
        floodplains: L.layerGroup(),
        priority: L.layerGroup(),
      };
      
      // Store layers in the leaflet map for later reference
      Object.entries(layers).forEach(([key, layer]) => {
        leafletMap[key] = layer;
      });
      
      // Set map reference early
      setMap(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));

      // Helper function to fetch data
      const fetchData = async (path) => {
        const response = await fetch(path);
        return await response.json();
      };
      
      // Function to load background data (not visible initially)
      const loadBackgroundData = async () => {
        const [biking, transit, transport, plans, neighborhoods, crash, traffic] = await Promise.all([
          fetchData('/data/bikingfacilities-data.json'),
          fetchData('/data/transitcorridors-data.json'),
          fetchData('/data/transportmaintenance-data.json'),
          fetchData('/data/smallareaplans-data.json'),
          fetchData('/data/neighborhood-data.json'),
          fetchData('/data/crashes-data.json'),
          fetchData('/data/traffic-data.json')
        ]);
        
        // Process biking data
        biking.forEach(item => {
          try {
            item.the_geom?.coordinates?.forEach(line => {
              const latlngs = line.map(c => [c[1], c[0]]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.biking,
                weight: 3,
                opacity: 0.8
              }).bindPopup(`<strong>${item.full_street_name || 'Unnamed'}</strong><br/>Facility: ${item.bicycle_facility}<br/>Comfort: ${item.bike_level_of_comfort}`);
              layers.biking.addLayer(polyline);
            });
          } catch {}
        });

        // Process transit data
        transit.forEach(item => {
          try {
            item.the_geom?.coordinates?.forEach(line => {
              const latlngs = line.map(c => [c[1], c[0]]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.transit,
                weight: 3,
                opacity: 0.8
              }).bindPopup(`<strong>${item.street_name}</strong><br/>Type: ${item.corridor_type}`);
              layers.transit.addLayer(polyline);
            });
          } catch {}
        });

        // Process transport data
        transport.forEach(item => {
          try {
            item.the_geom?.coordinates?.forEach(line => {
              const latlngs = line.map(([lng, lat]) => [lat, lng]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.transport,
                weight: 3
              }).bindPopup(`<strong>${item.project_description || 'Transport Project'}</strong><br/>Treatment: ${item.treatment}<br/>Year: ${item.year}`);
              layers.transport.addLayer(polyline);
            });
          } catch {}
        });

        // Process plans data
        plans.forEach(plan => {
          try {
            plan.the_geom?.coordinates?.forEach(polygonGroup => {
              const latlngs = polygonGroup[0].map(([lng, lat]) => [lat, lng]);
              const polygon = L.polygon(latlngs, {
                color: COLORS.plans,
                weight: 2,
                fillOpacity: 0.2
              }).bindPopup(`<strong>${plan.plan_name}</strong><br/>Status: ${plan.status}`);
              layers.plans.addLayer(polygon);
            });
          } catch {}
        });

        // Process neighborhoods data
        neighborhoods.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            layers.neighborhoods.addLayer(L.polygon(coords, { 
              color: COLORS.primary, 
              weight: 2, 
              fillOpacity: 0 
            }).bindPopup(`<strong>${n.neighname}</strong>`));
          } catch {}
        });

        // Process crash data
        crash.forEach(c => {
          try {
            const lat = parseFloat(c.latitude);
            const lng = parseFloat(c.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              layers.crashMarkers.addLayer(
                L.marker([lat, lng], {
                  icon: L.divIcon({
                    className: '',
                    html: `<div style="width:10px;height:10px;border-radius:50%;background:${COLORS.crash};opacity:0.8"></div>`
                  })
                }).bindPopup(`
                  <strong>Crash Report</strong><br/>
                  Address: ${c.address_primary}<br/>
                  Severity: ${(c.severity * 100).toFixed(0)}%<br/>
                  Injuries: ${c.tot_injry_cnt}<br/>
                  Deaths: ${c.death_cnt}<br/>
                  Units: ${c.units_involved}
                `)
              );
            }
          } catch {}
        });

        // Process traffic data
        traffic.forEach(segment => {
          try {
            const coords = segment.location?.coordinates;
            if (coords?.length === 2) {
              const [lng, lat] = coords;
              layers.trafficMarkers.addLayer(
                L.circleMarker([lat, lng], {
                  radius: 6,
                  fillColor: COLORS.traffic,
                  color: COLORS.traffic,
                  weight: 1,
                  opacity: 0.8,
                  fillOpacity: 0.6
                }).bindPopup(`
                  <strong>Traffic Data</strong><br/>
                  Condition: ${segment.condition}<br/>
                  Segment: ${segment.segment_name || 'Unknown'} 
                `)
              );
            }
          } catch {}
        });
      };
      
      // Start loading background data in parallel, but don't wait for it
      const backgroundPromise = loadBackgroundData();
      
      // STEP 1: Load and add floodplains data (visible by default)
      setLoadingStage('floodplains');
      setLoadingProgress(30);
      
      const loadFloodplainsData = async () => {
        const floodplains = await fetchData('/data/floodplains-data.json');
        
        // Process floodplains data in batches to show visual loading
        const batchSize = Math.ceil(floodplains.length / 10); // 10 batches
        
        for (let i = 0; i < floodplains.length; i += batchSize) {
          const batch = floodplains.slice(i, i + batchSize);
          
          batch.forEach(f => {
            try {
              const coordsList = f.the_geom.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]));
              const polygon = L.polygon(coordsList, {
                color: COLORS.floodplains,
                fillOpacity: 0.4,
                weight: 1
              }).bindPopup(`Flood Zone: ${f.flood_zone}<br/>Drainage ID: ${f.drainage_id}`);
              layers.floodplains.addLayer(polygon);
            } catch {}
          });
          
          // Update progress (30% - 65%)
          setLoadingProgress(30 + (i / floodplains.length) * 35);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        
        // Add floodplains layer to map
        if (activeLayers.floodplains) {
          leafletMap.addLayer(layers.floodplains);
        }
        
        return floodplains;
      };
      
      const floodplainsData = await loadFloodplainsData();
      
      // Pause briefly between floodplains and priority data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and add priority data (visible by default)
      setLoadingStage('priority');
      setLoadingProgress(65);
      
      const loadPriorityData = async () => {
        // Fetch building and street data
        const [buildings, streets] = await Promise.all([
          fetchData('/data/building-data.json'),
          fetchData('/data/street-data.json')
        ]);
        
        // Process buildings data in batches
        const buildingBatchSize = Math.ceil(buildings.length / 10);
        for (let i = 0; i < buildings.length; i += buildingBatchSize) {
          const batch = buildings.slice(i, i + buildingBatchSize);
          
          batch.forEach(b => {
            try {
              const coords = b.the_geom.coordinates[0][0];
              const lat = _.meanBy(coords, c => c[1]);
              const lng = _.meanBy(coords, c => c[0]);
              
              // Add regular buildings to the 'buildings' layer (not visible by default)
              layers.buildings.addLayer(L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: COLORS.buildings,
                color: COLORS.buildings,
                weight: 0,
                fillOpacity: 0.5,
              }).bindPopup(`<strong>Building ID: ${b.objectid}</strong><br/>Condition: ${(b.condition * 100).toFixed(1)}%`));
              
              // Add priority buildings to the 'priority' layer (condition < 0.75)
              if (b.condition < 0.75) {
                layers.priority.addLayer(L.circleMarker([lat, lng], {
                  radius: 6,
                  fillColor: COLORS.priority,
                  color: COLORS.priority,
                  weight: 0,
                  fillOpacity: 0.5,
                }).bindPopup(`<strong>Priority Building ID: ${b.objectid}</strong><br/>Condition: ${(b.condition * 100).toFixed(1)}%<br/><span style="color:#FF0000">Poor Condition</span>`));
              }
            } catch {}
          });
          
          // Update progress (65% - 82.5%)
          setLoadingProgress(65 + (i / buildings.length) * 17.5);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
        
        // Helper function to check if a point is inside a polygon
        function isPointInPolygon(point, poly) {
          // Ray-casting algorithm
          let inside = false;
          const x = point[0], y = point[1];
          
          for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i][0], yi = poly[i][1];
            const xj = poly[j][0], yj = poly[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          
          return inside;
        }
        
        // Process streets data in batches
        const streetBatchSize = Math.ceil(streets.length / 10);
        for (let i = 0; i < streets.length; i += streetBatchSize) {
          const batch = streets.slice(i, i + streetBatchSize);
          
          batch.forEach(s => {
            try {
              // Add regular streets to the 'streets' layer (not visible by default)
              s.the_geom.coordinates[0].forEach(coord => {
                const [lng, lat] = coord;
                layers.streets.addLayer(L.circleMarker([lat, lng], {
                  radius: 4,
                  fillColor: COLORS.streets,
                  color: COLORS.streets,
                  weight: 0,
                  fillOpacity: 0.3
                }).bindPopup(`<strong>Street: ${s.full_street_name_from_gis}</strong><br/>Grade: ${s.final_grade}<br/>Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}`));
              });
              
              // Now we'll create priority markers only once per point, with proper labeling
              const isPoorCondition = s.final_grade === 'F';
              
              // First check which individual coordinate points overlap with floodplains
              // We'll keep track of which coordinates are in a floodplain
              const coordsInFloodplain = {};
              
              if (s.the_geom && s.the_geom.coordinates && s.the_geom.coordinates[0]) {
                s.the_geom.coordinates[0].forEach((coord) => {
                  const [lng, lat] = coord;
                  const coordKey = `${lat},${lng}`;
                  coordsInFloodplain[coordKey] = false;
                  
                  // Check each floodplain for point-in-polygon
                  floodplainsData.forEach(f => {
                    try {
                      if (f.the_geom && f.the_geom.coordinates && f.the_geom.coordinates[0]) {
                        // Convert polygon to the right format
                        const polygonPoints = f.the_geom.coordinates[0].map(c => [c[1], c[0]]);
                        // Check if point is inside polygon
                        if (isPointInPolygon([lat, lng], polygonPoints)) {
                          coordsInFloodplain[coordKey] = true;
                        }
                      }
                    } catch {}
                  });
                });
              }
              
              // Now create markers with appropriate labels
              s.the_geom.coordinates[0].forEach(coord => {
                const [lng, lat] = coord;
                const coordKey = `${lat},${lng}`;
                const isInFloodplain = coordsInFloodplain[coordKey];
                
                // Only add to priority layer if it's a poor condition OR in a floodplain
                if (isPoorCondition || isInFloodplain) {
                  let popupContent = `<strong>Priority Street: ${s.full_street_name_from_gis}</strong><br/>`;
                  
                  // Add appropriate reason labels
                  if (isPoorCondition) {
                    popupContent += `Grade: F<br/>`;
                    popupContent += `<span style="color:#FF0000">Poor Condition</span>`;
                  }
                  
                  // Only add floodplain message if this specific point is in a floodplain
                  if (isInFloodplain) {
                    if (isPoorCondition) popupContent += `<br/>`; // Add line break if we already have poor condition
                    popupContent += `<span style="color:#FF0000">Overlaps with Floodplain</span>`;
                  }
                  
                  layers.priority.addLayer(L.circleMarker([lat, lng], {
                    radius: 4,
                    fillColor: COLORS.priority,
                    color: COLORS.priority,
                    weight: 0,
                    fillOpacity: 0.5
                  }).bindPopup(popupContent));
                }
              });
            } catch (error) {
              console.error("Error processing street:", error);
            }
          });
          
          // Update progress (82.5% - 100%)
          setLoadingProgress(82.5 + (i / streets.length) * 17.5);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
        
        // Add priority layer to map
        if (activeLayers.priority) {
          leafletMap.addLayer(layers.priority);
        }
      };
      
      await loadPriorityData();
      
      // Set loading to 100% complete
      setLoadingProgress(100);
      setLoadingStage('complete');
      
      // Add a delay before hiding the loading indicator
      setTimeout(() => {
        setIsLoading(false); // This will hide the loading indicator
      }, 1000);
      
      if (onLayersReady) {
        onLayersReady();
      }
      
      if (window.setResponseReady) {
        window.setResponseReady(true);
      }
      
      // Wait for background loading to complete (optional)
      await backgroundPromise;
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
  
      if (currentRef?._leaflet_id != null) {
        delete currentRef._leaflet_id;
      }
  
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    Object.entries(map).forEach(([key, layer]) => {
      if (layer instanceof L.LayerGroup) {
        const baseKey = key
          .replace('Markers', '')
          .toLowerCase();
        
        // Handle plural forms for layer names
        const isVisible = activeLayers[baseKey] || activeLayers[baseKey + 's'] || activeLayers[baseKey.replace(/s$/, '')];
        
        if (isVisible) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      }
    });
  }, [map, activeLayers]);

  return (
<div className={`flex flex-col h-full ${isFullScreen ? 'inset-0 z-50 bg-white relative' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Austin Combined Map with Floodplains</h2>
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
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'floodplains' || loadingStage === 'priority' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'floodplains' || loadingStage === 'priority' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Floodplains
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'priority' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Priority
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
              <div>
                <a
                  href="https://www.grants.gov/search-results-detail/358006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  FEMA
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
                transport: 'transport',
                plans: 'plans',
                neighborhoods: 'primary',
                buildings: 'buildings',
                streets: 'streets',
                crash: 'crash',
                traffic: 'traffic',
                floodplains: 'floodplains',
                priority: 'priority'
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
                floodplains: 'Floodplains',
                priority: 'Priority'
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
                        backgroundColor: layer === 'priority' ? '#FF0000' : COLORS[colorKey],
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

export default CombinedTransportPlanningFloodMap;