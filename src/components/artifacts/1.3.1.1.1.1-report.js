import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Download, Edit2, Save, Menu, Minimize2, Info } from "lucide-react";
import UpdatedFloodInfraIntersectionMap from "./1.3.1.1-map";
import DisasterHistoryDashboard from './1.3.1-chart1';

const ReportComponent5 = ({ onLayersReady, reportName = "Resilience Hotspots in Downtown Austin: Climate Risk, Infrastructure, and FEMA-Eligible Project Zones", artifacts = [],
  }) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const reportContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showArtifactGallery] = useState(false);
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
  // Theme colors
  const COLORS = {
    primary: '#2C3E50',
    secondary: '#34495E',
    neutral: '#F5F5F5',
    white: '#FFFFFF',
    coral: '#008080',
    cta: '#FF5747'
  };

  const [isEditing, setIsEditing] = useState(false);
const [reportTitle, setReportTitle] = useState(reportName);


const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};
const toggleEditMode = () => {
  setIsEditing(!isEditing);
};


const handleContentChange = (sectionId, event) => {
  const updatedContent = event.target.innerHTML;
  setSectionContent(prevContent => ({
    ...prevContent,
    [sectionId]: updatedContent
  }));
};

const handleTitleChange = (event) => {
  setReportTitle(event.target.textContent);
};

 
// Sample report content
const sampleContent = {
  summary: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Executive Summary</h2>
<p class="mb-4" style="color: #34495E;">This report synthesizes downtown Austin’s infrastructure health with environmental exposure data—including flood risk, heat island intensity, and historical disasters—to identify high-priority zones for resilience-focused interventions. These areas are evaluated for alignment with FEMA’s resilience funding guidelines.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Zones along Waller Creek and East Cesar Chavez show overlapping risks from aging infrastructure, floodplain encroachment, and elevated urban heat exposure.</li>
  <li>Historical disaster data confirms repeat vulnerability to flooding and heat-related emergencies in these same corridors.</li>
  <li>FEMA’s Building Resilient Infrastructure and Communities (BRIC) program guidelines were used to identify project-aligned zones for potential funding applications.</li>
</ul>

<p class="mb-4" style="color: #34495E;">These findings support early-stage planning for resilience investments and provide spatial justification for targeted federal funding proposals.</p>
`,
  intro: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Introduction</h2>
<p class="mb-4" style="color: #34495E;">Downtown Austin faces compound climate-related challenges, particularly in areas where infrastructure is aging and environmental stressors are intensifying. This report layers infrastructure condition data with floodplains, urban heat islands, and historic disaster records to assess where resilience interventions are most urgent—and most fundable.</p>

<p class="mb-4" style="color: #34495E;">The guiding question is: <strong>“Where in downtown Austin do infrastructure vulnerabilities and environmental exposure align with FEMA’s funding criteria for resilience?”</strong></p>
`,
  methods: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Methodology</h2>
<p class="mb-4" style="color: #34495E;">This report combines city infrastructure datasets with climate exposure overlays and grant eligibility criteria to surface funding-ready resilience zones.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li><strong>Infrastructure:</strong> Sourced from <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8" target="_blank">Infrastructure Charts</a> and <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Street-Segment-Condition-Data/pcwe-pwxe" target="_blank">Street Segment Condition</a>.</li>
  <li><strong>Environmental Exposure:</strong> Flood risk data from <a href="https://data.austintexas.gov/Public-Safety/Greater-Austin-Fully-Developed-Floodplain/pjz8-kff2" target="_blank">Floodplain overlays</a>, and heat island data based on temperature, tree canopy, and impervious surface mapping.</li>
  <li><strong>Historic Vulnerability:</strong> Pulled disaster history and emergency response patterns from <a href="https://data.austintexas.gov/d/w635-mmjr" target="_blank">Austin’s Historic Disaster Dataset</a>.</li>
  <li><strong>Funding Eligibility:</strong> Cross-checked identified zones with <a href="https://www.grants.gov/search-results-detail/358006" target="_blank">FEMA BRIC funding</a> requirements and project criteria.</li>
</ul>
`,
  findings: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Key Findings</h2>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">1. Environmental Risk Convergence Zones</h3>
<p class="mb-4" style="color: #34495E;">The area along Waller Creek and its eastside tributaries consistently shows overlapping exposure to floodplain incursion, heat stress, and high infrastructure degradation scores.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">2. Historic Disaster Recurrence</h3>
<p class="mb-4" style="color: #34495E;">Disaster records indicate recurring emergency incidents in the East Cesar Chavez corridor and Red River zone, including both flood and heat-related events over the past decade.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">3. Gaps in Resilience Investment</h3>
<p class="mb-4" style="color: #34495E;">Despite these risks, multiple affected areas are not currently targeted in the capital improvement plan and lack FEMA-funded mitigation projects.</p>
`,
  analysis: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Analysis</h2>
<p class="mb-4" style="color: #34495E;">By overlaying environmental exposure, infrastructure condition, and disaster recurrence, this report identifies a short list of neighborhoods and corridors where funding applications would be both justified and competitive under FEMA’s BRIC criteria.</p>

<p class="mb-4" style="color: #34495E;">Spatial and temporal analysis of emergency response calls, flood modeling, and impervious surface heat trends reinforce these findings and suggest potential co-benefits from climate-smart investments such as green infrastructure or cooling corridors.</p>
`,
  conclusion: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Conclusion & Recommendations</h2>

<p class="mb-4" style="color: #34495E;">Downtown Austin’s resilience planning can benefit from a data-driven, environment-informed strategy that also aligns with federal funding frameworks. The zones identified in this report represent high-need and high-justification opportunities for FEMA-supported investment.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Recommended Next Steps:</h3>
<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Develop shovel-ready project scopes for the Waller Creek–Cesar Chavez corridor targeting flood + heat resilience.</li>
  <li>Overlay green infrastructure and cooling surface models into at-risk zones to strengthen FEMA application language.</li>
  <li>Begin coordination with hazard mitigation officers and local CDBG-DR coordinators to support proposal development.</li>
</ul>
`,
  references: ``,
};


const [sectionContent, setSectionContent] = useState(sampleContent);
  
  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'methods', name: 'Methodology' },
    { id: 'disaster', name: 'Disaster History Chart' },
    { id: 'findings', name: 'Key Findings' },
    { id: 'analysis', name: 'Analysis' },
    { id: "map", name: "Floodplain Intersection Map" },
    { id: 'conclusion', name: 'Conclusion' },
    { id: 'references', name: 'References' }
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
  
  // Refs for each section for intersection observer
  const sectionRefs = useRef({});

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
  
  // Set up intersection observer to track which section is in view
useEffect(() => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3,
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        // Set the active section based on the intersecting element's ID
        setActiveSection(id);
      }
    });
  }, options);
  
  const refsSnapshot = Object.values(sectionRefs.current);

  refsSnapshot.forEach(ref => {
    if (ref) observer.observe(ref);
  });

  return () => {
    refsSnapshot.forEach(ref => {
      if (ref) observer.unobserve(ref);
    });
  };
}, [isFullscreen]);
  
  // Handle sidebar animation
  useEffect(() => {
    if (isSidebarOpen) {
      // First make the sidebar visible but with 0 width
      setSidebarVisible(true);
      // Then trigger a reflow and animate width in
      setTimeout(() => {
        const sidebar = document.getElementById('sidebar');
        const fullscreenSidebar = document.getElementById('fullscreen-sidebar');
        
        if (sidebar) {
          sidebar.style.width = '220px';
        }
        
        if (fullscreenSidebar) {
          fullscreenSidebar.style.width = '220px';
        }
      }, 10);
    } else {
      // First animate width out
      const sidebar = document.getElementById('sidebar');
      const fullscreenSidebar = document.getElementById('fullscreen-sidebar');
      
      if (sidebar) {
        sidebar.style.width = '0px';
      }
      
      if (fullscreenSidebar) {
        fullscreenSidebar.style.width = '0px';
      }
      
      // Then hide the sidebar after animation completes
      setTimeout(() => {
        setSidebarVisible(false);
      }, 300); // Match the transition duration
    }
  }, [isSidebarOpen]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
  
      // Delay so that the DOM is ready before applying width
      setTimeout(() => {
        const sidebar = document.getElementById('sidebar');
        const fullscreenSidebar = document.getElementById('fullscreen-sidebar');
        
        const width = isSidebarOpen ? '220px' : '0px';
        if (sidebar) sidebar.style.width = width;
        if (fullscreenSidebar) fullscreenSidebar.style.width = width;
      }, 50);
  
      return next;
    });
  };
  
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  // Function to handle the download action
  const handleDownload = () => {

    if (isEditing) {
      setIsEditing(false);
    }
    // Dynamically import html2pdf
    import('html2pdf.js').then(html2pdfModule => {
      const html2pdf = html2pdfModule.default;
      const element = reportContainerRef.current;
      if (!element) return;

      const options = {
        margin: 10,
        filename: `${reportName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Use html2pdf library to convert content to PDF
      html2pdf().set(options).from(element).save();
    }).catch(error => {
      console.error('Error loading html2pdf:', error);
    });
  };
  
  const renderSectionContent = (section) => {
    if (section.id === 'map') {
      return (
        <div className={`w-full ${isFullscreen ? 'h-[80vh]' : 'h-[600px]'} my-6 rounded-lg overflow-hidden`}>
          <UpdatedFloodInfraIntersectionMap onLayersReady={onLayersReady} />
        </div>
      );
    }
  
    if (section.id === 'disaster') {
      return (
        <div className="w-full my-6 rounded-lg overflow-hidden">
          <DisasterHistoryDashboard onLayersReady={onLayersReady} />
        </div>
      );
    }
  
    return isEditing ? (
      <div
        className="prose prose-sm max-w-none p-3 rounded-md"
        style={{ backgroundColor: '#f8f9fa', border: `1px solid ${COLORS.coral}30`, minHeight: '150px', outline: 'none' }}
        contentEditable={true}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={createMarkup(sectionContent[section.id] || '')}
        onBlur={(e) => handleContentChange(section.id, e)}
      />
    ) : (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={createMarkup(sectionContent[section.id] || '')}
      />
    );
  };
  
  // Regular panel content
  const regularPanelContent = (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: COLORS.white }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Table of contents sidebar - animated with CSS transitions */}
        {sidebarVisible && (
  <div 
    id="sidebar"
    className="border-r overflow-auto"
    style={{ 
      width: '0px', 
      borderColor: '#e5e7eb', 
      backgroundColor: COLORS.white,
      transition: 'width 300ms ease-in-out'
    }}
  >
    {/* Button container - add this at the top */}
    <div className="flex justify-center bg-white">
      <div 
        className="flex px-3 py-2 rounded-full"
        style={{ 
            backgroundColor: COLORS.white,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            order: `1px solid ${COLORS.neutral}`,
            borderRadius: '9999px'
        }}
      >
        {isMenuOpen && (
          <>
            <button 
              onClick={toggleEditMode}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title={isEditing ? "Save edits" : "Edit report"}
              style={{ 
                color: COLORS.coral, 
                border: 'none',
                backgroundColor: 'COLORS.white',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.coral;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.coral;
              }}
            >
              {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
            </button>

            
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
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title="Download as PDF"
              style={{ 
                color: COLORS.coral, 
                border: 'none',
                backgroundColor: 'COLORS.white',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.coral;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.coral;
              }}
            >
              <Download size={20} />
            </button>

            <button 
              onClick={toggleSidebar}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title="Close sidebar"
              style={{ 
                color: COLORS.coral,
                border: 'none',
                backgroundColor: 'COLORS.white',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.coral;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.coral;
              }}
            >
              <Menu size={18} />
            </button>
            {!isMobile && (
            <button 
              onClick={toggleFullscreen}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title="Toggle fullscreen"
              style={{ 
                color: COLORS.coral, 
                border: 'none',
                backgroundColor: 'COLORS.white',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.coral;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.coral;
              }}
            >
              <Maximize2 size={20} />
            </button>
            )}
          </>
        )}
        
      </div>
    </div>

    {/* Keep your existing sidebar content structure */}
    <div className="py-4 px-2 whitespace-nowrap">
      
      
      {/* Content sections with more indentation */}
      <div className="pl-6 mt-2">
      {sections.map((section) => (
  <button
    key={section.id}
    onClick={() => {
      // Use the fullscreen section ID format for active section
      const fullscreenId = `fullscreen-${section.id}`; // Fixed template literal syntax
      setActiveSection(fullscreenId);
      const element = document.getElementById(fullscreenId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }}
    className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 rounded-full transition-all"
    style={{
      backgroundColor: activeSection === `fullscreen-${section.id}` ? COLORS.coral : COLORS.white, // Fixed
      color: activeSection === `fullscreen-${section.id}` ? COLORS.white : COLORS.secondary, // Fixed
      border: 'none',
      boxShadow: activeSection === section.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s ease-in-out'
    }}
    onMouseEnter={(e) => {
      if (activeSection !== `fullscreen-${section.id}`) { // Fixed
        e.currentTarget.style.backgroundColor = '#f0f0f0';
      }
    }}
    onMouseLeave={(e) => {
      if (activeSection !== `fullscreen-${section.id}`) { // Fixed
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    <div className="flex justify-between items-center w-full">
      <span>{section.name}</span>
    </div>
  </button>
))}

{sections.map((section) => (
  <div 
    key={`fullscreen-${section.id}`} // Fixed
    id={`fullscreen-${section.id}`} // Fixed
    ref={el => sectionRefs.current[`fullscreen-${section.id}`] = el} // Fixed
    className="mb-16"
  >
    {/* Report title - editable when in edit mode */}
    {section.id === 'intro' && (
      <div 
        className={`text-3xl font-bold mb-8 ${isEditing ? 'border-b-2 pb-2' : ''}`}
        style={{ 
          color: COLORS.primary,
          borderColor: isEditing ? COLORS.coral : 'transparent',
          outline: 'none'
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleTitleChange}
      >
        {reportTitle}
      </div>
    )}

    {/* Section content - editable or static based on mode */}
    {renderSectionContent(section)}
  </div>
))}
      </div>
    </div>
  </div>
)}
{/* Floating menu button when sidebar is closed */}
{!sidebarVisible && (
  <div 
    className="absolute top-6 right-6 z-30"
    style={{
      top: '4rem',
      right: '2rem'
    }}
  >
    <div 
      className="flex px-3 py-2 rounded-full"
      style={{ 
        backgroundColor: COLORS.white,
        boxShadow: 'none)',
        border: 'none'
      }}
    >
      {isMenuOpen && (
        <>
          <button 
            onClick={toggleEditMode}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title={isEditing ? "Save edits" : "Edit report"}
            style={{ 
              color: COLORS.coral, 
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.coral;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.coral;
            }}
          >
            {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
          </button>
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


          <button 
            onClick={handleDownload}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title="Download as PDF"
            style={{ 
              color: COLORS.coral, 
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.coral;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.coral;
            }}
          >
            <Download size={20} />
          </button>

          <button 
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title="Open table of contents"
            style={{ 
              color: COLORS.coral,
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.coral;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.coral;
            }}
          >
            <Menu size={18} />
          </button>
          {!isMobile && (
          <button 
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title="Toggle fullscreen"
            style={{ 
              color: COLORS.coral, 
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.coral;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.coral;
            }}
          >
            <Maximize2 size={20} />
          </button>
          )}
        </>
      )}
      
      {/* Menu toggle button - always rightmost */}
      <button 
        onClick={toggleMenu}
        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
        title="Toggle menu"
        style={{ 
          color: COLORS.coral, 
          border: 'none',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease-in-out'

        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.coral;
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = COLORS.coral;
        }}
      >
        {isMenuOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  </div>
)}
        {/* Main content with added margin/gap from sidebar */}
        <div className="flex-1 overflow-auto pl-4" style={{ backgroundColor: COLORS.white }}>
          <div className="max-w-3xl mx-auto p-6 bg-white my-4 rounded-lg shadow-sm" ref={reportContainerRef}>
            {/* All sections rendered in a single scrollable document */}
            {sections.map((section) => (
              <div 
                key={section.id}
                id={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                className="mb-12"
              >
                {/* Report title - editable when in edit mode */}
{section.id === 'intro' && (
  <div 
  className={`text-2xl font-bold mb-6 ${isEditing ? 'border-b-2 pb-2' : ''}`}
  style={{ 
      color: COLORS.primary,
      borderColor: isEditing ? COLORS.coral : 'transparent',
      outline: 'none'
    }}
    contentEditable={isEditing}
    suppressContentEditableWarning={true}
    onBlur={handleTitleChange}
  >
    {reportTitle}
  </div>
)}

{renderSectionContent(section)}

                
                
              </div>
            ))}
          </div>
        </div>
      </div>
      
      
      
    </div>
  );
  
  const fullscreenPanelContent = (
    <div className="absolute inset-0 z-50 bg-white backdrop-blur-sm flex flex-col">

      <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Floating menu button when sidebar is closed */}
          {!sidebarVisible && (
            <div 
              className="absolute z-50"
              style={{
                top: '1rem',
                right: '2rem'
              }}
            >
              <div 
                className="flex px-3 py-2 rounded-full"
                style={{ 
                  backgroundColor: COLORS.white,
                  boxShadow: 'none)',
                  border: 'none'
                }}
              >
                {/* Other buttons - only visible when menu is open */}
                {isMenuOpen && (
                  <>
                    {/* Edit/Save button */}
                    <button 
                      onClick={toggleEditMode}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title={isEditing ? "Save edits" : "Edit report"}
                      style={{ 
                        color: COLORS.coral, 
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.coral;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.coral;
                      }}
                    >
                      {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                    </button>
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
  
                    {/* Download button */}
                    <button 
                      onClick={handleDownload}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title="Download as PDF"
                      style={{ 
                        color: COLORS.coral, 
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.coral;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.coral;
                      }}
                    >
                      <Download size={20} />
                    </button>
                    
                    {/* TOC toggle button */}
                    <button 
                      onClick={toggleSidebar}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title="Open table of contents"
                      style={{ 
                        color: COLORS.coral,
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.coral;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.coral;
                      }}
                    >
                      <Menu size={18} />
                    </button>
                    {!isMobile && (
                    <button 
                      onClick={toggleFullscreen}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title="Exit fullscreen"
                      style={{ 
                        color: COLORS.coral, 
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.coral;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.coral;
                      }}
                    >
                      <Minimize2 size={20} />
                    </button>
                    )}
                  </>
                )}
                
                {/* Menu toggle button - always visible and rightmost */}
                <button 
                  onClick={toggleMenu}
                  className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                  title="Toggle menu"
                  style={{ 
                    color: COLORS.coral, 
                    border: 'none',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.coral;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.coral;
                  }}
                >
                  {isMenuOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
              </div>
            </div>
          )}
          
          {/* Table of contents sidebar with animation for fullscreen mode */}
          {sidebarVisible && (
            <div 
              id="fullscreen-sidebar"
              className="border-r overflow-auto" 
              style={{ 
                width: '0px', 
                borderColor: '#e5e7eb', 
                backgroundColor: COLORS.white,
                transition: 'width 300ms ease-in-out' 
              }}
            >
              {/* Button container - add this at the top */}
              <div className="py-3 flex justify-center">
                <div 
                  className="flex px-3 py-2 rounded-full"
                  style={{ 
                    backgroundColor: COLORS.white,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${COLORS.neutral}`,
  borderRadius: '9999px'
                  }}
                >
                  {isMenuOpen && (
                    <>
                      <button 
                        onClick={toggleEditMode}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title={isEditing ? "Save edits" : "Edit report"}
                        style={{ 
                          color: COLORS.coral, 
                          border: 'none',
                          backgroundColor: 'transparent',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.coral;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.coral;
                        }}
                      >
                        {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                      </button>
  
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
  
                      <button 
                        onClick={handleDownload}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title="Download as PDF"
                        style={{ 
                          color: COLORS.coral, 
                          border: 'none',
                          backgroundColor: 'transparent',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.coral;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.coral;
                        }}
                      >
                        <Download size={20} />
                      </button>
  
                      <button 
                        onClick={toggleSidebar}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title="Close sidebar"
                        style={{ 
                          color: COLORS.coral,
                          border: 'none',
                          backgroundColor: 'transparent',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.coral;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.coral;
                        }}
                      >
                        <Menu size={18} />
                      </button>
                      {!isMobile && (
                      <button 
                        onClick={toggleFullscreen}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title="Exit fullscreen"
                        style={{ 
                          color: COLORS.coral, 
                          border: 'none',
                          backgroundColor: 'transparent',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.coral;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.coral;
                        }}
                      >
                        <Minimize2 size={20} />
                      </button>
                      )}
                    </>
                  )}
                  
                </div>
              </div>
  
              {/* Sidebar content */}
              <div className="py-4 px-2 whitespace-nowrap">
              
              
              {/* Content sections with more indentation */}
              <div className="pl-6 mt-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      // Use the fullscreen section ID format for active section
                      const fullscreenId = `fullscreen-${section.id}`;
                      setActiveSection(fullscreenId);
                      const element = document.getElementById(fullscreenId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 rounded-full transition-all"
                    style={{
                      backgroundColor: activeSection === `fullscreen-${section.id}` ? COLORS.coral : COLORS.white,
                      color: activeSection === `fullscreen-${section.id}` ? COLORS.white : COLORS.secondary,
                      border: 'none',
                      boxShadow: activeSection === section.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== `fullscreen-${section.id}`) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== `fullscreen-${section.id}`) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{section.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main content with added margin/gap from sidebar */}
        <div className="flex-1 overflow-auto pl-4" style={{ backgroundColor: COLORS.white,               marginTop: artifacts.length > 0 && !showArtifactGallery ? '60px' : '0' }}>
          <div className="max-w-4xl mx-auto p-8 bg-white my-6 rounded-lg shadow-sm" ref={reportContainerRef}>
            {/* All sections rendered in a single scrollable document */}
            {sections.map((section) => (
              <div 
                key={`fullscreen-${section.id}`}
                id={`fullscreen-${section.id}`}
                ref={el => sectionRefs.current[`fullscreen-${section.id}`] = el}
                className="mb-16"
              >
                {/* Report title - editable when in edit mode */}
                {section.id === 'intro' && (
                  <div 
                  className={`text-3xl font-bold mb-8 ${isEditing ? 'border-b-2 pb-2' : ''}`}
                                      style={{ 
                      color: COLORS.primary,
                      borderColor: isEditing ? COLORS.coral : 'transparent',
                      outline: 'none'
                    }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={handleTitleChange}
                  >
                    {reportTitle}
                  </div>
                )}

                {/* Section content - editable or static based on mode */}
                {renderSectionContent(section)}

                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    
  </div>
);


  
return <>
  {isFullscreen ? fullscreenPanelContent : regularPanelContent}
  {showSources && (
    <div
      ref={infoRef}
      className="fixed top-20 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in"
      style={{top:'100px'}}
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
          <a>
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
            Neighborhoods
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/Public-Safety/Greater-Austin-Fully-Developed-Floodplain/pjz8-kff2/about_data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Floodplains
          </a>
        </div>
        <div>
          <a>
            Heat island (contains temperature increase, tree coverage, impervious surface, and heat-related emergency calls)
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/w635-mmjr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Historic Disaster Data
          </a>
        </div>
        <div>
          <a
            href="https://www.grants.gov/search-results-detail/358006"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            FEMA
          </a>
        </div>
      </div>
    </div>
  )}
  
</>

};
export default ReportComponent5; 