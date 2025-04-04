import React, { useEffect, useState, useRef } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

// Add onLayersReady prop to the component definition
const HighPriorityInfrastructureMap = ({ onLayersReady, onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);
  
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'concerns', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [activeLayers, setActiveLayers] = useState({
    concern: true,
    neighborhood: false,
    building: false,
    street: false,
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
    concern: '#E74C3C',
    neighborhood: '#2C3E50',
    building: '#3498DB',
    street: '#F1C40F',
    coral: '#008080',
    white: '#FFFFFF',
    primary: '#2C3E50'
  };

  // Get loading status message
  const getLoadingMessage = () => {
    switch(loadingStage) {
      case 'initializing': return 'Initializing map...';
      case 'map': return 'Loading base map...';
      case 'concerns': return 'Identifying priority infrastructure...';
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
    const initMap = async () => {
      setLoadingStage('initializing');
      setLoadingProgress(10);
      
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
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

      // Initialize empty layer groups
      const layers = {
        neighborhoodLayer: L.layerGroup(),
        buildingLayer: L.layerGroup(),
        streetLayer: L.layerGroup(),
        concernLayer: L.layerGroup(),
      };
      
      // Set map reference early
      setMap({ leafletMap, layers });
      
      // Wait a moment for the base map to render
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingProgress(40);
      
      
      
      // Load neighborhoods, base buildings, and streets in background
      const fetchNeighborhoods = async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const data = await res.json();
        data.forEach(n => {
          try {
            const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
            L.polygon(coords, {
              color: COLORS.neighborhood,
              weight: 2,
              fillOpacity: 0
            }).bindPopup(`<strong>${n.neighname}</strong>`).addTo(layers.neighborhoodLayer);
          } catch {}
        });
        return data;
      };
      
      fetchNeighborhoods();      
      // STEP 1: Load and process concern areas
      setLoadingStage('concerns');
      setLoadingProgress(50);
      
      const processBuildingConcerns = async () => {
        const res = await fetch('/data/building-data.json');
        const buildingData = await res.json();
        
        // Process buildings in batches to show visual loading
        const batchSize = Math.ceil(buildingData.length / 10); // 10 batches
        
        for (let i = 0; i < buildingData.length; i += batchSize) {
          const batch = buildingData.slice(i, i + batchSize);
          
          batch.forEach(b => {
            try {
              const coords = b.the_geom.coordinates[0][0];
              const lat = _.meanBy(coords, c => c[1]);
              const lng = _.meanBy(coords, c => c[0]);
              const isConcern = b.condition < 0.75;
              
              // Add to building layer (hidden by default)
              if (!isConcern) {
                L.circleMarker([lat, lng], {
                  radius: 4,
                  color: COLORS.building,
                  fillOpacity: 0.5,
                }).bindPopup(`
                  <strong>Building ID:</strong> ${b.objectid}<br>
                  Condition: ${(b.condition * 100).toFixed(1)}%
                `).addTo(layers.buildingLayer);
              } 
              // Add to concern layer (visible by default)
              else {
                L.circleMarker([lat, lng], {
                  radius: 6,
                  color: COLORS.concern,
                  fillOpacity: 0.8,
                }).bindPopup(`
                  <strong>Building ID:</strong> ${b.objectid}<br>
                  Condition: ${(b.condition * 100).toFixed(1)}%<br>
                  <span class="text-primary font-semibold">High Priority</span>
                `).addTo(layers.concernLayer);
              }
            } catch {}
          });
          
          // Update progress (50% - 75%)
          setLoadingProgress(50 + (i / buildingData.length) * 25);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 20));
        }
        await new Promise(r => setTimeout(r, 300));
        return buildingData;
      };
      
      const processStreetConcerns = async () => {
        const res = await fetch('/data/street-data.json');
        const streetData = await res.json();
        
        // Process streets in batches to show visual loading
        const batchSize = Math.ceil(streetData.length / 10); // 10 batches
        
        for (let i = 0; i < streetData.length; i += batchSize) {
          const batch = streetData.slice(i, i + batchSize);
          
          batch.forEach(s => {
            try {
              const coords = s.the_geom.coordinates[0].map(c => [c[1], c[0]]);
              const isConcern = s.final_grade === 'F';
              
              // Add to street layer (hidden by default)
              if (!isConcern) {
                L.polyline(coords, {
                  color: COLORS.street,
                  weight: 2,
                  opacity: 0.6,
                }).bindPopup(`
                  <strong>${s.full_street_name_from_gis}</strong><br>
                  Grade: ${s.final_grade}
                `).addTo(layers.streetLayer);
              } 
              // Add to concern layer (visible by default)
              else {
                L.polyline(coords, {
                  color: COLORS.concern,
                  weight: 4,
                  opacity: 0.9,
                }).bindPopup(`
                  <strong>${s.full_street_name_from_gis}</strong><br>
                  Grade: ${s.final_grade}<br>
                  <span class="text-red-600 font-semibold">Poor Condition - High Priority</span>
                `).addTo(layers.concernLayer);
              }
            } catch {}
          });
          
          // Update progress (75% - 100%)
          setLoadingProgress(75 + (i / streetData.length) * 25);
          
          // Small delay for visual effect
          await new Promise(r => setTimeout(r, 10));
        }
        await new Promise(r => setTimeout(r, 300));
        return streetData;
      };
      
      // Process both building and street concerns
      await processBuildingConcerns();
      await processStreetConcerns();
      
      // Add concern layer to map (visible by default)
      leafletMap.addLayer(layers.concernLayer);
      
    
      // Notify parent component that all layers are ready
      if (onLayersReady) {
        onLayersReady();
      }
    
      // If window.setResponseReady exists (global callback), call it too
      if (window.setResponseReady) {
        window.setResponseReady(true);
      }

      setLoadingProgress(100);
      setLoadingStage('complete');
    };

    initMap();
    //return () => map?.leafletMap.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLayersReady]); // Add onLayersReady to dependency array

  useEffect(() => {
    const handleTransitionEnd = (e) => {
      // Check if the transition was on an element that could affect map size
      if (e.target.id === 'draggable-panel-header' || 
          e.target.closest('.draggable-artifact-panel') || 
          e.target.classList.contains('draggable-artifact-panel')) {
        if (map) map.leafletMap.invalidateSize();
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
          map.leafletMap.invalidateSize({animate: false, pan: false});
          console.log("Map size invalidated");
        }, 100);
      };
      
      // Also set up resize handler for window resize events
      const handleWindowResize = _.debounce(() => {
        if (map) map.leafletMap.invalidateSize();
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
    const { leafletMap, layers } = map;
    Object.entries(activeLayers).forEach(([key, active]) => {
      const layerKey = `${key}Layer`;
      if (layers[layerKey]) {
        if (active) {
          leafletMap.addLayer(layers[layerKey]);
        } else {
          leafletMap.removeLayer(layers[layerKey]);
        }      }
    });
  }, [map, activeLayers]);


  return (
<div className={`flex flex-col h-full ${isFullScreen ? 'inset-0 z-50 bg-white relative' : ''}`}>
<div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          High Priority Infrastructure
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
            {isFullScreen ? <X size={20}/> : <Maximize2 size={20} />}
          </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
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
      <div className={`text-center p-1 rounded text-xs ${['map', 'concerns', 'complete'].includes(loadingStage) ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
        Base Map
      </div>
      <div className={`text-center p-1 rounded text-xs ${['concerns', 'complete'].includes(loadingStage) ? 'bg-coral text-white' : 'bg-gray-100 text-gray-500'}`}>
        Priority Points
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
                <span className="font-medium">Building Condition Data:</span>{' '}
                <a>
                  Building Condition data (contains building footprints, maintenance details, conditions, and year built)
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
                concern: 'concern',
                neighborhood: 'neighborhood',
                building: 'building',
                street: 'street'
              }[layer];
              const layerLabel = {
                concern: 'Concern',
                neighborhood: 'Neighborhood',
                building: 'Building Conditions',
                street: 'Street Conditions'
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

export default HighPriorityInfrastructureMap;