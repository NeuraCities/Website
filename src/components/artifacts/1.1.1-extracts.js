import React, { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, Menu, Info } from "lucide-react";

const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  neutral: '#F5F5F5',
  white: '#FFFFFF',
  coral: '#008080',
};

const PoliciesComponent = ({onLayersReady}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeExtract, setActiveExtract] = useState(0);

  const extractRefs = useRef({});
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
  
  const [showSources, setShowSources] = useState(false);
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
const extracts = [
    {
      id: 6,
      title: 'Community-Driven Resilience Hubs',
      source: '2023 - Full path to Resilience Hubs.docx',
      page: 'Pages 3-5',
      date: 'Mar 29, 2025',
      content: `The City of Austin’s Resilience Hubs initiative is designed to serve as neighborhood-based centers for preparedness, response, and recovery. Developed through co-creation with community stakeholders, these hubs provide access to power, food, cooling, communication tools, and medical supplies during emergencies, while offering services year-round that support public health, economic opportunity, and social cohesion.\n\nThe hubs prioritize historically underserved communities and are tailored to meet local needs identified in partnership with residents. They are designed with flexibility to adapt to specific neighborhood vulnerabilities, including extreme heat, flooding, and power outages. Equity is central to the planning and governance model, with ongoing input from community organizations. This approach shifts traditional top-down emergency response toward long-term, inclusive resilience planning.`,
      tags: ['Resilience', 'Equity', 'Community-Led', 'Emergency Preparedness']
    },
    {
      id: 7,
      title: 'Using Equity Tools for Climate Strategy Evaluation',
      source: 'Climate Equity Plan Full Document__FINAL.pdf',
      page: 'Page 7',
      date: 'Mar 29, 2025',
      content: `The Climate Equity Plan incorporates the City of Austin’s Equity Assessment Tool and Equity Building Blocks framework to ensure that climate mitigation strategies account for the lived realities of marginalized communities. These tools guide departments in identifying how race and income may affect access to services, infrastructure, or benefits. For each climate strategy, City staff assess historical inequities, potential unintended harms, and opportunities for co-benefits.\n\nBy applying these tools, the City commits to preventing further displacement, ensuring community safety, and designing programs that equitably distribute climate investments. Departments are held accountable through regular evaluations that include public transparency and community participation. This model fosters systemic change by embedding equity into core policy workflows rather than treating it as an add-on.`,
      tags: ['Equity Tools', 'Policy Evaluation', 'Climate Justice']
    },
    {
      id: 8,
      title: 'Funding and Governance for Resilience Hubs',
      source: '2023 - Full path to Resilience Hubs.docx',
      page: 'Page 6',
      date: 'Mar 29, 2025',
      content: `Initial funding for Resilience Hubs comes from a mix of City general funds, federal hazard mitigation grants, and philanthropic support. Investments are focused on retrofitting buildings for multi-hazard resilience—adding solar panels, battery backups, water storage, and ADA accessibility improvements.\n\nGovernance is structured around co-leadership with community-based organizations that bring cultural competency and local trust. This participatory model ensures that programs and operations reflect neighborhood values. City staff are trained in power-sharing practices, and advisory councils composed of local leaders are empowered to set goals, oversee spending, and revise services annually. The result is a scalable model rooted in equity, with potential to expand to schools, libraries, and faith-based institutions.`,
      tags: ['Funding', 'Governance', 'Infrastructure']
    },
    {
      id: 9,
      title: 'Affordable Housing and Low-Carbon Transportation',
      source: 'Climate Equity Plan Full Document__FINAL.pdf',
      page: 'Page 24',
      date: 'Mar 29, 2025',
      content: `The City integrates affordable housing policies with low-carbon transportation strategies to support both resilience and equity. Key initiatives include preserving affordable housing near public transit lines, prioritizing high-frequency bus corridors for investment, and incentivizing mixed-use development that reduces commute distances.\n\nTo prevent displacement, zoning updates allow greater housing density along mobility corridors while protecting tenants through right-to-return programs and rental assistance. Infrastructure projects include expanding bike lanes, sidewalks, and shaded pedestrian pathways—especially in heat-vulnerable neighborhoods. These investments not only reduce emissions but also improve access to jobs, schools, and healthcare for underserved communities.`,
      tags: ['Housing', 'Transit', 'Urban Equity']
    },
    {
      id: 10,
      title: 'Community Engagement for Resilience Planning',
      source: '2023 - Full path to Resilience Hubs.docx',
      page: 'Pages 2-3',
      date: 'Mar 29, 2025',
      content: `The development of Austin’s Resilience Hubs was shaped by over a year of collaborative workshops involving residents, local nonprofits, neighborhood associations, and City agencies. The engagement process emphasized language access, childcare provision, and culturally competent facilitation to ensure inclusive participation.\n\nRather than relying on pre-defined service lists, the City asked residents: “What would make your neighborhood stronger and safer?” This open-ended approach led to hub designs that reflect local priorities—like cooling spaces, disaster resource libraries, health screenings, or skills training. These conversations also surfaced deeper concerns about gentrification and the need for sustained investment in East Austin and other historically excluded areas. This feedback directly informed the design of hub operations and site selection criteria.`,
      tags: ['Engagement', 'Community Governance', 'Participatory Planning']
    }
  ];  

  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarVisible(true);
      setTimeout(() => {
        const sidebar = document.getElementById('policies-sidebar');
        const width = window.innerWidth < 640 ? '180px' : '260px';
        sidebar.style.width = width;
              }, 10);
    } else {
      const sidebar = document.getElementById('policies-sidebar');
      if (sidebar) sidebar.style.width = '0px';
      setTimeout(() => setSidebarVisible(false), 300);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          if (!isNaN(index)) setActiveExtract(index);
        }
      });
    }, { threshold: 0.3 });
  
    // Store the current refs in a variable inside the effect
    const currentRefs = extractRefs.current;
    
    Object.values(currentRefs).forEach(ref => {
      if (ref) observer.observe(ref);
    });
  
    return () => {
      // Use the stored variable in the cleanup function
      Object.values(currentRefs).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const toggleFullscreen = () => setIsFullscreen(prev => !prev);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  

  const renderPanel = (fullscreen = false) => (
<div className={`${fullscreen ? 'absolute inset-0 z-[100]' : ''} flex flex-col bg-white h-full overflow-hidden`}>
<div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div
            id="policies-sidebar"
            className="border-r overflow-auto text-sm"
            style={{
              width: '0px',
              transition: 'width 300ms ease-in-out',
              backgroundColor: COLORS.white,
              borderColor: '#e5e7eb',
              overflowX: 'hidden'
            }}
          >
            <div className="p-4">
              {extracts.map((extract, index) => (
                <button
                  key={extract.id}
                  onClick={() => {
                    setActiveExtract(index);
                    const el = document.getElementById(`${fullscreen ? 'fullscreen' : 'regular'}-extract-${index}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                    }
                  }}
                  className="w-full text-left px-4 py-2 mb-2 rounded-full"
                  style={{
                    backgroundColor: activeExtract === index ? COLORS.coral : COLORS.white,
                    color: activeExtract === index ? COLORS.white : COLORS.secondary,
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (activeExtract !== index) e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    if (activeExtract !== index) e.currentTarget.style.backgroundColor = COLORS.white;
                  }}
                >
                  {extract.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 text-sm sm:text-base" style={{ backgroundColor: COLORS.white }}>
        <div className="max-w-full sm:max-w-4xl mx-auto">
        {extracts.map((extract, index) => (
              <div
                key={extract.id}
                id={`${fullscreen ? 'fullscreen' : 'regular'}-extract-${index}`}
                data-index={index}
                ref={el => extractRefs.current[`${fullscreen ? 'fullscreen' : 'regular'}-${index}`] = el}
                className="mb-10 border-b pb-6"
                style={{ scrollMarginTop: window.innerWidth < 640 ? '4rem' : '6rem' }}
                >
<h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: COLORS.coral }}>{extract.title}</h2>
<div className="text-sm text-gray-600 mb-2">{extract.source} • {extract.page} • {extract.date}</div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {extract.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{
                      backgroundColor: `${COLORS.coral}10`,
                      color: COLORS.coral
                    }}>{tag}</span>
                  ))}
                </div>
                {/* Split paragraphs by newlines */}
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

      {/* Floating Buttons */}
      {/* Floating Buttons (now inside panel, not fixed to screen) */}
<div className="absolute top-16 right-6 z-10">
  <div className="flex space-x-3 bg-white px-4 py-2 rounded-full shadow-md border">
    {/* Sidebar Toggle */}
    <button onClick={toggleSidebar} title="Toggle sidebar" style={{
      color: COLORS.coral,
      backgroundColor: 'white',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
      borderRadius: '50%',
      width: window.innerWidth < 640 ? '28px' : '36px',
      height: window.innerWidth < 640 ? '28px' : '36px',
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
      <Menu size={20} />
    </button>

    {/* Info Button */}
    <button onClick={() => setShowSources(prev => !prev)} title="View Sources" style={{
      color: COLORS.coral,
      backgroundColor: 'white',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
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
      borderRadius: '50%',
      width: '36px',
      height: '36px',
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
      {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
    </button>
    )}
  </div>
</div>

    </div>
  );

  return (
    <>
    {showSources && (
    <div ref={infoRef}className="absolute top-full right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000]" style={{top:'90px'}}>
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
          <a
          >
Building Condition data(contains building footprints, maintenance details, conditions, and year built)          </a>
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
            href="https://data.austintexas.gov/stories/s/Austin-Demographic-Data-Hub/3wck-mabg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Demographic
          </a>
        </div>
        <div>
          <a
            href="https://docs.google.com/document/d/1P8aDfU6qj_Ao7Ql3v8YJ9dkq0vqDJ8cTk_Y3GMkMOUM/edit?tab=t.0#heading=h.p2fewxb06id2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Austin Office of Resilience 2023, A path to create a Resilience Hub Network in Austin
          </a>
        </div>
        <div>
          <a
            href="https://www.austintexas.gov/sites/default/files/files/Sustainability/Climate%20Equity%20Plan/Climate%20Equity%20Plan%20Full%20Document__FINAL.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Austin Climate Equity Plan
          </a>
        </div>
        <div>
          <a
            href="https://www.opengovpartnership.org/documents/inception-report-action-plan-austin-united-states-2024-2028/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Inception Report – Action plan – Austin, United States, 2024 – 2028

          </a>
        </div>
        <div>
          <a
            href="https://services.austintexas.gov/edims/document.cfm?id=254319"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Flood Mitigation Task Force-Final Report to Austin City Council
Codes
          </a>
        </div>
      </div>
    </div>
  )}

      {!isFullscreen && renderPanel(false)}
      {isFullscreen && renderPanel(true)}
    </>
  );
};

export default PoliciesComponent;
