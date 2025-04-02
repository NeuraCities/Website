"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart2, Maximize2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import dynamic from 'next/dynamic';
import { FullscreenArtifactNavigation, FullscreenArtifactGallery } from "./FullscreenArtifactComponents";

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
    </div>
  )
});

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  neutral: '#F5F5F5',
  white: '#FFFFFF',
  coral: '#008080',
  cta: '#FF5747'
};



const ChartsComponent = ({ 
  artifacts = [], 
  currentArtifactId, 
  onSelectArtifact, 
  onBack 
}) => {
  const [activeChart, setActiveChart] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [chartTypes, setChartTypes] = useState({
    'pavement': 'bar',
    'traffic': 'line',
    'curves': 'pie',
    'design': 'heatmap'
  });
  const chartContainerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [singleChartView, setSingleChartView] = useState(null); 
  const [showArtifactGallery, setShowArtifactGallery] = useState(false);
  const [skipResize, setSkipResize] = useState(false);
const chartDimensionsRef = useRef({});
const resizeTimeoutRef = useRef(null);

  
  const SIDEBAR_WIDTH = '250px';
  
  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFullscreenShowGallery = () => {
    setShowArtifactGallery(true);
  };

  const handleFullscreenGalleryBack = () => {
    setShowArtifactGallery(false);
  };

  const handleChartResize = (force = false) => {
    // Skip resize if flag is set and not forcing
    if (skipResize && !force) return;
    
    // Clear any existing timeout to implement debouncing
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    // Set a new timeout to resize after a delay
    resizeTimeoutRef.current = setTimeout(() => {
      if (!chartContainerRef.current) return;
      
      try {
        // Save current dimensions before resizing if available
        if (window.Plotly && document.querySelector('.js-plotly-plot')) {
          const plotlyElements = document.querySelectorAll('.js-plotly-plot');
          
          plotlyElements.forEach(plot => {
            // Only resize if dimensions have actually changed
            const plotId = plot.id;
            const currentRect = plot.getBoundingClientRect();
            const prevDimensions = chartDimensionsRef.current[plotId];
            
            if (!prevDimensions || 
                Math.abs(prevDimensions.width - currentRect.width) > 5 || 
                Math.abs(prevDimensions.height - currentRect.height) > 5) {
              
              if (window.Plotly.Plots && typeof window.Plotly.Plots.resize === 'function') {
                window.Plotly.Plots.resize(plot);
                
                // Save new dimensions
                chartDimensionsRef.current[plotId] = {
                  width: currentRect.width,
                  height: currentRect.height
                };
              }
            }
          });
        }
      } catch (e) {
        console.warn('Could not resize Plotly charts:', e);
      }
      
      // Reset the resize timeout ref
      resizeTimeoutRef.current = null;
    }, 200); // 200ms debounce
  };
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Make the resize function globally available
    window.handleChartResize = handleChartResize;
    
    return () => {
      // Clean up when component unmounts
      delete window.handleChartResize;
    };
  }, []);

  // Add MutationObserver to detect size changes
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Create a MutationObserver to detect style changes (including width/height)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')) {
          handleChartResize();
        }
      }
    });
    
    // Start observing the chart container
    observer.observe(chartContainerRef.current, { 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    });
    
    // Also observe the parent container for style changes
    if (chartContainerRef.current.parentElement) {
      observer.observe(chartContainerRef.current.parentElement, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
      
      // And the grandparent too for good measure
      if (chartContainerRef.current.parentElement.parentElement) {
        observer.observe(chartContainerRef.current.parentElement.parentElement, { 
          attributes: true, 
          attributeFilter: ['style', 'class'] 
        });
      }
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Toggle sidebar without resetting width
  const toggleSidebar = () => {
    // Store current sidebar state
    const newSidebarState = !isSidebarOpen;
    
    if (newSidebarState) {
      // If opening sidebar
      setSidebarVisible(true);
      setTimeout(() => {
        setIsSidebarOpen(true);
      }, 10);
    } else {
      // If closing sidebar
      setIsSidebarOpen(false);
    }
    
    // Force multiple resize events during animation to make charts responsive
    const resizeInterval = setInterval(handleChartResize, 50);
    
    // Clear interval after animation completes
    setTimeout(() => {
      clearInterval(resizeInterval);
      handleChartResize();
    }, 350);
  };

  // Handle sidebar animations
  useEffect(() => {
    if (isSidebarOpen) {
      // First make sidebar visible
      setSidebarVisible(true);
      
      // Then set width for animation
      setTimeout(() => {
        const sidebar = document.getElementById('chart-sidebar');
        const fullscreenSidebar = document.getElementById('fullscreen-chart-sidebar');
        
        if (sidebar) sidebar.style.width = SIDEBAR_WIDTH;
        if (fullscreenSidebar) fullscreenSidebar.style.width = SIDEBAR_WIDTH;
        
        // Force chart resize after sidebar animation
        setTimeout(handleChartResize, 300);
      }, 50);
    } else {
      // When closing, animate width to 0
      const sidebar = document.getElementById('chart-sidebar');
      const fullscreenSidebar = document.getElementById('fullscreen-chart-sidebar');
      
      if (sidebar) sidebar.style.width = '0px';
      if (fullscreenSidebar) fullscreenSidebar.style.width = '0px';
      
      // After animation completes, hide element and resize chart
      setTimeout(() => {
        setSidebarVisible(false);
        handleChartResize();
      }, 300);
    }
  }, [isSidebarOpen]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Force chart resize after transition
    setTimeout(handleChartResize, 100);
  };

  // Data from Table 2.4: Roadway Surfacing and Pavement Condition
  const pavementData = {
    milepost: [
      '0.0-0.5', '0.5-1.0', '1.0-1.5', '1.5-2.0', '2.0-2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0', '4.0-4.5',
      '4.5-5.0', '5.0-5.5', '5.5-6.0', '6.0-6.5', '6.5-7.0', '7.0-7.5', '7.5-8.0', '8.0-8.5', '8.5-9.0',
      '9.0-9.5', '9.5-10.0', '10.0-10.5', '10.5-11.0', '11.0-11.5', '11.5-12.0', '12.0-12.5', '12.5-13.0',
      '13.0-13.5', '13.5-14.0', '14.0-14.5', '14.5-15.0', '15.0-15.5', '15.5-15.8', '15.8-16.5', '16.5-16.8',
      '16.8-16.9', '16.9-17.5', '17.5-18.0', '18.0-18.5', '18.5-19.0', '19.0-19.5'
    ],
    width: [
      30.5, 24.5, 24.0, 24.0, 24.0, 22.5, 24.0, 25.0, 24.0, 25.0, 24.5, 24.0, 23.0, 23.5, 24.0, 24.0,
      24.5, 24.5, 24.5, 24.0, 24.5, 24.0, 24.5, 24.0, 26.0, 25.0, 25.5, 25.0, 25.0, 25.0, 24.0, 24.0,
      25.0, 29.0, 24.0, 22.0, 24.0, 25.0, 23.0, 23.5
    ],
    paserRating: [
      3, 4, 3, 2, 2, 3, 3, 3, 2, 3, 2, 3, 2, 3, 3, 3, 3, 2, 3, 4, 4, 4, 3, 3, 2, 1, 1, 4, 7, 8, 7, 8, 4, 4, 8, 4, 3, 4, 4, 4
    ],
    condition: [
      'Poor', 'Fair', 'Poor', 'Very Poor', 'Very Poor', 'Poor', 'Poor', 'Poor', 'Very Poor', 'Poor',
      'Very Poor', 'Poor', 'Very Poor', 'Poor', 'Poor', 'Poor', 'Poor', 'Very Poor', 'Poor', 'Fair',
      'Fair', 'Fair', 'Poor', 'Poor', 'Very Poor', 'Failing', 'Failing', 'Fair', 'Good', 'Very Good',
      'Good', 'Very Good', 'Good', 'Good', 'Very Good', 'Good', 'Fair', 'Good', 'Good', 'Good'
    ],
    surface: Array(40).fill('Paved')
  };
  
  // Update surface type based on the data
  pavementData.surface[32] = 'Gravel';
  pavementData.surface[33] = 'Gravel';
  pavementData.surface[35] = 'Gravel';
  pavementData.surface[36] = 'Gravel';
  pavementData.surface[37] = 'Gravel';
  pavementData.surface[38] = 'Gravel';
  pavementData.surface[39] = 'Gravel';

  // Data from Table 2.8: Existing Traffic Volumes
  const trafficData = {
    location: [0.5, 5.2, 14.3, 19.3],
    weekdayADT: [285, 195, 151, 39],
    weekendADT: [311, 213, 197, 72],
    combinedADT: [295, 201, 162, 49]
  };

  // Data from Table 2.7: Horizontal Curves Design Speed Met
  const curvesData = {
    mp_0_14: {
      speed: ["≥ 60", "55", "50", "45", "40", "35", "≤ 60"],
      count: [15, 3, 9, 1, 0, 1, 14],
      percent: [52, 10, 31, 3, 0, 3, 48]
    },
    mp_14_19: {
      speed: ["≥ 60", "50", "45", "40", "35", "≤ 30", "≤ 60"],
      count: [0, 2, 1, 5, 3, 2, 13],
      percent: [0, 15, 8, 38, 23, 15, 100]
    }
  };

  // Data from Table 2.6: Geometric Design Criteria
  const designData = {
    traffic: ["0 to 400 vpd", "400 to 2000 vpd", "Over 2000 vpd"],
    terrain: ["Level", "Rolling", "Mountainous"],
    designSpeed: [
      [40, 50, 60],  // Level
      [30, 40, 50],  // Rolling
      [20, 30, 40]   // Mountainous
    ],
    maxGrade: [
      [7, 6, 5],  // Level
      [8, 7, 6],  // Rolling
      [10, 9, 8]  // Mountainous
    ],
    verticalCurvature: {
      crest: [44, 84, 151],
      sag: [64, 96, 136]
    },
    ssd: [305, 425, 570],
    radius: [444, 758, 1200]
  };

  // Chart definitions
  const charts = [
    {
      id: 'pavement',
      name: 'Pavement Condition',
      type: 'bar',
      description: 'Roadway Surfacing and Pavement Condition',
      category: 'condition'
    },
    {
      id: 'traffic',
      name: 'Traffic Volumes',
      type: 'line',
      description: 'Existing Traffic Volumes by Location',
      category: 'traffic'
    },
    {
      id: 'curves',
      name: 'Horizontal Curves',
      type: 'pie',
      description: 'Horizontal Curves Design Speed Met',
      category: 'design'
    },
    {
      id: 'design',
      name: 'Geometric Design',
      type: 'heatmap',
      description: 'Geometric Design Criteria by Traffic Volume and Terrain',
      category: 'design'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Charts' },
    { id: 'condition', name: 'Condition' },
    { id: 'traffic', name: 'Traffic' },
    { id: 'design', name: 'Design' }
  ];

  const filteredCharts = charts.filter(chart =>
    (activeCategory === 'all' || chart.category === activeCategory)
  );

  const chartTypeOptions = {
    'pavement': ['bar', 'line', 'scatter', 'heatmap'],
    'traffic': ['line', 'bar', 'area', 'scatter'],
    'curves': ['pie', 'bar', 'donut', 'radar'],
    'design': ['heatmap', 'contour', 'surface', 'table']
  };

  const handleChartTypeChange = (chartId, type) => {
    // Set the skip resize flag
    setSkipResize(true);
    
    // Update the chart type
    setChartTypes(prev => ({
      ...prev,
      [chartId]: type
    }));
    
    // Allow resize after a short delay to ensure the chart has been redrawn
    setTimeout(() => {
      setSkipResize(false);
      handleChartResize(true);
    }, 250);
  };

  // === Chart Rendering Functions ===
  
  // Render Pavement Condition Chart
  const renderPavementConditionChart = () => {
    const type = chartTypes['pavement'];
    
    if (!isClient) return <div className="h-64 flex items-center justify-center">Loading...</div>;
    
    const commonLayout = {
      autosize: true,
      margin: { l: 70, r: 70, t:0,  b: 80  }, 
      plot_bgcolor: "rgba(255, 255, 255, 0.4)",
      paper_bgcolor: "rgba(255, 255, 255, 0.4)",
      font: { size: 10 }, // Smaller font
      legend: {
        font: { size: 9 },
        orientation: 'h',
        y: -0.2,
        yanchor: 'top',
        x: 0.5,
        xanchor: 'center'
      }
    };
    
    switch(type) {
      case 'bar':
        return (
          <Plot
            data={[
              {
                x: pavementData.milepost,
                y: pavementData.paserRating,
                type: 'bar',
                name: 'PASER Rating',
                marker: {
                  color: pavementData.paserRating.map(rating => {
                    if (rating >= 7) return COLORS.coral; // Very Good/Good
                    if (rating >= 4) return COLORS.primary; // Fair
                    if (rating >= 3) return COLORS.secondary; // Poor
                    if (rating >= 2) return COLORS.neutral; // Very Poor
                    return '#9C27B0'; // Failing
                  })
                }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Pavement Condition by Milepost',
              xaxis: {
                title: 'Milepost Range',
                tickangle: -45,
                tickmode: 'array',
                tickvals: pavementData.milepost.filter((_, i) => i % 5 === 0),
                ticktext: pavementData.milepost.filter((_, i) => i % 5 === 0)
              },
              yaxis: {
                title: 'PASER Rating',
                range: [0, 9]
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'line':
        return (
          <Plot
            data={[
              {
                x: pavementData.milepost,
                y: pavementData.paserRating,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'PASER Rating',
                line: { color: '#008080', width: 3 },
                marker: { 
                  size: 8,
                  color: pavementData.paserRating.map(rating => {
                    if (rating >= 7) return '#4CAF50'; // Very Good/Good
                    if (rating >= 4) return '#2196F3'; // Fair
                    if (rating >= 3) return '#FF9800'; // Poor
                    if (rating >= 2) return '#F44336'; // Very Poor
                    return '#9C27B0'; // Failing
                  })
                }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Pavement Condition Trend',
              xaxis: {
                title: 'Milepost Range',
                tickangle: -45,
                tickmode: 'array',
                tickvals: pavementData.milepost.filter((_, i) => i % 5 === 0),
                ticktext: pavementData.milepost.filter((_, i) => i % 5 === 0)
              },
              yaxis: {
                title: 'PASER Rating',
                range: [0, 9]
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'scatter':
        return (
          <Plot
            data={[
              {
                x: pavementData.milepost,
                y: pavementData.paserRating,
                type: 'scatter',
                mode: 'markers',
                name: 'PASER Rating',
                marker: {
                  size: 12,
                  color: pavementData.paserRating.map(rating => {
                    if (rating >= 7) return '#4CAF50'; // Very Good/Good
                    if (rating >= 4) return '#2196F3'; // Fair
                    if (rating >= 3) return '#FF9800'; // Poor
                    if (rating >= 2) return '#F44336'; // Very Poor
                    return '#9C27B0'; // Failing
                  })
                }
              },
              {
                x: pavementData.milepost,
                y: pavementData.width,
                type: 'scatter',
                mode: 'markers',
                name: 'Width (ft)',
                yaxis: 'y2',
                marker: {
                  size: 8,
                  symbol: 'circle-open',
                  color: '#9C27B0',
                  line: {
                    width: 2,
                    color: '#9C27B0'
                  }
                }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Pavement Rating vs Width',
              xaxis: {
                title: 'Milepost Range',
                tickangle: -45,
                tickmode: 'array',
                tickvals: pavementData.milepost.filter((_, i) => i % 5 === 0),
                ticktext: pavementData.milepost.filter((_, i) => i % 5 === 0)
              },
              yaxis: {
                title: 'PASER Rating',
                range: [0, 9]
              },
              yaxis2: {
                title: 'Width (ft)',
                range: [20, 35],
                overlaying: 'y',
                side: 'right'
              },
              legend: {
                x: 0.01,
                y: 0.99,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#E5E7EB',
                borderwidth: 1
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'heatmap':
        // Create condition categories for heatmap
        const conditions = ['Very Good', 'Good', 'Fair', 'Poor', 'Very Poor', 'Failing'];
        const conditionCounts = {};
        const segments = ['MP 0-5', 'MP 5-10', 'MP 10-15', 'MP 15-20'];
        
        // Initialize counts
        segments.forEach(segment => {
          conditionCounts[segment] = {};
          conditions.forEach(condition => {
            conditionCounts[segment][condition] = 0;
          });
        });
        
        // Count conditions per segment
        pavementData.condition.forEach((condition, i) => {
          const mp = parseFloat(pavementData.milepost[i].split('-')[0]);
          let segment;
          
          if (mp < 5) segment = segments[0];
          else if (mp < 10) segment = segments[1];
          else if (mp < 15) segment = segments[2];
          else segment = segments[3];
          
          conditionCounts[segment][condition] = (conditionCounts[segment][condition] || 0) + 1;
        });
        
        // Convert to heatmap data format
        const zValues = [];
        
        segments.forEach(segment => {
          const row = [];
          conditions.forEach(condition => {
            row.push(conditionCounts[segment][condition]);
          });
          zValues.push(row);
        });
        
        return (
          <Plot
            data={[
              {
                z: zValues,
                x: conditions,
                y: segments,
                type: 'heatmap',
                colorscale: [
                  [0, '#FFFFFF'],
                  [0.2, '#E1F5FE'],
                  [0.4, '#4FC3F7'],
                  [0.6, '#0288D1'],
                  [0.8, '#01579B'],
                  [1, '#002171']
                ],
                showscale: true,
                colorbar: {
                  title: 'Count',
                  titleside: 'right',
                  y: -0.15,  // Position below the chart
    orientation: 'h', // Make it horizontal
    len: 0.5,  // Make it 50% of the width
    xanchor: 'center',
    x: 0.5
                },
                hovertemplate: 'Segment: %{y}<br>Condition: %{x}<br>Count: %{z}<extra></extra>'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Pavement Condition Distribution by Segment',
              xaxis: {
                title: 'Condition'
              },
              yaxis: {
                title: 'Road Segment'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p>Select a chart type</p>
          </div>
        );
    }
  };

  // Render Traffic Volumes Chart
  const renderTrafficVolumesChart = () => {
    const type = chartTypes['traffic'];
    
    if (!isClient) return <div className="h-64 flex items-center justify-center">Loading...</div>;
    
    // Common layout options to ensure responsiveness
    const commonLayout = {
      autosize: true,
      margin: { l: 70, r: 70, t: 0, b: 80}, 
      plot_bgcolor: "rgba(255, 255, 255, 0.4)",
      paper_bgcolor: "rgba(255, 255, 255, 0.4)",
      font: { size: 10 }, // Smaller font
      legend: {
        font: { size: 9 },
        orientation: 'h',
        y: -0.2,
        yanchor: 'top',
        x: 0.5,
        xanchor: 'center'
      }
    };
    
    switch(type) {
      case 'line':
        return (
          <Plot
            data={[
              {
                x: trafficData.location,
                y: trafficData.weekdayADT,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Weekday ADT',
                line: { color: '#008080', width: 3 },
                marker: { size: 8 }
              },
              {
                x: trafficData.location,
                y: trafficData.weekendADT,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Weekend ADT',
                line: { color: '#2C3E50', width: 3 },
                marker: { size: 8 }
              },
              {
                x: trafficData.location,
                y: trafficData.combinedADT,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Combined ADT',
                line: { color: COLORS.cta, width: 3 },
                marker: { size: 8 }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Traffic Volumes by Location',
              xaxis: {
                title: 'Location (MP)',
                tickmode: 'array',
                tickvals: trafficData.location
              },
              yaxis: {
                title: 'Average Daily Traffic (vpd)',
                rangemode: 'tozero'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'bar':
        return (
          <Plot
            data={[
              {
                x: trafficData.location,
                y: trafficData.weekdayADT,
                type: 'bar',
                name: 'Weekday ADT',
                marker: { color: '#008080' }
              },
              {
                x: trafficData.location,
                y: trafficData.weekendADT,
                type: 'bar',
                name: 'Weekend ADT',
                marker: { color: '#2C3E50' }
              },
              {
                x: trafficData.location,
                y: trafficData.combinedADT,
                type: 'bar',
                name: 'Combined ADT',
                marker: { color: COLORS.cta }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Traffic Volumes by Location',
              barmode: 'group',
              xaxis: {
                title: 'Location (MP)',
                tickmode: 'array',
                tickvals: trafficData.location
              },
              yaxis: {
                title: 'Average Daily Traffic (vpd)',
                rangemode: 'tozero'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'area':
        return (
          <Plot
            data={[
              {
                x: trafficData.location,
                y: trafficData.weekdayADT,
                type: 'scatter',
                mode: 'none',
                fill: 'tozeroy',
                name: 'Weekday ADT',
                fillcolor: 'rgba(0, 128, 128, 0.4)',
                line: { color: '#008080' }
              },
              {
                x: trafficData.location,
                y: trafficData.weekendADT,
                type: 'scatter',
                mode: 'none',
                fill: 'tozeroy',
                name: 'Weekend ADT',
                fillcolor: 'rgba(44, 62, 80, 0.4)',
                line: { color: '#2C3E50' }
              },
              {
                x: trafficData.location,
                y: trafficData.combinedADT,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Combined ADT',
                line: { color: COLORS.cta, width: 3 },
                marker: { size: 8 }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Traffic Volumes by Location',
              xaxis: {
                title: 'Location (MP)',
                tickmode: 'array',
                tickvals: trafficData.location
              },
              yaxis: {
                title: 'Average Daily Traffic (vpd)',
                rangemode: 'tozero'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'scatter':
        return (
          <Plot
            data={[
              {
                x: trafficData.location,
                y: trafficData.weekdayADT,
                type: 'scatter',
                mode: 'markers',
                name: 'Weekday ADT',
                marker: { 
                  size: 15, 
                  color: '#008080',
                  symbol: 'circle'
                }
              },
              {
                x: trafficData.location,
                y: trafficData.weekendADT,
                type: 'scatter',
                mode: 'markers',
                name: 'Weekend ADT',
                marker: { 
                  size: 15, 
                  color: '#2C3E50',
                  symbol: 'square'
                }
              },
              {
                x: trafficData.location,
                y: trafficData.combinedADT,
                type: 'scatter',
                mode: 'markers',
                name: 'Combined ADT',
                marker: { 
                  size: 15, 
                  color: '#E74C3C',
                  symbol: 'diamond'
                }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Traffic Volumes Comparison',
              xaxis: {
                title: 'Location (MP)',
                tickmode: 'array',
                tickvals: trafficData.location
              },
              yaxis: {
                title: 'Average Daily Traffic (vpd)',
                rangemode: 'tozero'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p>Select a chart type</p>
          </div>
        );
    }
  };

  // Render Horizontal Curves Chart
  const renderHorizontalCurvesChart = () => {
    const type = chartTypes['curves'];
    
    if (!isClient) return <div className="h-64 flex items-center justify-center">Loading...</div>;
    
    // Common layout options to ensure responsiveness
    const commonLayout = {
      autosize: true,
      margin: { l: 70, r: 70, t: 0, b: 80 }, 
      plot_bgcolor: "rgba(255, 255, 255, 0.4)",
      paper_bgcolor: "rgba(255, 255, 255, 0.4)",
      font: { size: 10 }, // Smaller font
      legend: {
        font: { size: 9 },
        orientation: 'h',
        y: -0.2,
        yanchor: 'top',
        x: 0.5,
        xanchor: 'center'
      }
    };
    
    switch(type) {
      case 'pie':
        return (
          <Plot
            data={[
              {
                values: curvesData.mp_0_14.count,
                labels: curvesData.mp_0_14.speed,
                type: 'pie',
                name: 'MP 0.0 - 14.35',
                domain: {
                  row: 0,
                  column: 0
                },
                title: {
                  text: 'MP 0.0 - 14.35',
                  font: {
                    size: 16
                  }
                },
                marker: {
                  colors: [
                    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
                    '#FF9800', '#FF5722', '#F44336'
                  ]
                },
                textinfo: 'label+percent',
                hoverinfo: 'label+value+percent'
              },
              {
                values: curvesData.mp_14_19.count,
                labels: curvesData.mp_14_19.speed,
                type: 'pie',
                name: 'MP 14.35 - 19.5',
                domain: {
                  row: 0,
                  column: 1
                },
                title: {
                  text: 'MP 14.35 - 19.5',
                  font: {
                    size: 16
                  }
                },
                marker: {
                  colors: [
                    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
                    '#FF9800', '#FF5722', '#F44336'
                  ]
                },
                textinfo: 'label+percent',
                hoverinfo: 'label+value+percent'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Horizontal Curves Design Speed Distribution',
              grid: {
                rows: 1,
                columns: 2
              },
              annotations: [
                {
                  text: "Design Speed Met (mph)",
                  showarrow: false,
                  x: 0.5,
                  y: 1.1,
                  xref: 'paper',
                  yref: 'paper',
                  font: {
                    size: 14
                  }
                }
              ]
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'bar':
        return (
          <Plot
            data={[
              {
                x: curvesData.mp_0_14.speed,
                y: curvesData.mp_0_14.count,
                type: 'bar',
                name: 'MP 0.0 - 14.35',
                marker: { color: '#008080' }
              },
              {
                x: curvesData.mp_14_19.speed,
                y: curvesData.mp_14_19.count,
                type: 'bar',
                name: 'MP 14.35 - 19.5',
                marker: { color: '#2C3E50' }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Horizontal Curves by Design Speed',
              barmode: 'group',
              xaxis: {
                title: 'Design Speed Met (mph)'
              },
              yaxis: {
                title: 'Number of Curves',
                rangemode: 'tozero'
              },
              legend: {
                x: 0.01,
                y: 0.99,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#E5E7EB',
                borderwidth: 1
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'donut':
        return (
          <Plot
            data={[
              {
                values: curvesData.mp_0_14.count,
                labels: curvesData.mp_0_14.speed,
                type: 'pie',
                name: 'MP 0.0 - 14.35',
                domain: {
                  row: 0,
                  column: 0
                },
                title: {
                  text: 'MP 0.0 - 14.35',
                  font: {
                    size: 16
                  }
                },
                hole: 0.4,
                marker: {
                  colors: [
                    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
                    '#FF9800', '#FF5722', '#F44336'
                  ]
                },
                textinfo: 'label+percent',
                hoverinfo: 'label+value+percent'
              },
              {
                values: curvesData.mp_14_19.count,
                labels: curvesData.mp_14_19.speed,
                type: 'pie',
                name: 'MP 14.35 - 19.5',
                domain: {
                  row: 0,
                  column: 1
                },
                title: {
                  text: 'MP 14.35 - 19.5',
                  font: {
                    size: 16
                  }
                },
                hole: 0.4,
                marker: {
                  colors: [
                    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
                    '#FF9800', '#FF5722', '#F44336'
                  ]
                },
                textinfo: 'label+percent',
                hoverinfo: 'label+value+percent'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Horizontal Curves Design Speed Distribution',
              grid: {
                rows: 1,
                columns: 2
              },
              annotations: [
                {
                  text: 'MP 0.0 - 14.35',
                  showarrow: false,
                  x: 0.16,
                  y: 0.5,
                  font: {
                    size: 14
                  }
                },
                {
                  text: 'MP 14.35 - 19.5',
                  showarrow: false,
                  x: 0.84,
                  y: 0.5,
                  font: {
                    size: 14
                  }
                }
              ]
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'radar':
        return (
          <Plot
            data={[
              {
                r: curvesData.mp_0_14.count,
                theta: curvesData.mp_0_14.speed,
                type: 'scatterpolar',
                fill: 'toself',
                name: 'MP 0.0 - 14.35',
                line: { color: '#008080' },
                fillcolor: 'rgba(0, 128, 128, 0.3)'
              },
              {
                r: curvesData.mp_14_19.count.filter(c => c > 0),
                theta: curvesData.mp_14_19.speed.filter((_, i) => curvesData.mp_14_19.count[i] > 0),
                type: 'scatterpolar',
                fill: 'toself',
                name: 'MP 14.35 - 19.5',
                line: { color: '#2C3E50' },
                fillcolor: 'rgba(44, 62, 80, 0.3)'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Horizontal Curves Design Speed Distribution',
              polar: {
                radialaxis: {
                  visible: true,
                  range: [0, 16]
                }
              },
              legend: {
                x: 0.01,
                y: 0.99,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#E5E7EB',
                borderwidth: 1
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p>Select a chart type</p>
          </div>
        );
    }
  };
  
  // Render Geometric Design Chart
  const renderGeometricDesignChart = () => {
    const type = chartTypes['design'];
    
    if (!isClient) return <div className="h-64 flex items-center justify-center">Loading...</div>;
    
    // Common layout options to ensure responsiveness
    const commonLayout = {
      autosize: true,
      margin: { l: 70, r: 70, t: 0, b: 80 }, 
      plot_bgcolor: "rgba(255, 255, 255, 0.4)",
      paper_bgcolor: "rgba(255, 255, 255, 0.4)",
      font: { size: 10 }, // Smaller font
      legend: {
        font: { size: 9 },
        orientation: 'h',
        y: -0.2,
        yanchor: 'top',
        x: 0.5,
        xanchor: 'center'
      }
    };
    
    switch(type) {
      case 'heatmap':
        return (
          <Plot
            data={[
              {
                z: designData.designSpeed,
                x: designData.traffic,
                y: designData.terrain,
                type: 'heatmap',
                colorscale: 'Viridis',
                showscale: true,
                
                colorbar: {
                  title: 'Design Speed (mph)',
                  showscale: true,
                  titleside: 'right',
                  y: -0.15,  // Position below the chart
    orientation: 'h', // Make it horizontal
    len: 0.5,  // Make it 50% of the width
    xanchor: 'center',
    x: 0.5
                },
                hovertemplate: 'Traffic: %{x}<br>Terrain: %{y}<br>Design Speed: %{z} mph<extra></extra>'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Design Speed by Traffic Volume and Terrain',
              xaxis: {
                title: 'Traffic Volume'
              },
              yaxis: {
                title: 'Terrain Type'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'contour':
        return (
          <Plot
            data={[
              {
                z: designData.designSpeed,
                x: designData.traffic,
                y: designData.terrain,
                type: 'contour',
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                  title: 'Design Speed (mph)',
                  y: -0.15,  // Position below the chart
    orientation: 'h', // Make it horizontal
    len: 0.5,  // Make it 50% of the width
    xanchor: 'center',
    x: 0.5
                },
                
                contours: {
                  coloring: 'heatmap',
                  showlabels: true,
                },
                hovertemplate: 'Traffic: %{x}<br>Terrain: %{y}<br>Design Speed: %{z} mph<extra></extra>'
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Design Speed Contour by Traffic and Terrain',
              xaxis: {
                title: 'Traffic Volume'
              },
              yaxis: {
                title: 'Terrain Type'
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'surface':
        return (
          <Plot
            data={[
              {
                z: designData.designSpeed,
                x: designData.traffic,
                y: designData.terrain,
                type: 'surface',
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                  title: 'Design Speed (mph)',
                  y: -0.15,  // Position below the chart
    orientation: 'h', // Make it horizontal
    len: 0.5,  // Make it 50% of the width
    xanchor: 'center',
    x: 0.5
                },
                contours: {
                  z: {
                    show: true,
                    usecolormap: true,
                    highlightcolor: "#42f462",
                    project: {z: true}
                  }
                }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Design Speed 3D Surface',
              scene: {
                xaxis: {title: 'Traffic Volume'},
                yaxis: {title: 'Terrain Type'},
                zaxis: {title: 'Design Speed (mph)'}
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      case 'table':
        // Create a table-like visualization
        const annotations = [];
        
        // Create header row
        designData.traffic.forEach((traffic, i) => {
          annotations.push({
            x: i,
            y: -1,
            text: traffic,
            showarrow: false,
            font: {
              size: 14,
              color: 'white'
            },
            bgcolor: '#008080'
          });
        });
        
        // Create row headers and cell values
        designData.terrain.forEach((terrain, i) => {
          // Row header
          annotations.push({
            x: -1,
            y: i,
            text: terrain,
            showarrow: false,
            font: {
              size: 14,
              color: 'white'
            },
            bgcolor: '#2C3E50'
          });
          
          // Cell values
          designData.designSpeed[i].forEach((value, j) => {
            annotations.push({
              x: j,
              y: i,
              text: value.toString(),
              showarrow: false,
              font: {
                size: 14,
                color: '#333'
              },
              bgcolor: 'rgba(240, 240, 240, 0.8)'
            });
          });
        });
        
        return (
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'markers',
                x: [],
                y: [],
                marker: { size: 0 }
              }
            ]}
            layout={{
              ...commonLayout,
              title: 'Design Speed Table by Traffic and Terrain',
              annotations: annotations,
              xaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                range: [-1.5, designData.traffic.length - 0.5]
              },
              yaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                range: [-1.5, designData.terrain.length - 0.5],
                scaleanchor: 'x'
              },
              margin: {
                l: 50,
                r: 50,
                b: 100,
                t: 100,
                pad: 4
              }
            }}
            config={{ 
              responsive: true,
              displayModeBar: false // Optional: hide the mode bar for cleaner look
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p>Select a chart type</p>
          </div>
        );
    }
  };

  // Choose which chart to display
  const renderActiveChart = () => {
    const currentChart = filteredCharts[activeChart];
    
    if (!currentChart) return <div className="flex items-center justify-center h-full">Select a chart</div>;
    
    switch (currentChart.id) {
      case 'pavement':
        return renderPavementConditionChart();
      case 'traffic':
        return renderTrafficVolumesChart();
      case 'curves':
        return renderHorizontalCurvesChart();
      case 'design':
        return renderGeometricDesignChart();
      default:
        return <div className="flex items-center justify-center h-full">Select a chart</div>;
    }
  };

  // === UI Components ===

const regularPanelContent = (
  <div className="flex flex-col h-full w-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
    {sidebarVisible && (
  <div 
    id="chart-sidebar"
    className="border-r overflow-auto"
    style={{ 
      width: isSidebarOpen ? '300px' : '0px',
      borderColor: '#e5e7eb', 
      backgroundColor: COLORS.white,
      transition: 'width 300ms ease-in-out',
      overflowX: 'hidden'
    }}
  >  
    <div className="border-b border-gray-200 px-3" style={{ paddingTop: '2px', paddingBottom: '8px' }}>
    <div className="flex overflow-x-auto hide-scrollbar">
        {categories.map(category => (
          <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className="px-3 py-3 text-sm mx-2 rounded-full whitespace-nowrap transition-all" // Increased py from 1.5 to 2
          style={{
            backgroundColor: activeCategory === category.id ? COLORS.coral : '#f3f4f6',
            color: activeCategory === category.id ? 'white' : COLORS.secondary,
            boxShadow: activeCategory === category.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            if (activeCategory !== category.id) {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategory !== category.id) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
        >
          {category.name}
        </button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-auto">
  {filteredCharts.length === 0 ? (
    <div className="p-4 text-center text-gray-500">
      No charts found matching your selection
    </div>
  ) : (
    filteredCharts.map((chart, index) => (
      <button
        key={chart.id}
        className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 transition-all rounded-full mx-3"
        style={{
          backgroundColor: activeChart === index ? COLORS.coral : '#f3f4f6',
          color: activeChart === index ? 'white' : COLORS.secondary,
          border: 'none',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => setActiveChart(index)}
        onMouseEnter={(e) => {
          if (activeChart !== index) {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseLeave={(e) => {
          if (activeChart !== index) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
      >
        {chart.name}
      </button>
    ))
  )}
</div>
  </div>
)}
    <div className="bg-[#008080] text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <BarChart2 className="h-5 w-5 mr-2" />
      </div>
      <div className="flex items-center ml-auto">
        {singleChartView && (
          <button 
            onClick={() => {
              setSingleChartView(null);
              setTimeout(handleChartResize, 50);
            }}
            className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
            title="Return to grid view"
            style={{ 
              color: COLORS.coral,
              backgroundColor: 'white',
              border: 'none',
              transition: 'all 0.2s ease-in-out',
              marginRight: '8px'
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
            <X size={20} />
          </button>
        )}
        
        <button 
          onClick={toggleFullscreen}
          className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
          title="Toggle fullscreen"
          style={{ 
            color: COLORS.coral,
            backgroundColor: 'white',
            border: 'none',
            transition: 'all 0.2s ease-in-out',
            marginRight: '8px'
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
          <Maximize2 size={20} />
        </button>
      </div>
    </div>

    <div className="flex-1 w-full" ref={chartContainerRef} style={{ marginTop: '3px', marginRight: '3px' }}>
      {singleChartView ? (
        // Single chart view
        <div className="h-full w-full p-4">
          <div className="flex flex-col h-full border rounded-md overflow-hidden">
            <div className="px-3 py-3 flex justify-between items-center border-b bg-gray-50 ml-4">
              <div className="font-medium text-sm">
                {charts.find(chart => chart.id === singleChartView)?.name || 'Chart'}
              </div>
              <select
                value={chartTypes[singleChartView]}
                onChange={(e) => {
                  handleChartTypeChange(singleChartView, e.target.value);
                  setTimeout(handleChartResize, 50);
                }}
                className="text-xs px-2 py-0.5 border rounded ml-4"
              >
                {chartTypeOptions[singleChartView]?.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 min-w-0 w-full h-full">
              {singleChartView === 'pavement' && renderPavementConditionChart()}
              {singleChartView === 'traffic' && renderTrafficVolumesChart()}
              {singleChartView === 'curves' && renderHorizontalCurvesChart()}
              {singleChartView === 'design' && renderGeometricDesignChart()}
            </div>
          </div>
        </div>
      ) : (
        // Grid view
        <div className="h-full w-full" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))', 
          gridTemplateRows: 'repeat(2, minmax(200px, 1fr))',
          gap: '10px',
          paddingBottom: '80px',
          paddingTop: '0px',
          marginTop: '0px'
        }}>
          <div 
            className="flex flex-col border-r border-b" 
            onClick={() => {
              setSingleChartView('pavement');
              setTimeout(handleChartResize, 50);
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              marginTop: '-10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="px-3 py-2 flex justify-between items-center border-b bg-gray-50">
              <div className="font-medium text-sm">{charts[0].name}</div>
              <select
                value={chartTypes['pavement']}
                onChange={(e) => handleChartTypeChange('pavement', e.target.value)}
                className="text-xs px-2 py-0.5 border rounded ml-4"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
              >
                {chartTypeOptions['pavement'].map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 min-w-0 w-full h-full">
              {renderPavementConditionChart()}
            </div>
          </div>

          <div 
            className="flex flex-col border-l border-b"
            onClick={() => {
              setSingleChartView('traffic');
              setTimeout(handleChartResize, 50);
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              marginTop: '-10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="px-3 py-2 flex justify-between items-center border-b bg-gray-50">
              <div className="font-medium text-sm">{charts[1].name}</div>
              <select
                value={chartTypes['traffic']}
                onChange={(e) => handleChartTypeChange('traffic', e.target.value)}
                className="text-xs px-2 py-0.5 border rounded ml-4"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
              >
                {chartTypeOptions['traffic'].map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 min-w-0 w-full h-full">
              {renderTrafficVolumesChart()}
            </div>
          </div>

          <div 
            className="flex flex-col border-r border-t"
            onClick={() => {
              setSingleChartView('curves');
              setTimeout(handleChartResize, 50);
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              marginTop: '-10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="px-3 py-2 flex justify-between items-center border-b bg-gray-50">
              <div className="font-medium text-sm">{charts[2].name}</div>
              <select
                value={chartTypes['curves']}
                onChange={(e) => handleChartTypeChange('curves', e.target.value)}
                className="text-xs px-2 py-0.5 border rounded ml-4"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
              >
                {chartTypeOptions['curves'].map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 min-w-0 w-full h-full">
              {renderHorizontalCurvesChart()}
            </div>
          </div>

          <div 
            className="flex flex-col border-l border-t"
            onClick={() => {
              setSingleChartView('design');
              setTimeout(handleChartResize, 50);
            }}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              marginTop: '-10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="px-3 py-2 flex justify-between items-center border-b bg-gray-50">
              <div className="font-medium text-sm">{charts[3].name}</div>
              <select
                value={chartTypes['design']}
                onChange={(e) => handleChartTypeChange('design', e.target.value)}
                className="text-xs px-2 py-0.5 border rounded ml-4"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
              >
                {chartTypeOptions['design'].map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 min-w-0 w-full h-full">
              {renderGeometricDesignChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

 // Fullscreen panel content
 const fullscreenPanelContent = (
  <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex flex-col">
    {showArtifactGallery && (
        <FullscreenArtifactGallery
          artifacts={artifacts}
          onSelectArtifact={onSelectArtifact}
          onBack={handleFullscreenGalleryBack}
        />
      )}

      {artifacts.length > 0 && !showArtifactGallery && (
        <FullscreenArtifactNavigation
          artifacts={artifacts}
          currentArtifactId={currentArtifactId}
          onSelectArtifact={onSelectArtifact}
          onShowGallery={handleFullscreenShowGallery}
          onClose={onBack}
        />
      )}
    <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">


<div className="bg-[#008080] text-white px-4 py-3 flex items-center relative">
  <div className="flex items-center">
    <BarChart2 className="h-5 w-5 mr-2" />
  </div>
  
  
  <div className="absolute flex items-center space-x-2" style={{ top: '8px', right: '16px' }}>
    <button 
      onClick={toggleSidebar}
      className="flex items-center justify-center p-2 rounded-full transition-all shadow-sm"
      title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      style={{ 
        color: COLORS.coral,
        backgroundColor: 'white',
        border: 'none',
        transition: 'all 0.2s ease-in-out',
        overflowX: 'hidden'
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
      {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
    
    <button 
      onClick={toggleFullscreen}
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
      <X size={20} />
    </button>
  </div>
</div>


      
      <div className="flex flex-1 overflow-hidden">
        
        {sidebarVisible && (
          <div 
            id="fullscreen-chart-sidebar"
            className="border-r border-gray-200 flex flex-col overflow-hidden" 
            style={{ 
              width: isSidebarOpen ? '300px' : '0px',
              borderColor: '#e5e7eb', 
              transition: 'width 300ms ease-in-out'
            }}
          >  
            
            <div className="border-b border-gray-200 py-3 px-3">
              <div className="flex overflow-x-auto hide-scrollbar">
                {categories.map(category => (
                  <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className="px-3 py-2 text-sm mx-2 rounded-full whitespace-nowrap transition-all" // Increased py from 1.5 to 2
                  style={{
                    backgroundColor: activeCategory === category.id ? COLORS.coral : '#f3f4f6',
                    color: activeCategory === category.id ? 'white' : COLORS.secondary,
                    boxShadow: activeCategory === category.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {category.name}
                </button>
                ))}
              </div>
            </div>

            
            <div className="flex-1 overflow-auto">
  {filteredCharts.length === 0 ? (
    <div className="p-4 text-center text-gray-500">
      No charts found matching your selection
    </div>
  ) : (
    filteredCharts.map((chart, index) => (
      <button
        key={chart.id}
        className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 transition-all rounded-full mx-3"
        style={{
          backgroundColor: activeChart === index ? COLORS.coral : '#f3f4f6',
          color: activeChart === index ? 'white' : COLORS.secondary,
          border: 'none',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => setActiveChart(index)}
        onMouseEnter={(e) => {
          if (activeChart !== index) {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseLeave={(e) => {
          if (activeChart !== index) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
      >
        {chart.name}
      </button>
    ))
  )}
</div>
          </div>
        )}

        
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <div className="border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center p-4">
              <div>
                <h2 className="text-xl font-medium" style={{ color: COLORS.primary }}>
                  {filteredCharts[activeChart]?.name || 'Select a chart'}
                </h2>
                <p style={{ color: COLORS.secondary }} className="mt-1">
                  {filteredCharts[activeChart]?.description || ''}
                </p>
              </div>
              <div>
                {filteredCharts[activeChart] && (
                  <select
                    value={chartTypes[filteredCharts[activeChart]?.id || 'pavement']}
                    onChange={(e) => handleChartTypeChange(filteredCharts[activeChart]?.id, e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
                  >
                    {chartTypeOptions[filteredCharts[activeChart]?.id || 'pavement'].map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          
          <div className="flex-1 bg-white overflow-hidden">
            {renderActiveChart()}
          </div>
        </div>
      </div>
    </div>
  </div>
);



  return (
    <>
      {regularPanelContent}
      {isFullscreen && fullscreenPanelContent}

      
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
    </>
  );
};

export default ChartsComponent;