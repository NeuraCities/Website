import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Maximize2, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const InfrastructureConditionDashboard = ({onLayersReady, onFullscreenChange, isFullscreen}) => {
  // State for fullscreen and single chart view
  const [singleChartView, setSingleChartView] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chartContainerRef = useRef(null);
  const [showSources, setShowSources] = useState(false);
  const infoRef = useRef(null);
  

  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onLayersReady) onLayersReady();
      if (window.setResponseReady) window.setResponseReady(true);
    }, 500);

    return () => clearTimeout(timeout);
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
  
  // Color Palette
  const COLORS = {
    primary: '#2C3E50',
    secondary: '#34495E',
    neutral: '#F5F5F5',
    white: '#FFFFFF',
    coral: '#008080',
    cta: '#95A5A6',
  };
  
  const SIDEBAR_WIDTH = isMobile ? '100%' : '250px';
  
  // Toggle sidebar
  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    
    if (newSidebarState) {
      setSidebarVisible(true);
      setTimeout(() => {
        setIsSidebarOpen(true);
      }, 10);
    } else {
      setIsSidebarOpen(false);
    }
  };
  
  // Handle sidebar animations
  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarVisible(true);
      
      setTimeout(() => {
        const sidebar = document.getElementById('dashboard-sidebar');
        const fullscreenSidebar = document.getElementById('fullscreen-dashboard-sidebar');
        
        if (sidebar) sidebar.style.width = SIDEBAR_WIDTH;
        if (fullscreenSidebar) fullscreenSidebar.style.width = SIDEBAR_WIDTH;
      }, 50);
    } else {
      const sidebar = document.getElementById('dashboard-sidebar');
      const fullscreenSidebar = document.getElementById('fullscreen-dashboard-sidebar');
      
      if (sidebar) sidebar.style.width = '0px';
      if (fullscreenSidebar) fullscreenSidebar.style.width = '0px';
      
      setTimeout(() => {
        setSidebarVisible(false);
      }, 300);
    }
  }, [isSidebarOpen, SIDEBAR_WIDTH]);
  

  // Data from the provided table with updated theme colors
  const conditionData = [
    { name: 'Excellent', value: 0.4982, color: COLORS.primary },
    { name: 'Good', value: 0.2131, color: COLORS.secondary },
    { name: 'Fair', value: 0.1652, color: '#607D8B' },
    { name: 'Poor', value: 0.1083, color: '#95A5A6' },
    { name: 'Failed', value: 0.0152, color: '#7F8C8D' }
  ];

  // Transform data for category breakdown
  const categoryData = [
    { category: 'Mobility', excellent: 0.42, good: 0.48, fair: 0.09, poor: 0, failed: 0 },
    { category: 'Utilities', excellent: 0.22, good: 0.12, fair: 0.49, poor: 0.14, failed: 0.03 },
    { category: 'Stormwater', excellent: 0.02, good: 0.02, fair: 0.01, poor: 0.01, failed: 0.01 },
    { category: 'Facilities', excellent: 0, good: 0, fair: 0.5, poor: 0.5, failed: 0 },
    { category: 'Parks', excellent: 0.01, good: 0.02, fair: 0.09, poor: 0.06, failed: 0 }
  ];

  // Infrastructure network breakdown
  const networkData = [
    { name: 'Major Bridges', condition: 'Good', value: 0.42 },
    { name: 'Streets', condition: 'Fair', value: 0.14 },
    { name: 'Urban Trails', condition: 'Poor', value: 0 },
    { name: 'Wastewater Treatment', condition: 'Fair', value: 0.22 },
    { name: 'Water Networks', condition: 'Good', value: 0.99 },
    { name: 'Drainage Channels', condition: 'Fair', value: 0.3 },
    { name: 'Storm Drains', condition: 'Poor', value: 0.02 }
  ];
  
  // Calculate percentages
  const totalSatisfactory = conditionData.slice(0, 3).reduce((sum, item) => sum + item.value, 0);
  const totalUnsatisfactory = conditionData.slice(3).reduce((sum, item) => sum + item.value, 0);
  
  // Theme colors for bar charts
  const categoryColors = {
    excellent: COLORS.primary,
    good: COLORS.secondary,
    fair: COLORS.coral, 
    poor: COLORS.cta,
    failed: '#7F8C8D'
  };

  // Chart definitions
  const charts = [
    {
      id: 'overall',
      name: 'Overall Condition',
      description: 'Distribution of infrastructure condition ratings',
      render: () => (
        <div className={isMobile ? "h-48" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={isMobile ? null : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    },
    {
      id: 'category',
      name: 'Condition by Category',
      description: 'Infrastructure condition breakdown by category',
      render: () => (
        <div className={isMobile ? "h-48" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}
              barSize={isMobile ? 15 : 20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{fontSize: isMobile ? 10 : 12}} />
              <YAxis tick={{fontSize: isMobile ? 10 : 12}} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={isMobile ? {fontSize: '10px'} : {}} />
              <Bar dataKey="excellent" stackId="a" name="Excellent" fill={categoryColors.excellent} />
              <Bar dataKey="good" stackId="a" name="Good" fill={categoryColors.good} />
              <Bar dataKey="fair" stackId="a" name="Fair" fill={categoryColors.fair} />
              <Bar dataKey="poor" stackId="a" name="Poor" fill={categoryColors.poor} />
              <Bar dataKey="failed" stackId="a" name="Failed" fill={categoryColors.failed} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    },
    {
      id: 'network',
      name: 'Network Analysis',
      description: 'Critical infrastructure network condition scores',
      render: () => (
        <div className={isMobile ? "h-48" : "h-64"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={isMobile ? networkData.slice(0, 5) : networkData}
              margin={{ top: 20, right: isMobile ? 40 : 30, left: isMobile ? 10 : 20, bottom: 5 }}
              layout="vertical"
              barSize={isMobile ? 15 : 20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{fontSize: isMobile ? 10 : 12}} />
              <YAxis type="category" dataKey="name" width={isMobile ? 90 : 120} tick={{fontSize: isMobile ? 10 : 12}} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={isMobile ? {fontSize: '10px'} : {}} />
              <Bar 
                dataKey="value" 
                name="Condition Score" 
                fill={COLORS.coral}
                label={isMobile ? null : { position: 'right', formatter: (value) => `${(value * 100).toFixed(0)}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
  ];

  // Regular panel content
  const regularPanelContent = (
    <div className="flex flex-col w-full h-full bg-white p-4" ref={chartContainerRef}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`} style={{ color: COLORS.primary }}>
          {isMobile ? "Infrastructure Analysis" : "Infrastructure Condition Analysis"}
        </h2>

<div className="flex items-center space-x-2">
  {singleChartView && (
    <button 
      onClick={() => setSingleChartView(null)}
      className="flex items-center justify-center p-2 rounded-full transition-all"
      title="Return to dashboard"
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
      <X size={isMobile ? 16 : 18} />
    </button>
  )}
  <button 
    onClick={() => setShowSources(prev => !prev)}
    className="flex items-center justify-center p-2 rounded-full transition-all"
    title="View Sources"
    style={{ 
      color: COLORS.coral,
      backgroundColor: 'white',
      border: 'none',
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
  >
    <Info size={isMobile ? 16 : 20} />
  </button>

  {/* Only render fullscreen button when not on mobile */}
  {!isMobile && (
     
    <button onClick={() => onFullscreenChange(true)}
          className="flex items-center justify-center p-2 rounded-full transition-all"
      title="Toggle fullscreen"
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
      <Maximize2 size={18} />
    </button>
  )}
</div>
      </div>
      
      {singleChartView ? (
        // Single chart view
        <div className="flex-1">
          <div className="bg-gray-50 p-4 rounded-lg shadow h-full">
            <h3 className={`${isMobile ? "text-sm" : "text-md"} font-medium mb-4`} style={{ color: COLORS.secondary }}>
              {charts.find(chart => chart.id === singleChartView)?.name}
            </h3>
            <div className="h-full">
              {charts.find(chart => chart.id === singleChartView)?.render()}
            </div>
          </div>
        </div>
      ) : (
        // Dashboard grid view
        <>
          <div className="mb-6">
            {/* Pie Chart - Overall Condition */}
            <div 
              className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer transition-all"
              onClick={() => setSingleChartView('overall')}
              style={{ transition: 'all 0.2s ease-in-out' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 className={`${isMobile ? "text-sm" : "text-md"} font-medium mb-2`} style={{ color: COLORS.secondary }}>
                Overall Infrastructure Condition
              </h3>
              {charts.find(chart => chart.id === 'overall')?.render()}
            </div>
          </div>
          
          {/* Bar Chart - Infrastructure by Category */}
          <div 
            className="bg-gray-50 p-4 rounded-lg shadow mb-6 cursor-pointer transition-all"
            onClick={() => setSingleChartView('category')}
            style={{ transition: 'all 0.2s ease-in-out' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 className={`${isMobile ? "text-sm" : "text-md"} font-medium mb-2`} style={{ color: COLORS.secondary }}>
              Infrastructure Condition by Category
            </h3>
            {charts.find(chart => chart.id === 'category')?.render()}
          </div>
          
          {/* Bar Chart - Network Analysis */}
          <div 
            className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer transition-all"
            onClick={() => setSingleChartView('network')}
            style={{ transition: 'all 0.2s ease-in-out' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 className={`${isMobile ? "text-sm" : "text-md"} font-medium mb-2`} style={{ color: COLORS.secondary }}>
              Critical Infrastructure Network Analysis
            </h3>
            {charts.find(chart => chart.id === 'network')?.render()}
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6">
            <div className="bg-gray-50 p-2 md:p-4 rounded-lg shadow border text-center" style={{ borderColor: COLORS.coral }}>
              <p className={`${isMobile ? "text-xs" : "text-sm"}`} style={{ color: COLORS.secondary }}>Satisfactory</p>
              <p className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`} style={{ color: COLORS.coral }}>
                {(totalSatisfactory * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 p-2 md:p-4 rounded-lg shadow border text-center" style={{ borderColor: COLORS.cta }}>
              <p className={`${isMobile ? "text-xs" : "text-sm"}`} style={{ color: COLORS.secondary }}>Unsatisfactory</p>
              <p className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`} style={{ color: COLORS.cta }}>
                {(totalUnsatisfactory * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 p-2 md:p-4 rounded-lg shadow border text-center" style={{ borderColor: COLORS.secondary }}>
              <p className={`${isMobile ? "text-xs" : "text-sm"}`} style={{ color: COLORS.secondary }}>Critical Hotspots</p>
              <p className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`} style={{ color: COLORS.secondary }}>18</p>
            </div>
            <div className="bg-gray-50 p-2 md:p-4 rounded-lg shadow border text-center" style={{ borderColor: COLORS.primary }}>
              <p className={`${isMobile ? "text-xs" : "text-sm"}`} style={{ color: COLORS.secondary }}>Priority Interventions</p>
              <p className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`} style={{ color: COLORS.primary }}>9</p>
            </div>
          </div>

          {/* Source Information */}
          <div className="mt-6 text-xs" style={{ color: COLORS.secondary }}>
            <p>Source: FY2020 Infrastructure Condition Assessment (10/1/19)</p>
          </div>
        </>
      )}
    </div>
  );

  // Fullscreen panel content
  const fullscreenPanelContent = (
    <div className="absolute inset-0 z-50 bg-white overflow-hidden rounded-xl shadow-lg">
    <div className="flex flex-col md:flex-row bg-white h-full overflow-hidden">
        {/* Sidebar - only visible on larger screens or when explicitly opened on mobile */}
        {sidebarVisible && (
          <div 
            id="fullscreen-dashboard-sidebar"
            className={`border-r overflow-auto ${isMobile ? 'fixed inset-0 z-10' : ''}`}
            style={{ 
              width: isSidebarOpen ? SIDEBAR_WIDTH : '0px',
              borderColor: '#e5e7eb', 
              backgroundColor: COLORS.white,
              transition: 'width 300ms ease-in-out',
              overflowX: 'hidden'
            }}
          >
            {isMobile && (
              <div className="bg-gray-100 p-2 flex justify-end">
                <button 
                  onClick={toggleSidebar}
                  className="p-1 rounded"
                >
                  <X size={20} color={COLORS.secondary} />
                </button>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-4" style={{ color: COLORS.primary }}>Dashboard</h3>
              {charts.map(chart => (
                <button
                  key={chart.id}
                  className="w-full text-left px-4 py-3 text-sm mb-2 rounded-full transition-all"
                  style={{
                    backgroundColor: singleChartView === chart.id ? COLORS.coral : '#f3f4f6',
                    color: singleChartView === chart.id ? 'white' : COLORS.secondary,
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => {
                    setSingleChartView(chart.id);
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (singleChartView !== chart.id) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (singleChartView !== chart.id) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {chart.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: COLORS.coral }}>
            <div className="flex items-center">
              <h2 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Infrastructure Dashboard</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSidebar}
                className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                style={{ 
                  color: COLORS.coral,
                  backgroundColor: 'white',
                  border: 'none',
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
              >
                {isSidebarOpen && !isMobile ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
              <button 
                onClick={() => setShowSources(prev => !prev)}
                className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
                title="View Sources"
                style={{ 
                  color: COLORS.coral,
                  backgroundColor: 'white',
                  border: 'none',
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
              >
                <Info size={isMobile ? 18 : 20} />
              </button>
               <button
              onClick={() => onFullscreenChange(!isFullscreen)}
                className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
                title="Exit fullscreen"
                style={{ 
                  color: COLORS.coral,
                  backgroundColor: 'white',
                  border: 'none',
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
              >
                <X size={isMobile ? 18 : 20} />
              </button>
            </div>
          </div>

          {/* Chart content */}
          <div className="flex-1 p-3 md:p-6 overflow-auto">
            {singleChartView ? (
              // Single chart view in fullscreen
              <div className="bg-gray-50 p-3 md:p-6 rounded-lg shadow h-full">
                <div className="mb-4">
                  <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`} style={{ color: COLORS.primary }}>
                    {charts.find(chart => chart.id === singleChartView)?.name}
                  </h3>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} mt-1`} style={{ color: COLORS.secondary }}>
                    {charts.find(chart => chart.id === singleChartView)?.description}
                  </p>
                </div>
                <div className="h-5/6">
                  {charts.find(chart => chart.id === singleChartView)?.render()}
                </div>
              </div>
            ) : (
              // Show all charts in a grid
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 h-full">
                {charts.map(chart => (
                  <div 
                    key={chart.id}
                    className="bg-gray-50 p-3 md:p-4 rounded-lg shadow cursor-pointer transition-all"
                    onClick={() => setSingleChartView(chart.id)}
                    style={{ transition: 'all 0.2s ease-in-out' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h3 className={`${isMobile ? "text-sm" : "text-md"} font-medium mb-2`} style={{ color: COLORS.secondary }}>
                      {chart.name}
                    </h3>
                    {chart.render()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key metrics row - always visible in fullscreen */}
          <div className="bg-white border-t p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg shadow border text-center" style={{ borderColor: COLORS.coral }}>
                <p className="text-sm" style={{ color: COLORS.secondary }}>Satisfactory</p>
                <p className="text-xl font-bold" style={{ color: COLORS.coral }}>{(totalSatisfactory * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg shadow border text-center" style={{ borderColor: COLORS.cta }}>
                <p className="text-sm" style={{ color: COLORS.secondary }}>Unsatisfactory</p>
                <p className="text-xl font-bold" style={{ color: COLORS.cta }}>{(totalUnsatisfactory * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg shadow border text-center" style={{ borderColor: COLORS.secondary }}>
                <p className="text-sm" style={{ color: COLORS.secondary }}>Critical Hotspots</p>
                <p className="text-xl font-bold" style={{ color: COLORS.secondary }}>18</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg shadow border text-center" style={{ borderColor: COLORS.primary }}>
                <p className="text-sm" style={{ color: COLORS.secondary }}>Priority Interventions</p>
                <p className="text-xl font-bold" style={{ color: COLORS.primary }}>9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div className="relative w-full h-full">
      {regularPanelContent}
      {isFullscreen && fullscreenPanelContent}

      {/* Sources panel with inline styles */}
{showSources && (
  <div ref={infoRef}
    className="fixed right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in"
    style={{ top: '190px' }} // Use inline style for top positioning
  >
    <div className="space-y-2 text-sm text-gray-700">
      <div>
        
        <a
          href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8/about_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Infrastructure Stats
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
Building Condition (contains building footprints, maintenance details, conditions, and year built)        </a>
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
    </div>
  </div>
)}

      {/* Styles */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
  
};

export default InfrastructureConditionDashboard;