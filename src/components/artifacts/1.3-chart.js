import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Maximize2, X, Info } from 'lucide-react';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  neutral: '#F5F5F5',
  white: '#FFFFFF',
  coral: '#008080',
  cta: '#95A5A6',
};



const ClimateVulnerabilityDashboard = ({onLayersReady, onFullscreenChange}) => {
  const [data, setData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleChartView, setSingleChartView] = useState(null);
  const chartContainerRef = useRef(null);
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
    const timeout = setTimeout(() => {
      if (onLayersReady) onLayersReady();
      if (window.setResponseReady) window.setResponseReady(true); // Optional global trigger
    }, 500); // Or however long you want to delay

    return () => clearTimeout(timeout);
  }, [onLayersReady]);
  useEffect(() => {
    fetch('/data/heatisland-data.json')
      .then(res => res.json())
      .then(json => {
        setData(json.neighborhoods);
      });
  }, []);

  if (!data) return <div>Loading...</div>;

  const barData = Object.entries(data).map(([name, metrics]) => ({ name, ...metrics }));

  const pieData = barData.map(entry => ({
    name: entry.name,
    value: entry.impervious_surface_percentage
  }));

  const canopyVsHeatData = barData.map(entry => ({
    name: entry.name,
    'Tree Canopy %': entry.tree_canopy_coverage,
    'Heat Emergency Calls': entry.heat_related_emergency_calls_per_100k
  }));

  const pieColors = [
    COLORS.primary, COLORS.secondary, COLORS.coral, COLORS.cta,
    '#7F8C8D', '#607D8B', '#D35400', '#16A085'
  ];

  const charts = [
    {
      id: 'temperature',
      name: 'Avg. Temperature Increase by Neighborhood (°F)',
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average_temperature_increase" fill={COLORS.coral} name="Temp Increase (°F)" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'canopyheat',
      name: 'Tree Canopy vs. Heat Emergency Calls',
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={canopyVsHeatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tree Canopy %" fill={COLORS.primary} />
            <Bar dataKey="Heat Emergency Calls" fill={COLORS.cta} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  ];

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) onFullscreenChange(next);
  };
  const regularPanelContent = (
    <div className="p-4" ref={chartContainerRef}>
     <div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
    Climate Vulnerability Dashboard
  </h2>
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setShowSources(prev => !prev)}
      className="p-2 rounded-full border"
      style={{ color: COLORS.coral, borderColor: COLORS.coral }}
      title="Sources"
    >
      <Info size={18} />
    </button>
    {!isMobile && (
    <button
      onClick={toggleFullscreen}
      className="p-2 rounded-full border"
      style={{ color: COLORS.coral, borderColor: COLORS.coral }}
      title="Fullscreen"
    >
      {isFullscreen ? <X size={18} /> : <Maximize2 size={18} />}
    </button>
    )}
  </div>
</div>



      {singleChartView ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-md font-medium mb-4" style={{ color: COLORS.secondary }}>
            {charts.find(c => c.id === singleChartView)?.name}
          </h3>
          {charts.find(c => c.id === singleChartView)?.render()}
        </div>
      ) : (
        <div className="flex flex-col space-y-8">
          {charts.slice(0, 2).map(chart => (
            <div
              key={chart.id}
              className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer"
              onClick={() => setSingleChartView(chart.id)}
            >
              <h3 className="text-md font-medium mb-2" style={{ color: COLORS.secondary }}>{chart.name}</h3>
              {chart.render()}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /*
// Add missing fullscreenPanelContent
const fullscreenPanelContent = (
  <div className="fixed inset-0 z-50 bg-white overflow-auto p-4">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
        Climate Vulnerability Dashboard
      </h2>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowSources(prev => !prev)}
          style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = COLORS.coral;
          }}
          title="Sources"
        >
          <Info size={20} />
        </button>
        {!isMobile && (
        <button
          onClick={toggleFullscreen}
          style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.coral;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = COLORS.coral;
          }}
          title="Exit Fullscreen"
        >
          <X size={20} />
        </button>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {charts.map(chart => (
        <div
          key={chart.id}
          className="bg-gray-50 p-4 rounded-lg shadow"
        >
          <h3 className="text-md font-medium mb-2" style={{ color: COLORS.secondary }}>{chart.name}</h3>
          {chart.render()}
        </div>
      ))}
    </div>
  </div>
);
*/
  return (
    <div className="relative w-full h-full">
    {isFullscreen ? (
  <div className="absolute inset-0 z-50 /50 rounded-xl shadow-xl overflow-auto">
    {regularPanelContent}
  </div>
) : (
  regularPanelContent
)}
      {showSources && (
  <div ref = {infoRef} className="absolute top-36 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50 animate-fade-in">
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
Neighborhoods          </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/Public-Safety/Greater-Austin-Fully-Developed-Floodplain/pjz8-kff2/about_data" // Replace with real source
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Floodplains        </a>
      </div>
      
      <div>
      <span className="text-gray-700">
          Heat island (contains temperature increase, tree coverage, impervious surface, and heat related emergency calls)
        </span>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ClimateVulnerabilityDashboard;
