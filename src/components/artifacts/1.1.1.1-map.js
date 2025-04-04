import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const COLOR_PALETTE = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
  '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

const COLORS = {
  coral: '#008080',
  white: 'FFFFFF'
};

const getZoningColorMapWithOthers = (items, topN = 3) => {
  const counts = _.countBy(items);
  const sortedKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const topKeys = sortedKeys.slice(0, topN);
  

  const colorMap = {};
  topKeys.forEach((key, index) => {
    colorMap[key] = COLOR_PALETTE[index % COLOR_PALETTE.length];
  });

  colorMap['Other'] = '#cccccc';
  return { colorMap, topKeys };
};

const LandUseZoningMap = ({ onLayersReady, onFullscreenChange  }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const infoRef = useRef(null);
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'zoning', 'landuse', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [zoningColorMap, setZoningColorMap] = useState({});
  const [showSources, setShowSources] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    landuse: true,
    zoning: true,
    neighborhoods: false,
    buildings: false,
    streets: false,
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

  const setNeighborhoodLayer = useState(null)[1];
  const [, setBuildingMarkerLayer] = useState(null);
  const [, setStreetMarkerLayer] = useState(null);

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'zoning': return 'Loading zoning data...';
      case 'landuse': return 'Loading land use data...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };

  const toggleFullScreen = () => {
    // First, get the new state
    const newFullscreenState = !isFullScreen;
    
    // Update the state
    setIsFullScreen(newFullscreenState);
    
    if (typeof onFullscreenChange === 'function') {
      onFullscreenChange(newFullscreenState);
    }
    
    setShowLegend(false);
    setTimeout(() => map?.invalidateSize(), 300);
  };
  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

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
    const initializeMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
  
      if (map || !mapRef.current) return;
      
      setLoadingProgress(20);
      setLoadingStage('map');
  
      const leafletMap = L.map(mapRef.current, {
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
      L.control.attribution({ position: 'bottomright' }).addTo(leafletMap);
  
      // Create layer groups
      const landuseLayer = L.layerGroup();
      const zoningLayer = L.layerGroup();
      
      // Set map reference early
      setMap(leafletMap);
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));
      
      // Load background data in the background (for layers that will be hidden by default)
      const bgPromises = [];
      
      // Load neighborhoods, buildings, and streets in background
      const fetchAndLoadNeighborhoods = async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const data = await res.json();
        const layer = L.layerGroup();
  
        data.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            const polygon = L.polygon(coords, {
              color: '#2C3E50',
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname}</strong>`);
            layer.addLayer(polygon);
          } catch {}
        });
  
        leafletMap.neighborhoodLayer = layer;
        setNeighborhoodLayer(layer);
        return layer;
      };
      
      const fetchAndLoadBuildings = async () => {
        const res = await fetch('/data/building-data.json');
        const data = await res.json();
        const layer = L.layerGroup();
  
        data.forEach(b => {
          try {
            const coords = b.the_geom.coordinates[0][0];
            const lat = _.meanBy(coords, c => c[1]);
            const lng = _.meanBy(coords, c => c[0]);
  
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: '',
                html: `<div style="width:6px;height:6px;border-radius:50%;background:#008080;opacity:0.3"></div>`
              })
            }).bindPopup(`
              <strong>Building ID:</strong> ${b.objectid}<br/>
              Condition: ${(b.condition * 100).toFixed(1)}%<br/>
              Height: ${b.max_height} ft<br/>
              Built: ${b.source}
            `);
  
            layer.addLayer(marker);
          } catch {}
        });
  
        leafletMap.buildingMarkerLayer = layer;
        setBuildingMarkerLayer(layer);
        return layer;
      };
      
      const fetchAndLoadStreets = async () => {
        const res = await fetch('/data/street-data.json');
        const data = await res.json();
        const layer = L.layerGroup();
  
        data.forEach(s => {
          try {
            s.the_geom.coordinates[0].forEach(coord => {
              const [lng, lat] = coord;
              const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: '',
                  html: `<div style="width:6px;height:6px;border-radius:50%;background:#008080;opacity:0.3"></div>`
                })
              }).bindPopup(`
                <strong>${s.full_street_name_from_gis}</strong><br/>
                Grade: ${s.final_grade}<br/>
                Condition: ${s.street_condition === '1' ? 'Good' : 'Poor'}<br/>
                Type: ${s.functional_class}<br/>
                Pavement: ${s.pavement_type}
              `);
              layer.addLayer(marker);
            });
          } catch {}
        });
  
        leafletMap.streetMarkerLayer = layer;
        setStreetMarkerLayer(layer);
        return layer;
      };
      
      // Start loading background data
      bgPromises.push(fetchAndLoadNeighborhoods());
      bgPromises.push(fetchAndLoadBuildings());
      bgPromises.push(fetchAndLoadStreets());
      
      // Load these in the background
      Promise.all(bgPromises);
      
      // STEP 1: Load and visibly add zoning data
      setLoadingStage('zoning');
      setLoadingProgress(30);
      
      const loadZoning = async () => {
        const res = await fetch('/data/zoning-data.json');
        const data = await res.json();
        const filteredData = data.filter(f => f.zoning_ordinance_ztype !== undefined);
        const zoningKeys = filteredData.map(f => f.zoning_ordinance_ztype.substring(0, 2));
        const { colorMap, topKeys } = getZoningColorMapWithOthers(zoningKeys);
        setZoningColorMap(colorMap);
        
        // Add zoning items in batches to create visual loading effect
        const batchSize = Math.ceil(filteredData.length / 10); // 10 batches
        
        for (let i = 0; i < filteredData.length; i += batchSize) {
          const batch = filteredData.slice(i, i + batchSize);
          
          batch.forEach(feature => {
            const coords = feature.the_geom?.coordinates?.[0]?.[0];
            if (coords) {
              const ztype = feature.zoning_ordinance_ztype;
              const key = ztype.substring(0, 2);
              const color = colorMap[topKeys.includes(key) ? key : 'Other'];
  
              const polygon = L.polygon(coords.map(([lng, lat]) => [lat, lng]), {
                color,
                weight: 1,
                fillOpacity: 0.3
              }).bindPopup(`
                <strong>Zoning Type:</strong> ${ztype}<br />
                <strong>Case Number:</strong> ${feature.case_number}<br />
                <a href="${feature.zoning_ordinance_path}" target="_blank" rel="noopener noreferrer">View Ordinance</a>
              `);
              zoningLayer.addLayer(polygon);
            }
          });
          
          // Update loading progress
          setLoadingProgress(30 + (i / filteredData.length) * 35);
          
          // Wait a bit before adding next batch to create visual effect
          await new Promise(r => setTimeout(r, 30));
        }
        
        // Add zoning layer to map
        zoningLayer.addTo(leafletMap);
        leafletMap.zoningLayer = zoningLayer;
      };
      
      await loadZoning();
      
      // Pause briefly between zoning and landuse data
      await new Promise(r => setTimeout(r, 500));
      
      // STEP 2: Load and visibly add landuse data
      setLoadingStage('landuse');
      setLoadingProgress(65);
      
      const loadLandUse = async () => {
        const res = await fetch('/data/landuse-data.json');
        const data = await res.json();
        const filteredData = data.filter(f => f.neighborhood_planning_area !== undefined);
        const defaultColor = '#8e44ad';
        
        // Add landuse items in batches to create visual loading effect
        const batchSize = Math.ceil(filteredData.length / 10); // 10 batches
        
        for (let i = 0; i < filteredData.length; i += batchSize) {
          const batch = filteredData.slice(i, i + batchSize);
          
          batch.forEach(feature => {
            const coords = feature.the_geom?.coordinates?.[0]?.[0];
            if (coords) {
              const neighborhood = feature.neighborhood_planning_area;
              const polygon = L.polygon(coords.map(([lng, lat]) => [lat, lng]), {
                color: defaultColor,
                weight: 1,
                fillOpacity: 0.3
              }).bindPopup(`
                <strong>Neighborhood:</strong> ${neighborhood}<br />
                <strong>Land Use Code:</strong> ${feature.future_land_use}<br />
                <strong>Area:</strong> ${parseFloat(feature.shape_area).toFixed(1)} sq ft
              `);
              landuseLayer.addLayer(polygon);
            }
          });
          
          // Update loading progress
          setLoadingProgress(65 + (i / filteredData.length) * 35);
          
          // Wait a bit before adding next batch to create visual effect
          await new Promise(r => setTimeout(r, 30));
        }
        
        // Add landuse layer to map
        landuseLayer.addTo(leafletMap);
        leafletMap.landuseLayer = landuseLayer;
      };
      
      await loadLandUse();
      
      setLoadingProgress(100);
    setLoadingStage('complete');
    
    // Notify parent component that all layers are ready
    // This is the key line that triggers the response to show
    if (onLayersReady) {
      onLayersReady();
    }
    
    // If window.setResponseReady exists (global callback), call it too
    if (window.setResponseReady) {
      window.setResponseReady(true);
    }
  };
  
    initializeMap();
    return () => map?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (!map) return;
    if (map.landuseLayer) {
      if (activeLayers.landuse) {
        map.addLayer(map.landuseLayer);
      } else {
        map.removeLayer(map.landuseLayer);
      }
    }
    if (map.zoningLayer) {
      if (activeLayers.zoning) {
        map.addLayer(map.zoningLayer);
      } else {
        map.removeLayer(map.zoningLayer);
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
      if (activeLayers.buildings) {
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
    
  }, [map, activeLayers]);
  
  return (
<div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''} ${isFullScreen ? 'relative' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Austin Land Use & Zoning Map</h2>
        <div className="flex items-center space-x-2">
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
        <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />
        
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
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Layer indicators */}
            <div className="grid grid-cols-3 gap-1 mt-2 w-full z-100">
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'zoning' || loadingStage === 'landuse' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Base Map
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'zoning' || loadingStage === 'landuse' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Zoning
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'landuse' || loadingStage === 'complete' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
                Land Use
              </div>
            </div>
          </div>
        )}
        
        {showSources && (
          <div ref={infoRef}className="absolute top-full right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]" style={{top:'10px'}}>
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
                <span className="font-medium">Building Condition Data:</span>{' '}
                <a>
                  Building Condition data(contains building footprints, maintenance details, conditions, and year built)
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
                  href="https://data.austintexas.gov/stories/s/Austin-Demographic-Data-Hub/3wck-mabg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Demographic
                </a>
              </div>
              <div>
                <a
                  href="https://docs.google.com/document/d/1P8aDfU6qj_Ao7Ql3v8YJ9dkq0vqDJ8cTk_Y3GMkMOUM/edit?tab=t.0#heading=h.p2fewxb06id2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Austin Office of Resilience 2023, A path to create a Resilience Hub Network in Austin
                </a>
              </div>
              <div>
                <a
                  href="https://www.austintexas.gov/sites/default/files/files/Sustainability/Climate%20Equity%20Plan/Climate%20Equity%20Plan%20Full%20Document__FINAL.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Austin Climate Equity Plan
                </a>
              </div>
              <div>
                <a
                  href="https://www.opengovpartnership.org/documents/inception-report-action-plan-austin-united-states-2024-2028/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Inception Report – Action plan – Austin, United States, 2024 – 2028
                </a>
              </div>
              <div>
                <a
                  href="https://services.austintexas.gov/edims/document.cfm?id=254319"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Flood Mitigation Task Force-Final Report to Austin City Council Codes
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/q3y3-ungd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Zoning
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/4etb-jk4d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Land use
                </a>
              </div>
            </div>
          </div>
        )}

        {showLegend && (
          <div
            className="absolute bottom-4 left-4 bg-white border rounded shadow-md p-3 text-sm resize"
            style={{ zIndex: 1000, overflow: 'auto', maxHeight: '70vh', width: '220px' }}
          >
            <h3 className="font-semibold mb-2 text-primary">Legend</h3>

            {[
              { layer: 'landuse', label: 'Land Use', color: '#8e44ad' },
              { layer: 'zoning', label: 'Zoning', color: null },
              { layer: 'neighborhoods', label: 'Neighborhood Boundaries', color: '#2C3E50' },
              { layer: 'buildings', label: 'Building Conditions', color: '#008080' },
              { layer: 'streets', label: 'Street Conditions', color: '#008080' },
            ].map(({ layer, label, color }) => (
              <div key={layer} className="mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={activeLayers[layer]}
                    onChange={() => toggleLayer(layer)}
                  />
                  {activeLayers[layer] && color && (
                    <span
                      style={{
                        backgroundColor: color,
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        display: 'inline-block'
                      }}
                    />
                  )}
                  <span>{label}</span>
                </label>
                {layer === 'zoning' && activeLayers.zoning && (
                  <div className="ml-5 mt-2 flex items-center flex-wrap gap-1">
                    {Object.entries(zoningColorMap).map(([key, zoningColor]) => (
                      <div key={key} className="flex items-center space-x-1">
                        <span
                          style={{
                            backgroundColor: zoningColor,
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            display: 'inline-block'
                          }}
                        />
                        <span className="text-xs">{key}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default LandUseZoningMap;