import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Maximize2, X, Info } from 'lucide-react';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  coral: '#008080',
  gray: '#95A5A6',
  blue: '#3498DB',
  green: '#27AE60',
  red: '#E74C3C',
  orange: '#F39C12',
  white: '#FFFFFF'
};

const getColor = (index) => {
  const palette = [
    '#2ECC71', '#3498DB', '#9B59B6', '#F1C40F', '#E67E22', '#1ABC9C', '#E74C3C', '#34495E', '#95A5A6', '#D35400'
  ];
  return palette[index % palette.length];
};

const BudgetDashboard = ({onLayersReady, onFullscreenChange}) => {
  const [budgetData, setBudgetData] = useState([]);
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
    const timeout = setTimeout(() => {
      if (onLayersReady) onLayersReady();
      if (window.setResponseReady) window.setResponseReady(true); // Optional global trigger
    }, 500); // Or however long you want to delay

    return () => clearTimeout(timeout);
  }, [onLayersReady]);
  useEffect(() => {
    Papa.parse('/data/budget-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const grouped = {};

        results.data.forEach(row => {
          const dept = row.DEPT_ROLLUP_NAME;
          if (!grouped[dept]) {
            grouped[dept] = {
              DEPT_ROLLUP_NAME: dept,
              BUDGET: 0,
              EXPENDITURES: 0
            };
          }
          grouped[dept].BUDGET += row.BUDGET || 0;
          grouped[dept].EXPENDITURES += row.EXPENDITURES || 0;
        });

        const processed = Object.values(grouped).map((entry, index) => ({
          ...entry,
          REMAINING: entry.BUDGET - entry.EXPENDITURES,
          fill: getColor(index)
        })).filter(entry => entry.BUDGET !== 0);

        setBudgetData(processed);
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

  const charts = [
    {
        id: 'remaining-budget',
        name: 'Remaining Budget by Department',
        render: () => (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={budgetData.sort((a, b) => b.REMAINING - a.REMAINING).slice(0, 10)}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="DEPT_ROLLUP_NAME" tick={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `$${(value / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar
                dataKey="REMAINING"
                name="Remaining Budget"
              >
                {budgetData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      },      
    {
      id: 'budget-vs-expenditures',
      name: 'Budget vs Expenditures by Department',
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetData.sort((a, b) => b.BUDGET - a.BUDGET).slice(0, 10)} margin={{ top: 10, right: 20, left: 10, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis tickFormatter={(value) => `$${(value / 1_000_000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="BUDGET" fill={COLORS.blue} name="Budget" />
            <Bar dataKey="EXPENDITURES" fill={COLORS.red} name="Expenditures" />
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
  const renderPanelContent = (fullscreen = false) => (
    <div
      className={`p-4 ${fullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'max-h-[90vh] overflow-y-auto pb-4'}`}
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
          Budget Allocation Dashboard
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
        <div className="space-y-6">
          {charts.map(chart => (
            <div
              key={chart.id}
              className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer"
              onClick={() => setSingleChartView(chart.id)}
            >
              <h3 className="text-md font-medium mb-2" style={{ color: COLORS.secondary }}>
                {chart.name}
              </h3>
              {chart.render()}
            </div>
          )
          )}
          <div className="flex flex-wrap mt-4">
  {budgetData.slice(0, 10).map((entry, index) => (
    <div key={index} className="flex items-center mr-4 mb-2">
      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.fill }}></div>
      <span className="text-sm text-gray-700">{entry.DEPT_ROLLUP_NAME}</span>
    </div>
  ))}
</div>

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
    <div ref={infoRef}className="absolute top-0 right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]"
    style={{top: '120px'}}>
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
            href="https://data.austintexas.gov/d/phcn-uuu3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
Street Maintenance          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/dn4m-2fjj/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
Projects          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/g5k8-8sud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
Budget          </a>
        </div>
      </div>
    </div>
  )}

    </div>
  );
};

export default BudgetDashboard;