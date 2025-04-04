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

const EmergencyResponsivenessDashboard = ({ onLayersReady, onFullscreenChange }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [singleChartView, setSingleChartView] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const infoRef = useRef(null);
  useEffect(() => {
    const timeout = setTimeout(() => window.scrollTo(0, 0), 200);
    return () => clearTimeout(timeout);
  }, []);
  
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
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onLayersReady) onLayersReady();
      if (window.setResponseReady) window.setResponseReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [onLayersReady]);

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

  const formatMonthKey = (key) => {
    const strKey = key?.toString();
    return strKey && strKey.length === 6 ? `${strKey.slice(4, 6)}/${strKey.slice(0, 4)}` : null;
  };

  useEffect(() => {
    Papa.parse('/data/emsmonthly-data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const formatted = results.data
          .filter(item => item.month_key)
          .map(item => ({ ...item, formatted_month: formatMonthKey(item.month_key) }))
          .filter(item => item.formatted_month);
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
          .map(item => ({ ...item, formatted_month: formatMonthKey(item.month_key) }))
          .filter(item => item.formatted_month);
        setSatisfactionData(formatted);
      }
    });
  }, []);

  const charts = [
    {
      id: 'response-times',
      name: 'Average On-Time Response Rates',
      render: () => (
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 200}>
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
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 200}>
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
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 200}>
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
      colSpan: 2
    }
  ];

  const toggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (onFullscreenChange) onFullscreenChange(next);
  };

  const renderDashboardContent = () => (
<div className={`flex flex-col h-full bg-white/50 ${isMobile ? 'p-2' : 'p-4'}`} style={{ overflow: 'hidden' }}>
<div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold" style={{ color: COLORS.primary }}>
          Emergency Responsiveness Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          {singleChartView && (
            <button onClick={() => setSingleChartView(null)} className="p-2 rounded-full border" style={{ color: COLORS.coral, borderColor: COLORS.coral }}> <X size={18} /></button>
          )}
          <button onClick={() => setShowSources(prev => !prev)} className="p-2 rounded-full border" style={{ color: COLORS.coral, borderColor: COLORS.coral }}> <Info size={18} /></button>
          {!isMobile && (
          <button onClick={toggleFullscreen} className="p-2 rounded-full border" style={{ color: COLORS.coral, borderColor: COLORS.coral }}>
            {isFullscreen ? <X size={18} /> : <Maximize2 size={18} />}
          </button>
          )}
        </div>
      </div>

      {singleChartView ? (
        <div className="bg-gray-50 p-3 rounded-lg shadow">
<h3 className={`font-medium mb-4 ${isMobile ? 'text-sm' : 'text-base sm:text-md'}`} style={{ color: COLORS.secondary }}>
{charts.find(c => c.id === singleChartView)?.name}
          </h3>
          {charts.find(c => c.id === singleChartView)?.render()}
        </div>
      ) : (
<div className={`gap-4 ${isMobile ? 'flex overflow-x-auto space-x-4 snap-x snap-mandatory' : 'grid grid-cols-1 md:grid-cols-2'}`}>
{charts.map(chart => (
            <div
              key={chart.id}
              className={`bg-gray-50 p-3 rounded-lg shadow cursor-pointer ${chart.colSpan === 2 ? 'md:col-span-2' : ''}`}
              onClick={() => setSingleChartView(chart.id)}
            >
              <h3 className="text-base sm:text-md font-medium mb-4" style={{ color: COLORS.secondary }}>{chart.name}</h3>
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
          {renderDashboardContent()}
        </div>
      ) : (
        renderDashboardContent()
      )}

      {showSources && (
        <div
  ref={infoRef}
  className={`fixed ${isMobile ? 'bottom-5 left-1/2 transform -translate-x-1/2 w-[90%]' : 'top-24 right-6 w-[280px]'} bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]`}>
          <div className="space-y-2 text-sm text-gray-700">
            <a href="https://data.austintexas.gov/d/gjtj-jt2d" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">EMS</a>
            <a href="https://data.austintexas.gov/d/fszi-c96k" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">EMS Satisfaction</a>
            <a href="https://data.austintexas.gov/Locations-and-Maps/Neighborhoods/a7ap-j2yt/about_data" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Neighborhoods</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResponsivenessDashboard;