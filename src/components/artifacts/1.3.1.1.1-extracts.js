import React, { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, Info } from "lucide-react";

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  neutral: '#F5F5F5',
  white: '#FFFFFF',
  coral: '#008080',
};

const GrantsComponent = ({onLayersReady}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setActiveExtract] = useState(0);
  const extractRefs = useRef({});
    const infoRef = useRef(null);
  
  const [showSources, setShowSources] = useState(false);
   useEffect(() => {
      const timeout = setTimeout(() => {
        if (onLayersReady) onLayersReady();
        if (window.setResponseReady) window.setResponseReady(true); // Optional global trigger
      }, 500); // Or however long you want to delay
  
      return () => clearTimeout(timeout);
    }, [onLayersReady]);

  const extracts = [
    {
      id: 1,
      title: 'FY24 Building Resilient Infrastructure and Communities (BRIC)',
      source: 'Grants.gov',
      page: 'Synopsis 2',
      date: 'Feb 13, 2025',
      content: `The BRIC program provides federal funding for hazard mitigation to reduce risk from future natural hazard events. Authorized by the Robert T. Stafford Act (42 U.S.C. 5133), this program aims to reduce reliance on federal disaster funding and improve community resilience.

Eligible applicants include tribal governments, county and city governments, the District of Columbia, and U.S. territories. Local governments must apply through their state or territory. The program expects around 800 awards, with a total funding of $750 million. Awards range from $0 to $150 million and require cost sharing or matching.

Applications are accepted through the FEMA GO portal (https://go.fema.gov/) and are due by April 18, 2025. The funding supports mitigation projects like infrastructure upgrades and planning efforts that build resilience before disasters strike.`,
      tags: ['Grants', 'FEMA', 'BRIC', 'Disaster Mitigation']
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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          if (!isNaN(index)) setActiveExtract(index);
        }
      });
    }, { threshold: 0.3 });

    Object.values(extractRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(extractRefs.current).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const renderPanel = (fullscreen = false) => (
    <div className={`${fullscreen ? 'absolute inset-0 z-[100]' : ''} flex flex-col bg-white h-full overflow-hidden`}>
<div className="flex flex-1 overflow-hidden">
        
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: COLORS.white }}>
          <div className="max-w-4xl mx-auto">
            {extracts.map((extract, index) => (
              <div
                key={extract.id}
                id={`${fullscreen ? 'fullscreen' : 'regular'}-extract-${index}`}
                data-index={index}
                ref={el => extractRefs.current[`${fullscreen ? 'fullscreen' : 'regular'}-${index}`] = el}
                className="mb-10 border-b pb-6"
                style={{ scrollMarginTop: '6rem' }}
              >
                <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.coral }}>{extract.title}</h2>
                <div className="text-sm text-gray-600 mb-2">{extract.source} • {extract.page} • {extract.date}</div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {extract.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${COLORS.coral}10`, color: COLORS.coral }}>{tag}</span>
                  ))}
                </div>
                <div className="space-y-4 text-gray-800 text-base leading-relaxed">
                  {extract.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-5 right-6 z-50">
        <div className="flex space-x-3 bg-transparent px-4 py-2 rounded-full shadow-md border">
        <button onClick={() => setShowSources(prev => !prev)} title="View Sources" style={{ 
              color: COLORS.coral,
              backgroundColor: 'white',
              border: 'none',
              transition: 'all 0.2s ease-in-out',
              borderRadius: '50%',  // Makes the button circular
              width: '36px',        // Fixed width
              height: '36px',       // Fixed height
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
            }}>
            <Info size={20} />
          </button>
          {!isMobile && (
          <button onClick={toggleFullscreen} title="Toggle fullscreen" style={{ 
              color: COLORS.coral,
              backgroundColor: 'white',
              border: 'none',
              transition: 'all 0.2s ease-in-out',
              borderRadius: '50%',  // Makes the button circular
              width: '36px',        // Fixed width
              height: '36px',       // Fixed height
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
            }}>
            {fullscreen
              ? <Minimize2 size={20} />
              : <Maximize2 size={20} />
            }
          </button>
          )}
      </div>
      </div>
    </div>
  );

  return (
    <>
    {showSources && (
  <div ref = {infoRef} className="fixed top-20 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in">
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
          href="https://www.grants.gov/search-results-detail/358006" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
FEMA      </a>
      </div>
    </div>
  </div>
)}
      {!isFullscreen && renderPanel(false)}
      {isFullscreen && renderPanel(true)}
    </>
  );
};

export default GrantsComponent;
