import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Maximize2, X, Info } from 'lucide-react';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  coral: '#008080',
  cta: "#FF5747",
  gray: '#95A5A6',
  blue: '#3498DB',
  orange: '#E67E22',
  green: '#27AE60',
  white: '#FFFFFF'
};

const SidewalkConditionDashboard = ({onLayersReady, onFullscreenChange}) => {
  const [data, setData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleChartView, setSingleChartView] = useState(false);
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

   useEffect(() => {
      const timeout = setTimeout(() => {
        if (onLayersReady) onLayersReady();
        if (window.setResponseReady) window.setResponseReady(true); // Optional global trigger
      }, 500); // Or however long you want to delay
  
      return () => clearTimeout(timeout);
    }, [onLayersReady]);
  useEffect(() => {
    Papa.parse('/data/sidewalkcondition-data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setData(results.data);
      }
    });
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

  const conditionCounts = {};
  data.forEach(item => {
    const cond = item.functional_condition || 'UNKNOWN';
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  });

  const pieData = Object.entries(conditionCounts).map(([name, value]) => ({ name, value }));
  const pieColors = [
    COLORS.primary, COLORS.cta, COLORS.coral
  ];

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) onFullscreenChange(next);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 relative">
      <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
        Sidewalk Condition Dashboard
      </h2>
      <div className="flex items-center space-x-2">
        {/* Info Button */}
        <button
          onClick={() => setShowSources(prev => !prev)}
          title="View Sources"
          className="p-2 rounded-full border"
          style={{ 
            color: COLORS.coral,
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.coral}`,
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = COLORS.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.white;
            e.currentTarget.style.color = COLORS.coral;
          }}
        >
          <Info size={18} />
        </button>

        {/* Sources Menu */}
        {showSources && (
          <div ref={infoRef}className="absolute top-full right-0 mt-2 w-[260px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50">
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
        <a
        >
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
Neighborhoods          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/Transportation-and-Mobility/Traffic-Detectors/qpuw-8eeb/about_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Traffic          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/Transportation-and-Mobility/Austin-Crash-Report-Data-Crash-Level-Records/y2wy-tgr5/about_data/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Crash          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Sidewalk-Condition-Data/8e5u-8itq/about_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Sidewalk Condition          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/Transportation-and-Mobility/TRANSPORTATION_bicycle_facilities/uwbq-ycek"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Bike Lanes          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/dataset/Core-Transit-Corridors/g4jr-h8r2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Transit Corridors          </a>
      </div>
    
            </div>
          </div>
        )}

        {/* Fullscreen or Close Button */}
        {singleChartView ? (
  <button
    onClick={() => setSingleChartView(false)}
    className="p-2 rounded-full border"
    style={{
      color: COLORS.coral,
      backgroundColor: COLORS.white,
      border: `1px solid ${COLORS.coral}`,
      transition: 'all 0.2s ease-in-out',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = COLORS.coral;
      e.currentTarget.style.color = COLORS.white;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = COLORS.white;
      e.currentTarget.style.color = COLORS.coral;
    }}
  >
    <X size={18} />
  </button>
) : (
  <>
    {!isMobile && (
      <button
        onClick={toggleFullscreen}
        className="p-2 rounded-full border"
        style={{
          color: COLORS.coral,
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.coral}`,
          transition: 'all 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.coral;
          e.currentTarget.style.color = COLORS.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.white;
          e.currentTarget.style.color = COLORS.coral;
        }}
      >
        <Maximize2 size={18} />
      </button>
    )}
  </>
)}

      </div>
    </div>
  );

  const chartContainer = (
    <div className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer" onClick={() => setSingleChartView(true)}>
      <h3 className="text-md font-medium mb-2" style={{ color: COLORS.secondary }}>
        Functional Condition Distribution
      </h3>
      {renderPieChart()}
    </div>
  );


  const renderPanelContent = (
    <div className="p-4 max-h-[90vh] overflow-y-auto pb-4">
      {renderHeader()}
      {singleChartView ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-md font-medium mb-4" style={{ color: COLORS.secondary }}>
            Functional Condition Distribution
          </h3>
          {renderPieChart()}
        </div>
      ) : chartContainer}
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {isFullscreen ? (
        <div className="absolute inset-0 z-50 bg-white/50 rounded-xl shadow-xl overflow-auto">
       {renderPanelContent}
</div>
      ) : (
        renderPanelContent
      )}
    </div>
  );
};

export default SidewalkConditionDashboard;
