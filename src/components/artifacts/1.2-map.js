import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const CrashTrafficHeatmap = ({ onLayersReady }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  
  // Enhanced loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'crashes', 'traffic', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
  

  const [activeLayers, setActiveLayers] = useState({
    crashes: true,
    traffic: true,
    buildings: true,
    streets: true,
    neighborhoods: true
  });

  const [heatmapIntensity] = useState(0.6);
  const [heatmapRadius] = useState(25);

  const COLORS = {
    red: '#E74C3C',
    yellow: '#F1C40F',
    green: '#2ECC71',
    blue: '#3498DB',
    lightblue: '#85C1E9',
    orange: '#E67E22',
    primary: '#2C3E50',
    coral: '#008080',
    white: '#FFFFFF'
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
    if (map) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  };

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const updateHeatmapSettings = () => {
    if (!map) return;
    map.crashHeatmap?.setOptions({ radius: heatmapRadius, max: heatmapIntensity });
    map.trafficHeatmap?.setOptions({ radius: heatmapRadius, max: heatmapIntensity });
  };

  useEffect(() => {
    const initializeMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Load heatmap plugin
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      document.head.appendChild(script);
      await new Promise(resolve => (script.onload = resolve));
      
      if (map || !mapContainerRef.current) return;
      
      setLoadingProgress(15);
      setLoadingStage('map');

      // Initialize base map and infrastructure in one stage
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
      
      // Initialize empty layer groups
      const crashMarkerLayer = L.layerGroup();
      const buildingMarkerLayer = L.layerGroup();
      const streetMarkerLayer = L.layerGroup();
      
      // Set map reference early
      setMap(leafletMap);
      
      // Start loading infrastructure right away
      const promises = [];
      
      // Load neighborhood data and add to map
      const neighborhoodPromise = (async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const neighborhoods = await res.json();
        const layer = L.layerGroup().addTo(leafletMap); // Add to map immediately
        
        // Add polygons in small batches
        const batchSize = Math.ceil(neighborhoods.length / 5);
        for (let i = 0; i < neighborhoods.length; i += batchSize) {
          const batch = neighborhoods.slice(i, i + batchSize);
          batch.forEach(n => {
            try {
              const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
              const polygon = L.polygon(coords, {
                color: COLORS.primary,
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0
              }).bindPopup(`<strong>${n.neighname}</strong>`);
              layer.addLayer(polygon);
            } catch {}
          });
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.neighborhoodLayer = layer;
        return layer;
      })();
      promises.push(neighborhoodPromise);

      // Load building data and add to map
      const buildingPromise = (async () => {
        const res = await fetch('/data/building-data.json');
        const data = await res.json();
        buildingMarkerLayer.addTo(leafletMap); // Add to map immediately
        
        // Add buildings in small batches
        const batchSize = Math.ceil(data.length / 5);
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          batch.forEach(b => {
            try {
              const coords = b.the_geom.coordinates[0][0];
              const lat = _.meanBy(coords, c => c[1]);
              const lng = _.meanBy(coords, c => c[0]);
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: `<div style="width:6px;height:6px;border-radius:50%;background:#008080;opacity:0.3"></div>` })
              }).bindPopup(`
                <strong>Building ID: ${b.objectid}</strong><br>
                Condition: ${(b.condition * 100).toFixed(1)}%<br>
                Height: ${b.max_height} ft<br>
                Built: ${b.source}
              `);
              buildingMarkerLayer.addLayer(marker);
            } catch {}
          });
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.buildingMarkerLayer = buildingMarkerLayer;
        return buildingMarkerLayer;
      })();
      promises.push(buildingPromise);

      // Load street data and add to map
      const streetPromise = (async () => {
        const res = await fetch('/data/street-data.json');
        const data = await res.json();
        streetMarkerLayer.addTo(leafletMap); // Add to map immediately
        
        // Add streets in small batches
        const batchSize = Math.ceil(data.length / 5);
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          batch.forEach(s => {
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
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.streetMarkerLayer = streetMarkerLayer;
        return streetMarkerLayer;
      })();
      promises.push(streetPromise);
      
      // Load all infrastructure in the background while proceeding to crash data
      Promise.all(promises).then(() => {
        // Infrastructure is fully loaded
        setLoadingProgress(35);
      });
      
      // Wait just a moment to let map initialize, then start loading crash data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and display crashes incrementally
      setLoadingStage('crashes');
      
      const crashRes = await fetch('/data/crashes-data.json');
      const crashes = await crashRes.json();
      const crashHeatData = [];
      
      // Add crash markers in batches to create visual loading effect
      const batchSize = Math.ceil(crashes.length / 10); // 10 batches
      
      for (let i = 0; i < crashes.length; i += batchSize) {
        const batch = crashes.slice(i, i + batchSize);
        
        batch.forEach(crash => {
          const lat = parseFloat(crash.latitude);
          const lng = parseFloat(crash.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            crashHeatData.push([lat, lng, crash.severity]);
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({ 
                className: '', 
                html: `<div style="width:6px;height:6px;border-radius:50%;background:#E74C3C;opacity:0.3"></div>` 
              })
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
        
        // Update loading progress
        setLoadingProgress(30 + (i / crashes.length) * 35);
        
        // Wait a bit before adding next batch
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Add crash marker layer to map
      leafletMap.crashMarkerLayer = crashMarkerLayer;
      crashMarkerLayer.addTo(leafletMap);
      
      // Now create and add crash heatmap
      const crashHeatmap = window.L.heatLayer(crashHeatData, {
        radius: heatmapRadius,
        max: heatmapIntensity,
        blur: 15,
        gradient: { 0.1: COLORS.yellow, 0.5: COLORS.orange, 0.9: COLORS.red }
      }).addTo(leafletMap);
      
      leafletMap.crashHeatmap = crashHeatmap;
      
      setLoadingProgress(65);
      await new Promise(r => setTimeout(r, 1500)); // Pause between crashes and traffic
      
      // STEP 3: Load and display traffic incrementally
      setLoadingStage('traffic');
      
      const trafficRes = await fetch('/data/traffic-data.json');
      const traffic = await trafficRes.json();
      const trafficHeatData = [];
      
      // Add traffic data in batches
      const trafficBatchSize = Math.ceil(traffic.length / 10); // 10 batches
      
      for (let i = 0; i < traffic.length; i += trafficBatchSize) {
        const batch = traffic.slice(i, i + trafficBatchSize);
        
        batch.forEach(segment => {
          const coords = segment.location?.coordinates;
          if (coords && coords.length === 2) {
            const [lng, lat] = coords;
            trafficHeatData.push([lat, lng, 1 - segment.condition]);
          }
        });
        
        // Update loading progress
        setLoadingProgress(65 + (i / traffic.length) * 35);
        
        // Wait a bit before adding next batch
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Create and add traffic heatmap
      const trafficHeatmap = window.L.heatLayer(trafficHeatData, {
        radius: heatmapRadius,
        max: heatmapIntensity,
        blur: 15,
        gradient: { 0.1: COLORS.blue, 0.5: COLORS.lightblue, 0.9: COLORS.orange }
      }).addTo(leafletMap);
      
      leafletMap.trafficHeatmap = trafficHeatmap;
      leafletMap.trafficHeatmap = trafficHeatmap;
      setLoadingProgress(100);
      
      await new Promise(r => setTimeout(r, 800)); // 👈 give time for visual update
      
      setLoadingStage('complete');
      if (onLayersReady) onLayersReady();
      if (window.setResponseReady) window.setResponseReady(true);
      
    };

    initializeMap();
    return () => map?.remove();
  }, []);
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
    const l = activeLayers;
    
    if (map.crashMarkerLayer) {
      if (l.crashes) {
        map.addLayer(map.crashMarkerLayer)
      } else{
        map.removeLayer(map.crashMarkerLayer);
      }
    }
    if (map.crashHeatmap) {
      if (l.crashes) {
        map.addLayer(map.crashHeatmap)
      } else{
        map.removeLayer(map.crashHeatmap);
      }
    }    
    
    if (map.trafficHeatmap) {
      if (l.traffic) {
        map.addLayer(map.trafficHeatmap)
      } else{
        map.removeLayer(map.trafficHeatmap);
      }
    }

    if (map.buildingMarkerLayer) {
      if (l.buildings) {
        map.addLayer(map.buildingMarkerLayer)
      } else{
        map.removeLayer(map.buildingMarkerLayer);
      }
    }
    
    if (map.streetMarkerLayer) {
      if (l.streets) {
        map.addLayer(map.streetMarkerLayer)
      } else{
        map.removeLayer(map.streetMarkerLayer);
      }
    }
    
    if (map.neighborhoodLayer) {
      if (l.neighborhoods) {
        map.addLayer(map.neighborhoodLayer)
      } else{
        map.removeLayer(map.neighborhoodLayer);
      }
    }
  }, [map, activeLayers]);

  useEffect(() => {
    updateHeatmapSettings();
  }, [heatmapRadius, heatmapIntensity, map]);
  
  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading map & infrastructure...';
      case 'crashes': return 'Loading crash data...';
      case 'traffic': return 'Loading traffic data...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Crash & Traffic Heatmap
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowLegend(prev => !prev)}
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
            }}><Layers size={20} /></button>

            <button onClick={() => setShowSources(prev => !prev)} title="View Sources"
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
              }}>
            <Info size={20} />
            </button>
          <button onClick={toggleFullScreen}
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
          }}>{isFullScreen ? <X size={20} /> : <Maximize2 size={20} />}</button>
        </div>
      </div>
      <div className="flex-1 relative">
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
            </div>
          </div>
        )}

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
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'crashes' || loadingStage === 'traffic' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Map & Infrastructure
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'crashes' || loadingStage === 'traffic' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Crashes
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'traffic' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Traffic
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
                crashes: 'red',
                traffic: 'blue',
                buildings: 'coral',
                streets: 'coral',
                neighborhoods: 'primary'
              }[layer];
              const layerLabel = {
                crashes: 'Crashes',
                traffic: 'Traffic',
                buildings: 'Building Conditions',
                streets: 'Street Conditions',
                neighborhoods: 'Neighborhoods'
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
        <p><strong>Source:</strong> Austin Crash, Traffic, and Infrastructure Data (March 2025)</p>
      </div>
    </div>
  );
};

export default CrashTrafficHeatmap;