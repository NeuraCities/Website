// TransportAndPlansMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const TransportAndPlansMap = ({ onLayersReady,  onFullscreenChange}) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'transport', 'plans', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
  
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
  const [activeLayers, setActiveLayers] = useState({
    transport: true,
    plans: true,
    neighborhoods: false,
    building: false,
    streets: false,
    crashes: false,
    traffic: false
  });

  const COLORS = {
    blue: '#9B59B6',
    green: '#27AE60',
    orange: '#E67E22',
    red: '#E74C3C',
    yellow: '#F1C40F',
    lightblue: '#85C1E9',
    primary: '#2C3E50',
    coral: '#008080',
    white: '#FFFFFF'
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
      const next = !prev;
      if (typeof onFullscreenChange === 'function') {
        onFullscreenChange(next);
      }
      return next;
    });
    setShowLegend(false);
    setTimeout(() => map?.invalidateSize(), 300);
  };

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };
  
  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'transport': return 'Loading transport data...';
      case 'plans': return 'Loading area plans...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);

      if (map || !mapContainerRef.current) return;
      
      setLoadingProgress(20);
      setLoadingStage('map');

      // Initialize base map
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

      // Create empty layer groups
      const transportLayer = L.layerGroup();
      const plansLayer = L.layerGroup();
      const neighborhoodLayer = L.layerGroup();
      const buildingMarkerLayer = L.layerGroup();
      const streetMarkerLayer = L.layerGroup();
      const crashMarkerLayer = L.layerGroup();
      const trafficMarkerLayer = L.layerGroup();
      
      // Set map reference early
      setMap(leafletMap);
      
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
              opacity: 0.6,
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
        const building = await res.json();
        building.forEach(b => {
          try {
            const coords = b.the_geom.coordinates[0][0];
            const lat = _.meanBy(coords, c => c[1]);
            const lng = _.meanBy(coords, c => c[0]);

            const marker = L.circleMarker([lat, lng], {
              radius: 3,
              fillColor: COLORS.lightblue,
              fillOpacity: 0.6,
              color: '#000',
              weight: 1
            }).bindPopup(`
              <strong>Building ID: ${b.objectid}</strong><br/>
              Elevation: ${parseFloat(b.elevation).toFixed(2)} ft
            `);
            buildingMarkerLayer.addLayer(marker);
          } catch (error) {
            console.error('Building error:', error);
          }
        });
        leafletMap.buildingMarkerLayer = buildingMarkerLayer;
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
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:#008080;opacity:0.3"></div>` })
              }).bindPopup(`
                <strong>${s.full_street_name_from_gis}</strong><br>
                Grade: ${s.final_grade}<br>
                Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}<br>
                Type: ${s.functional_class}<br>
                Pavement: ${s.pavement_type}
              `);
              streetMarkerLayer.addLayer(marker);
            });
          } catch {}
        });
        leafletMap.streetMarkerLayer = streetMarkerLayer;
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
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.red};opacity:0.3"></div>` })
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
      
      // STEP 2: Load and visibly add transport data
      setLoadingStage('transport');
      setLoadingProgress(40);
      
      const transportRes = await fetch('/data/transportmaintenance-data.json');
      const transportData = await transportRes.json();
      
      // Add transport items in batches to create visual loading effect
      const transportBatchSize = Math.ceil(transportData.length / 10); // 10 batches
      
      for (let i = 0; i < transportData.length; i += transportBatchSize) {
        const batch = transportData.slice(i, i + transportBatchSize);
        
        batch.forEach(item => {
          if (item.the_geom?.type === 'MultiLineString') {
            item.the_geom.coordinates.forEach(line => {
              const latlngs = line.map(([lng, lat]) => [lat, lng]);
              const polyline = L.polyline(latlngs, {
                color: COLORS.blue,
                weight: 3
              }).bindPopup(`
                <strong>${item.project_description}</strong><br/>
                Treatment: ${item.treatment}<br/>
                Year: ${item.year}<br/>
                Street: ${item.full_street_name}<br/>
                From: ${item.from_street} To: ${item.to_street}<br/>
                Comments: ${item.comments}
              `);
              transportLayer.addLayer(polyline);
            });
          }
        });
        
        // Update loading progress
        setLoadingProgress(40 + (i / transportData.length) * 30);
        
        // Wait a bit before adding next batch to create visual effect
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Add transport layer to map
      transportLayer.addTo(leafletMap);
      leafletMap.transportLayer = transportLayer;
      
      // Pause briefly between transport and plans data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 3: Load and visibly add plans data
      setLoadingStage('plans');
      setLoadingProgress(70);
      
      const plansRes = await fetch('/data/smallareaplans-data.json');
      const plansData = await plansRes.json();
      
      // Add plans in batches to create visual loading effect
      const plansBatchSize = Math.ceil(plansData.length / 10); // 10 batches
      
      for (let i = 0; i < plansData.length; i += plansBatchSize) {
        const batch = plansData.slice(i, i + plansBatchSize);
        
        batch.forEach(plan => {
          if (plan.the_geom?.type === 'MultiPolygon') {
            plan.the_geom.coordinates.forEach(polygonGroup => {
              const latlngs = polygonGroup[0].map(([lng, lat]) => [lat, lng]);
              const area = L.polygon(latlngs, {
                color: COLORS.green,
                weight: 2,
                fillOpacity: 0.2
              }).bindPopup(`
                <strong>${plan.plan_name}</strong><br/>
                Action: ${plan.action_i_1}<br/>
                Category: ${plan.detailed_c}<br/>
                Status: ${plan.status}
              `);
              plansLayer.addLayer(area);
            });
          }
        });
        
        // Update loading progress
        setLoadingProgress(70 + (i / plansData.length) * 30);
        
        // Wait a bit before adding next batch to create visual effect
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Add plans layer to map
      plansLayer.addTo(leafletMap);
      leafletMap.plansLayer = plansLayer;
      
      // All layers are now loaded
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
  }, [COLORS.blue, COLORS.green, COLORS.lightblue, COLORS.primary, COLORS.red, map, onLayersReady]);
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

    if (map.transportLayer) {
  if (activeLayers.transport) {
    map.addLayer(map.transportLayer);
  } else {
    map.removeLayer(map.transportLayer);
  }
}

if (map.plansLayer) {
  if (activeLayers.plans) {
    map.addLayer(map.plansLayer);
  } else {
    map.removeLayer(map.plansLayer);
  }
}

if (map.neighborhoodLayer) {
  if (activeLayers.neighborhoods) {
    map.addLayer(map.neighborhoodLayer);
  } else {
    map.removeLayer(map.neighborhoodLayer);
  }
}

if (map.buildingMarkerLayer) {
  if (activeLayers.building) {
    map.addLayer(map.buildingMarkerLayer);
  } else {
    map.removeLayer(map.buildingMarkerLayer);
  }
}

if (map.streetMarkerLayer) {
  if (activeLayers.streets) {
    map.addLayer(map.streetMarkerLayer);
  } else {
    map.removeLayer(map.streetMarkerLayer);
  }
}

if (map.crashMarkerLayer) {
  if (activeLayers.crashes) {
    map.addLayer(map.crashMarkerLayer);
  } else {
    map.removeLayer(map.crashMarkerLayer);
  }
}

if (map.trafficMarkerLayer) {
  if (activeLayers.traffic) {
    map.addLayer(map.trafficMarkerLayer);
  } else {
    map.removeLayer(map.trafficMarkerLayer);
  }
}
  }, [map, activeLayers]);

  return (
<div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white relative' : ''}`}>
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Austin Transport + Planning Map
        </h2>
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
            {isFullScreen ? <X size={20} /> : <Maximize2 size={20}  />}
          </button>
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Loading indicator that shows the current stage while keeping map visible */}
        {loadingStage !== 'complete' && (
          <div className="absolute bottom-12 right-4 flex flex-col items-center bg-white bg-opacity-90 z-10 p-4 rounded-lg shadow-lg max-w-xs border border-gray-200">
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
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'transport' || loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'transport' || loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Transport
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'plans' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Plans
              </div>
            </div>
          </div>
        )}
        
        {showSources && (
          <div ref={infoRef}className="absolute top-0 right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]">
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
            </div>
          </div>
        )}

        {showLegend && (
          <div
            className="absolute bottom-4 left-4 w-15 bg-white border rounded shadow-md p-3 text-sm resize"
            style={{ zIndex: 1000, overflow: 'auto', maxHeight: '70vh' }}
          >
            <h3 className="font-semibold mb-2 text-primary">Legend</h3>
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                transport: 'blue',
                plans: 'green',
                neighborhoods:'primary',
                building: 'lightblue',
                streets: 'lightblue',
                crashes: 'red',
                traffic: 'blue'
              }[layer];
              const layerLabel = {
                transport: 'Projects',
                plans: 'Plans',
                building: 'Building Conditions',
                streets: 'Street Conditions',
                neighborhoods: 'Neighborhoods',
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
      <div className="p-2 bg-white border-t text-xs text-gray-500">
        <p><strong>Source:</strong> Austin Transport, Planning, Crash, Traffic, and Infrastructure Data (March 2025)</p>
      </div>
    </div>
  );
};

export default TransportAndPlansMap;