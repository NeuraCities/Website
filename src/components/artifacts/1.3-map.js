// FloodplainsMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const FloodplainsMap = ({ onLayersReady, onFullscreenChange }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store map instance in a ref instead of state
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Add loading states
  const [loadingStage, setLoadingStage] = useState('initializing'); // 'initializing', 'map', 'floodplains', 'complete'
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);
  
  const [activeLayers, setActiveLayers] = useState({
    neighborhoods: true,
    buildings: true,
    streets: true,
    floodplains: true
  });

  const COLORS = {
    flood: '#0074D9',
    neighborhood: '#3498DB',
    street: '#008080',
    building: '#008080',
    primary: '#2C3E50',
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
      case 'map': return 'Loading map & infrastructure...';
      case 'floodplains': return 'Loading floodplain data...';
      case 'complete': return 'Map ready';
      default: return 'Loading...';
    }
  };
  
  // Handle click outside for source info
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

  // Initialize the map only once
  useEffect(() => {
    let isCancelled = false;
    
    const initializeMap = async () => {
      try {
        // Safety checks
        if (!mapContainerRef.current) {
          console.log("Map container not available yet");
          return;
        }
        
        if (mapInstanceRef.current) {
          console.log("Map already initialized");
          return;
        }
        
        if (mapInitialized) {
          console.log("Map initialization already in progress");
          return;
        }
        
        // Set initialization state to prevent duplicate initialization
        setMapInitialized(true);
        setLoadingStage('initializing');
        setLoadingProgress(10);
        
        // Import Leaflet
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        // Another safety check after async operations
        if (isCancelled || !mapContainerRef.current) {
          console.log("Initialization cancelled or container removed");
          return;
        }
        
        setLoadingProgress(15);
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

        // Store the map instance in the ref
        mapInstanceRef.current = leafletMap;

        // Initialize empty layer groups
        const buildingLayer = L.layerGroup();
        const streetLayer = L.layerGroup();
        const neighborhoodLayer = L.layerGroup();
        const floodplainLayer = L.layerGroup();
        
        // Store layer references on the map instance
        leafletMap.buildingLayer = buildingLayer;
        leafletMap.streetLayer = streetLayer;
        leafletMap.neighborhoodLayer = neighborhoodLayer;
        leafletMap.floodplainLayer = floodplainLayer;
        
        // Start loading infrastructure right away
        const promises = [];
        
        // Load neighborhood data and add to map immediately
        const neighborhoodPromise = (async () => {
          try {
            const res = await fetch('/data/neighborhood-data.json');
            const data = await res.json();
            if (isCancelled) return;
            
            neighborhoodLayer.addTo(leafletMap); // Add to map immediately
            
            // Add neighborhoods in small batches
            const batchSize = Math.ceil(data.length / 5);
            for (let i = 0; i < data.length && !isCancelled; i += batchSize) {
              const batch = data.slice(i, i + batchSize);
              batch.forEach(n => {
                try {
                  const coords = n.the_geom.coordinates[0][0].map(c => [c[1], c[0]]);
                  const polygon = L.polygon(coords, {
                    color: COLORS.primary,
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 0
                  }).bindPopup(`<strong>${n.neighname}</strong>`);
                  neighborhoodLayer.addLayer(polygon);
                } catch (e) {
                  console.error("Error adding neighborhood:", e);
                }
              });
            }
            
            return neighborhoodLayer;
          } catch (e) {
            console.error("Error loading neighborhood data:", e);
            return null;
          }
        })();
        promises.push(neighborhoodPromise);

        // Load building data and add to map immediately
        const buildingPromise = (async () => {
          try {
            const res = await fetch('/data/building-data.json');
            const data = await res.json();
            if (isCancelled) return;
            
            buildingLayer.addTo(leafletMap); // Add to map immediately
            
            // Add buildings in small batches
            const batchSize = Math.ceil(data.length / 5);
            for (let i = 0; i < data.length && !isCancelled; i += batchSize) {
              const batch = data.slice(i, i + batchSize);
              batch.forEach(b => {
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
                } catch (e) {
                  console.error("Error adding building:", e);
                }
              });
            }
            
            return buildingLayer;
          } catch (e) {
            console.error("Error loading building data:", e);
            return null;
          }
        })();
        promises.push(buildingPromise);

        // Load street data and add to map immediately
        const streetPromise = (async () => {
          try {
            const res = await fetch('/data/street-data.json');
            const data = await res.json();
            if (isCancelled) return;
            
            streetLayer.addTo(leafletMap); // Add to map immediately
            
            // Add streets in small batches
            const batchSize = Math.ceil(data.length / 5);
            for (let i = 0; i < data.length && !isCancelled; i += batchSize) {
              const batch = data.slice(i, i + batchSize);
              batch.forEach(s => {
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
                } catch (e) {
                  console.error("Error adding street:", e);
                }
              });
            }
            
            return streetLayer;
          } catch (e) {
            console.error("Error loading street data:", e);
            return null;
          }
        })();
        promises.push(streetPromise);
        
        // Load all infrastructure in the background
        Promise.all(promises).then(() => {
          if (isCancelled) return;
          // Infrastructure is fully loaded
          setLoadingProgress(35);
        });
        
        // Wait just a moment to let map initialize
        if (!isCancelled) await new Promise(r => setTimeout(r, 500));
        
        // Now load floodplains data sequentially and visibly
        if (!isCancelled) {
          setLoadingStage('floodplains');
          
          try {
            const res = await fetch('/data/floodplains-data.json');
            const floodplainData = await res.json();
            
            if (isCancelled) return;
            
            // Add floodplain polygons in batches to create visual loading effect
            const batchSize = Math.ceil(floodplainData.length / 10); // 10 batches
            
            for (let i = 0; i < floodplainData.length && !isCancelled; i += batchSize) {
              const batch = floodplainData.slice(i, i + batchSize);
              
              batch.forEach(f => {
                try {
                  const coordsList = f.the_geom.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]));
                  const polygon = L.polygon(coordsList, {
                    color: COLORS.flood,
                    fillOpacity: 0.4,
                    weight: 1
                  }).bindPopup(`Flood Zone: ${f.flood_zone}<br>Drainage ID: ${f.drainage_id}`);
                  floodplainLayer.addLayer(polygon);
                } catch (e) {
                  console.error("Error adding floodplain:", e);
                }
              });
              
              // Update loading progress
              if (!isCancelled) {
                setLoadingProgress(35 + (i / floodplainData.length) * 65);
                // Wait a bit before adding next batch to create visual effect
                await new Promise(r => setTimeout(r, 50));
              }
            }
            
            // Add floodplain layer to map
            if (!isCancelled) {
              floodplainLayer.addTo(leafletMap);
              
              setLoadingProgress(100);
              setLoadingStage('complete');
              
              if (onLayersReady) {
                onLayersReady();
              }
              
              if (window.setResponseReady) {
                window.setResponseReady(true);
              }
            }
          } catch (e) {
            console.error("Error loading floodplain data:", e);
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapInitialized(false); // Reset initialization state on error
      }
    };

    initializeMap();
    
    // Cleanup function
    return () => {
      isCancelled = true;
      
      // We don't cleanup the map here - we do it in a separate effect
    };
  }, []); // Empty dependency array - only run once
  
  // Dedicated cleanup effect - runs only on unmount
  useEffect(() => {
    // Return cleanup function for unmount
    return () => {
      // Cleanup map resources safely
      if (mapInstanceRef.current) {
        try {
          console.log("Cleaning up map on component unmount");
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error("Error during map cleanup:", e);
        }
      }
    };
  }, []); // Empty dependency array ensures this only runs on mount/unmount

  // Handle display mode changes
  useEffect(() => {
    setTimeout(() => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize(true);
        } else {
          console.warn("Map instance is null during fullscreen toggle");
        }
      } catch (e) {
        console.error("Error invalidating map size:", e);
      }
    }, 300);
  }, [isFullScreen]);
  

  // Handle transitions that might affect map size
  useEffect(() => {
    const handleTransitionEnd = (e) => {
      // Check if the transition was on an element that could affect map size
      if (e.target.id === 'draggable-panel-header' || 
          e.target.closest('.draggable-artifact-panel') || 
          e.target.classList.contains('draggable-artifact-panel')) {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (e) {
            console.error("Error invalidating map size after transition:", e);
          }
        }
      }
    };
    
    document.addEventListener('transitionend', handleTransitionEnd);
    
    return () => {
      document.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, []);

  // Set up global resize handler
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Create global resize function
      window.resizeActiveMap = () => {
        console.log("Map resize triggered");
        
        // For Leaflet maps, invalidateSize is the key method 
        // that recalculates the map container size
        
        // Add a small delay to let the DOM update first
        setTimeout(() => {
          try {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize({animate: false, pan: false});
              console.log("Map size invalidated");
            }
          } catch (e) {
            console.error("Error during map resize:", e);
          }
        }, 300);
      };
      
      // Also set up resize handler for window resize events
      const handleWindowResize = _.debounce(() => {
        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        } catch (e) {
          console.error("Error during window resize handler:", e);
        }
      }, 300);
      
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        // Clean up
        window.removeEventListener('resize', handleWindowResize);
        delete window.resizeActiveMap;
      };
    }
  }, [mapInitialized]); // Only run when map initialization state changes

  // Handle layer visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    const layers = {
      neighborhoods: map.neighborhoodLayer,
      buildings: map.buildingLayer,
      streets: map.streetLayer,
      floodplains: map.floodplainLayer
    };
    
    Object.entries(activeLayers).forEach(([key, active]) => {
      if (layers[key]) {
        try {
          if (active) {
            map.addLayer(layers[key]);
          } else {
            map.removeLayer(layers[key]);
          }
        } catch (e) {
          console.error(`Error toggling layer ${key}:`, e);
        }
      }
    });
  }, [activeLayers, mapInitialized]);

  return (
    <div 
      className="flex flex-col h-full"
    >
      <div className="flex justify-between items-center p-3 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.primary }}>
          Austin Floodplains Map
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
          <button onClick={() => setShowSources(prev => !prev)}
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
            }}><Info size={20} /></button>
            {!isMobile && (
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
        )}
        </div>
      </div>
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {showSources && (
          <div ref={infoRef} className="absolute top-0 right-0 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1050] animate-fade-in">
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
                <span className="text-gray-700">
                  Building Condition (contains building footprints, maintenance details, conditions, and year built)
                </span>
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
                <span className="text-gray-700">
                  Heat island (contains temperature increase, tree coverage, impervious surface, and heat related emergency calls)
                </span>
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-2 gap-1 mt-2 w-full">
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'map' || loadingStage === 'floodplains' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Map & Infrastructure
              </div>
              <div className={`text-center p-1 rounded text-xs ${loadingStage === 'floodplains' || loadingStage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                Floodplains
              </div>
            </div>
          </div>
        )}

        {showLegend && (
          <div
            className="absolute bottom-4 left-4 w-15 bg-white border rounded shadow-md p-3 text-sm resize"
            style={{ zIndex: 1000, overflow: 'auto', maxHeight: '70vh' }}
          >
            <h3 className="font-semibold mb-2">Legend & Layers</h3>
            {Object.keys(activeLayers).map(layer => {
              const colorKey = {
                neighborhoods: 'primary',
                buildings: 'building',
                streets: 'street',
                floodplains: 'flood'
              }[layer];

              const layerLabel = {
                neighborhoods: 'Neighborhood',
                buildings: 'Building Conditions',
                streets: 'Street Conditions',
                floodplains: 'Floodplains'
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

export default FloodplainsMap;