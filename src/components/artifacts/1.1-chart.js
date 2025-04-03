import React, { useEffect, useState, useRef } from 'react';
import { Info } from 'lucide-react';

import {
  BarChart, Bar,
  PieChart, Pie,
  Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { Maximize2, X } from 'lucide-react';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  coral: '#008080',
  gray: '#95A5A6',
  blue: '#3498DB',
  green: '#27AE60',
  orange: '#E67E22',
  purple: '#9B59B6',
  red: '#E74C3C',
  white: '#FFFFFF'
};

const PIE_COLORS = ['#3498DB', '#E67E22', '#9B59B6', '#2ECC71', '#1ABC9C', '#F39C12', '#D35400', '#C0392B'];


const SocioEconomicDashboard = ({onLayersReady, onFullscreenChange}) => {
  const [showSources, setShowSources] = useState(false);
  const [neighborhoodData, setNeighborhoodData] = useState({});
  const [selectedChart, setSelectedChart] = useState('income-distribution');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chartContainerRef = useRef(null);
  const infoRef = useRef(null);
  
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
    fetch('/data/demographicsynth-data.json')
      .then(res => res.json())
      .then(json => {
        setNeighborhoodData(json.neighborhoods);
      });
  }, []);

  const chartOptions = [
    { id: 'income-distribution', name: 'Income Distribution by Neighborhood' },
    { id: 'education-distribution', name: 'Education Levels by Neighborhood' },
    { id: 'race-distribution', name: 'Race by Neighborhood' },
    { id: 'population-pie', name: 'Population by Neighborhood' },
    { id: 'median-age-pie', name: 'Median Age by Neighborhood' },
  ];

  const getIncomeDistributionChartData = () =>
    Object.entries(neighborhoodData).map(([name, data]) => ({
      neighborhood: isMobile ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : name,
      ...data.income.distribution
    }));

  const getEducationDistributionChartData = () =>
    Object.entries(neighborhoodData).map(([name, data]) => ({
      neighborhood: isMobile ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : name,
      ...data.education
    }));

  const getRaceDistributionChartData = () =>
    Object.entries(neighborhoodData).map(([name, data]) => ({
      neighborhood: isMobile ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : name,
      ...data.race
    }));

  const getPopulationPieData = () =>
    Object.entries(neighborhoodData).map(([name, data]) => ({
      name: isMobile ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : name,
      value: data.population
    }));

  const getMedianAgePieData = () =>
    Object.entries(neighborhoodData).map(([name, data]) => ({
      name: isMobile ? name.substring(0, 12) + (name.length > 12 ? '...' : '') : name,
      value: data.median_age
    }));

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'income-distribution':
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart data={getIncomeDistributionChartData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="neighborhood" type="category" width={isMobile ? 80 : 150} />
              <Tooltip />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
              <Bar dataKey="<$25k" stackId="a" fill={COLORS.gray} />
              <Bar dataKey="$25k-$44k" stackId="a" fill={COLORS.blue} />
              <Bar dataKey="$45k-$74k" stackId="a" fill={COLORS.green} />
              <Bar dataKey="$75k-$149k" stackId="a" fill={COLORS.orange} />
              <Bar dataKey="$150k+" stackId="a" fill={COLORS.purple} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'education-distribution':
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart data={getEducationDistributionChartData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="neighborhood" type="category" width={isMobile ? 80 : 150} />
              <Tooltip />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
              <Bar dataKey="less_than_hs" stackId="b" fill={COLORS.gray} name="< HS" />
              <Bar dataKey="high_school" stackId="b" fill={COLORS.blue} name="HS" />
              <Bar dataKey="some_college" stackId="b" fill={COLORS.green} name="Some College" />
              <Bar dataKey="bachelors" stackId="b" fill={COLORS.orange} name="Bachelor's" />
              <Bar dataKey="graduate_degree" stackId="b" fill={COLORS.purple} name="Grad Degree" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'race-distribution':
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart data={getRaceDistributionChartData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="neighborhood" type="category" width={isMobile ? 80 : 150} />
              <Tooltip />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
              <Bar dataKey="white" fill={COLORS.gray} />
              <Bar dataKey="hispanic" fill={COLORS.blue} />
              <Bar dataKey="black" fill={COLORS.green} />
              <Bar dataKey="asian" fill={COLORS.orange} />
              <Bar dataKey="other" fill={COLORS.red} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'population-pie':
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 410}>
            <PieChart>
              <Pie 
                data={getPopulationPieData()} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={isMobile ? 100 : 150} 
                label={!isMobile}
              >
                {getPopulationPieData().map((entry, index) => (
                  <Cell key={`cell-pop-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'median-age-pie':
        return (
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <PieChart>
              <Pie 
                data={getMedianAgePieData()} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={isMobile ? 100 : 150} 
                label={!isMobile}
              >
                {getMedianAgePieData().map((entry, index) => (
                  <Cell key={`cell-age-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };


const toggleFullscreen = () => {
  const newState = !isFullscreen;
  setIsFullscreen(newState);
  if (onFullscreenChange) {
    onFullscreenChange(newState);
  }
};

  const renderPanelContent = (fullscreen = false) => (
    
    <div
    className={`flex flex-col flex-grow px-4 pt-4 transition-all duration-300 ${
      fullscreen 
        ? 'absolute inset-0 z-50 bg-white overflow-auto' 
        : 'relative max-h-[90vh] overflow-y-auto pb-4'
    }`}
    ref={chartContainerRef}
>    
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-${isMobile ? 'start' : 'center'} mb-4`}>
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
          Socio-Economic Dashboard
        </h2>
        <div className={`flex items-center space-x-2 ${isMobile ? 'mt-2' : ''}`}>
          <div className="flex items-center space-x-2 relative">
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

            {/* Menu below Info Button */}
            {showSources && (
              <div 
                ref={infoRef} 
                className={`absolute ${isMobile ? 'top-full left-0' : 'top-full right-0'} mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50`}
              >
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
                    <span className="font-medium">Building Condition Data:</span>{' '}
                    <a>
                      Building Condition data(contains building footprints, maintenance details, conditions, and year built)
                    </a>
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
                      href="https://data.austintexas.gov/stories/s/Austin-Demographic-Data-Hub/3wck-mabg/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Demographic
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!isMobile && (
          <button 
            onClick={toggleFullscreen} 
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
            {fullscreen ? <X size={18} /> : <Maximize2 size={18} />}
          </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="chart-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Chart:
        </label>
        <select
          id="chart-select"
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
          className="p-2 border rounded-md w-full md:w-auto"
        >
          {chartOptions.map(option => (
            <option key={option.id} value={option.id}>
              {isMobile && option.name.length > 30 
                ? option.name.substring(0, 30) + "..." 
                : option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-md font-medium mb-4" style={{ color: COLORS.secondary }}>
          {chartOptions.find(opt => opt.id === selectedChart)?.name}
        </h3>
        {renderSelectedChart()}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
  {renderPanelContent(isFullscreen)}
</div>
  );
};

export default SocioEconomicDashboard;