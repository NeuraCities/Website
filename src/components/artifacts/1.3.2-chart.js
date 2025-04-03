// EmergencyResponsivenessDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { Maximize2, X, Info } from 'lucide-react';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  coral: '#008080',
  gray: '#95A5A6',
  blue: '#3498DB',
  green: '#27AE60',
  white: '#FFFFFF'
};

const EmergencyResponsivenessDashboard = ({onLayersReady, onFullscreenChange}) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleChartView, setSingleChartView] = useState(null);
  const chartContainerRef = useRef(null);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
  

  const formatMonthKey = (key) => {
    const strKey = key?.toString();
    if (strKey && strKey.length === 6) {
      return `${strKey.slice(4, 6)}/${strKey.slice(0, 4)}`;
    }
    return null;
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
    Papa.parse('/data/emsmonthly-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const formatted = results.data
          .filter(item => item.month_key)
          .map(item => ({
            ...item,
            formatted_month: formatMonthKey(item.month_key)
          }))
          .filter(item => item.formatted_month); // remove invalid
        setMonthlyData(formatted);
      }
    });

    Papa.parse('/data/emsmonthlysatisfaction-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const formatted = results.data
          .filter(item => item.month_key)
          .map(item => ({
            ...item,
            formatted_month: formatMonthKey(item.month_key)
          }))
          .filter(item => item.formatted_month); // remove invalid
        setSatisfactionData(formatted);
      }
    });
  }, []);

  const charts = [
    {
      id: 'response-times',
      name: 'Average On-Time Response Rates',
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData.slice(0, 24)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formatted_month" />
            <YAxis domain={[80, 100]} unit="%" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="percent_on_time_all" stroke={COLORS.green} name="All" />
            <Line type="monotone" dataKey="percent_on_time_coa" stroke={COLORS.blue} name="COA" />
            <Line type="monotone" dataKey="percent_on_time_tc" stroke={COLORS.coral} name="TC" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'incident-counts',
      name: 'Monthly Emergency Incidents',
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData.slice(0, 24)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formatted_month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count_incidents_all" fill={COLORS.primary} name="All Incidents" />
            <Bar dataKey="count_incidents_coa" fill={COLORS.blue} name="COA" />
            <Bar dataKey="count_incidents_tc" fill={COLORS.coral} name="TC" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'satisfaction',
      name: 'Public Satisfaction Rates',
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={satisfactionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formatted_month" />
            <YAxis domain={[80, 100]} unit="%" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="percent_satisfied_or_very_satisfied" stroke={COLORS.green} name="Satisfaction" />
            <Line type="monotone" dataKey="percent_satisfied_or_very_satisfied_target" stroke={COLORS.gray} strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      ),
      colSpan: 2 // make this chart span full row
    }
  ];

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) onFullscreenChange(next);
  };

  const renderPanelContent = (fullscreen = false) => (
<div className="p-4" ref={chartContainerRef}>
<div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
          Emergency Responsiveness Dashboard
        </h2>
        <div className="flex items-center space-x-2">
  {singleChartView && (
    <button onClick={() => setSingleChartView(null)} className="p-2 rounded-full border" style={{ 
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
    }}>
      <X size={18} />
    </button>
  )}
  <button
    onClick={() => setShowSources(prev => !prev)}
    className="p-2 rounded-full border"
    title="View sources"
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
  {!isMobile && (
  <button onClick={toggleFullscreen} className="p-2 rounded-full border" style={{ 
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
            }}>
    {fullscreen ? <X size={18} /> : <Maximize2 size={18} />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charts.map(chart => (
            <div
              key={chart.id}
              className={`bg-gray-50 p-4 rounded-lg shadow cursor-pointer ${chart.colSpan === 2 ? 'md:col-span-2' : ''}`}
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

  return (
    <div className="relative w-full h-full">
    {isFullscreen ? (
      <div className="absolute inset-0 z-50 bg-white rounded-xl shadow-xl overflow-auto">
        {renderPanelContent()}
      </div>
    ) : (
      renderPanelContent()
    )}
    {showSources && (
  <div ref = {infoRef} className="fixed top-20 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in"
  style={{top: '120px'}}>
    <div className="space-y-2 text-sm text-gray-700">
    <div>
        <a
          href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8/about_data" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Infrastructure Charts        </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Street-Segment-Condition-Data/pcwe-pwxe/about_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Street Condition        </a>
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
Neighborhoods        </a>
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
        <a
        >
         Heat island (contains temperature increase, tree coverage, impervious surface, and heat related emergency calls)
        </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/d/w635-mmjr" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
Historic Disaster Data        </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/d/gjtj-jt2d" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
EMS        </a>
      </div>
      <div>
        <a
          href="https://data.austintexas.gov/d/fszi-c96k" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
EMS Satisfaction       </a>
      </div>
      

    </div>
  </div>
)}

    </div>
  );
};

export default EmergencyResponsivenessDashboard;
