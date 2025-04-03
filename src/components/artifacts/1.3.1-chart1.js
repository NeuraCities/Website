// DisasterHistoryDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Maximize2, X, Info } from 'lucide-react';
import dayjs from 'dayjs';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  coral: '#008080',
  gray: '#95A5A6',
  blue: '#3498DB',
  green: '#27AE60',
  purple: '#9B59B6',
  orange: '#E67E22',
  white: '#FFFFFF'
};

const DisasterHistoryDashboard = ({onLayersReady, onFullscreenChange }) => {
  const [disasterData, setDisasterData] = useState([]);
  const [riskReductionData, setRiskReductionData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleChartView, setSingleChartView] = useState(null);
  const chartContainerRef = useRef(null);
  const [showSources, setShowSources] = useState(false);
    const infoRef = useRef(null);
  

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
    // Load disaster data
    Papa.parse('/data/historic-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsed = results.data
          .filter(d => d.eoc_activation_start_date && d.hazard)
          .map(d => {
            const start = dayjs(d.eoc_activation_start_date);
            const end = dayjs(d.eoc_activation_end_date);
            return {
              ...d,
              year: start.year(),
              duration: end.diff(start, 'day') + 1, // minimum 1-day duration
              hazard: d.hazard,
            };
          });
        setDisasterData(parsed);
      }
    });
    
    // Load risk reduction data
    Papa.parse('/data/floodreduction-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsed = results.data
          .filter(d => d['Fiscal Year'] && d.Total)
          .map(d => ({
            year: d['Fiscal Year'],
            structures: d['Structures With Reduced Risk'],
            roadways: d['Roadways with Reduced Risk'],
            buyouts: d['Buyouts Completed'],
            total: d.Total
          }));
        setRiskReductionData(parsed);
      }
    });
  }, []);

  const getActivationsPerYear = () => {
    const counts = {};
    disasterData.forEach(d => {
      counts[d.year] = (counts[d.year] || 0) + 1;
    });
    return Object.entries(counts).map(([year, count]) => ({ year, count }));
  };

  const getAverageDurationPerHazard = () => {
    const stats = {};
    disasterData.forEach(d => {
      if (!stats[d.hazard]) {
        stats[d.hazard] = { totalDuration: 0, count: 0 };
      }
      stats[d.hazard].totalDuration += d.duration;
      stats[d.hazard].count += 1;
    });
    return Object.entries(stats).map(([hazard, { totalDuration, count }]) => ({
      hazard,
      averageDuration: +(totalDuration / count).toFixed(1)
    }));
  };

  const charts = [
    {
      id: 'activations-per-year',
      name: 'Yearly EOC Activations',
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={getActivationsPerYear()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={COLORS.green} name="Activations" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'risk-reduction-stacked',
      name: 'Risk Reduction by Type (Stacked)',
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={riskReductionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="structures" stackId="a" fill={COLORS.green} name="Structures" />
            <Bar dataKey="roadways" stackId="a" fill={COLORS.blue} name="Roadways" />
            <Bar dataKey="buyouts" stackId="a" fill={COLORS.orange} name="Buyouts" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'duration-by-hazard',
      name: 'Average Duration by Hazard Type (Days)',
      colSpan: 2,
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={getAverageDurationPerHazard()} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="hazard" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageDuration" fill={COLORS.orange} name="Avg Duration" />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  ];
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

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) onFullscreenChange(next);
  };

  const renderPanelContent = (fullscreen = false) => (
    <div className="p-4" ref={chartContainerRef}>
     <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
          Disaster History Dashboard
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
      <div className="absolute inset-0 z-50 bg-white/50 rounded-xl shadow-xl overflow-auto">
        {renderPanelContent()}
      </div>
    ) : (
      renderPanelContent()
    )}
      {showSources && (
        <div ref = {infoRef} className="fixed top-20 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in"
        style={{top:'120px'}}>
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
          </div>
        </div>
      )}

      
    </div>
  );
};

export default DisasterHistoryDashboard;