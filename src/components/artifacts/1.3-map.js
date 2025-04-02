// FloodplainsMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, X, Info } from 'lucide-react';
import _ from 'lodash';

const FloodplainsMap = ({ onLayersReady }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  
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
    setIsFullScreen(prev => !prev);
    if (map) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  };

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
      const buildingLayer = L.layerGroup();
      const streetLayer = L.layerGroup();
      const neighborhoodLayer = L.layerGroup();
      const floodplainLayer = L.layerGroup();
      
      // Set map reference early
      setMap(leafletMap);
      
      // Start loading infrastructure right away
      const promises = [];
      
      // Load neighborhood data and add to map immediately
      const neighborhoodPromise = (async () => {
        const res = await fetch('/data/neighborhood-data.json');
        const data = await res.json();
        neighborhoodLayer.addTo(leafletMap); // Add to map immediately
        
        // Add neighborhoods in small batches
        const batchSize = Math.ceil(data.length / 5);
        for (let i = 0; i < data.length; i += batchSize) {
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
            } catch {}
          });
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.neighborhoodLayer = neighborhoodLayer;
        return neighborhoodLayer;
      })();
      promises.push(neighborhoodPromise);

      // Load building data and add to map immediately
      const buildingPromise = (async () => {
        const res = await fetch('/data/building-data.json');
        const data = await res.json();
        buildingLayer.addTo(leafletMap); // Add to map immediately
        
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
                icon: L.divIcon({
                  className: '',
                  html: `<div style="width:6px;height:6px;border-radius:50%;background:${COLORS.building};opacity:0.3"></div>`
                })
              }).bindPopup(`<strong>Building ID: ${b.objectid}</strong>`);
              buildingLayer.addLayer(marker);
            } catch {}
          });
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.buildingLayer = buildingLayer;
        return buildingLayer;
      })();
      promises.push(buildingPromise);

      // Load street data and add to map immediately
      const streetPromise = (async () => {
        const res = await fetch('/data/street-data.json');
        const data = await res.json();
        streetLayer.addTo(leafletMap); // Add to map immediately
        
        // Add streets in small batches
        const batchSize = Math.ceil(data.length / 5);
        for (let i = 0; i < data.length; i += batchSize) {
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
            } catch {}
          });
          // No need to wait between batches - load as fast as possible
        }
        
        leafletMap.streetLayer = streetLayer;
        return streetLayer;
      })();
      promises.push(streetPromise);
      
      // Load all infrastructure in the background
      Promise.all(promises).then(() => {
        // Infrastructure is fully loaded
        setLoadingProgress(35);
      });
      
      // Wait just a moment to let map initialize
      await new Promise(r => setTimeout(r, 500));
      
      // Now load floodplains data sequentially and visibly
      setLoadingStage('floodplains');
      
      const res = await fetch('/data/floodplains-data.json');
      const floodplainData = await res.json();
      
      // Add floodplain polygons in batches to create visual loading effect
      const batchSize = Math.ceil(floodplainData.length / 10); // 10 batches
      
      for (let i = 0; i < floodplainData.length; i += batchSize) {
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
          } catch {}
        });
        
        // Update loading progress
        setLoadingProgress(35 + (i / floodplainData.length) * 65);
        
        // Wait a bit before adding next batch to create visual effect
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Add floodplain layer to map
      floodplainLayer.addTo(leafletMap);
      leafletMap.floodplainLayer = floodplainLayer;
      
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
  }, []);

  useEffect(() => {
    if (!map) return;
    const layers = {
      neighborhoods: map.neighborhoodLayer,
      buildings: map.buildingLayer,
      streets: map.streetLayer,
      floodplains: map.floodplainLayer
    };
    Object.entries(activeLayers).forEach(([key, active]) => {
      if (layers[key]) {
        if (active) {
          map.addLayer(layers[key]);
        } else {
          map.removeLayer(layers[key]);
        }
      }    });
  }, [map, activeLayers]);

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
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
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        {showSources && (
          <div ref = {infoRef} className="absolute top-0 right-0 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1050] animate-fade-in">
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
      <div className="p-2 bg-white border-t text-xs text-gray-500">
        <p><strong>Source:</strong> Austin Floodplain Data (March 2025)</p>
      </div>
    </div>
  );
};

export default FloodplainsMap;