import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2,  Download,  Edit2, Save, Menu, Minimize2, Info } from "lucide-react";
import FloodplainsConcernMap from './1.2.1.2-map';

const ReportComponent2 = ({ onLayersReady, reportName = "Downtown Austin Resilience Prioritization: Infrastructure, Vulnerability, and Emergency Capacity Analysis", artifacts = [],
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
  summary: `
  <h2 class="text-xl font-bold mb-4" style="color: #008080;">Executive Summary</h2>
<p class="mb-4" style="color: #34495E;">This report consolidates insights from a multi-step resilience analysis focused on downtown Austin. By layering infrastructure condition, socio-economic vulnerability, traffic/crash density, and emergency responsiveness data, we identify zones that require immediate attention from a resilience planning standpoint.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Multiple neighborhoods near Red River, East Cesar Chavez, and Waller Creek show overlapping patterns of degraded infrastructure and low emergency service access.</li>
  <li>High crash density zones align with low walkability and poor street quality, amplifying community safety risks.</li>
  <li>Socio-economic overlays highlight that these areas serve residents with higher poverty rates, low vehicle access, and historic disinvestment.</li>
  <li>Emergency service analysis reveals gaps in capacity relative to at-risk populations, especially in flood-adjacent corridors.</li>
</ul>

<p class="mb-4" style="color: #34495E;">The report recommends prioritizing zones where infrastructural fragility, social vulnerability, and emergency service gaps converge, while also suggesting alignment with potential federal funding strategies.</p>
  `,
  intro: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Introduction</h2>
<p class="mb-4" style="color: #34495E;">Austin’s downtown infrastructure plays a critical role in community safety, mobility, and economic activity. However, overlapping vulnerabilities—ranging from aging infrastructure to social and environmental stressors—compromise resilience. This report focuses on areas where infrastructure degradation intersects with socio-economic vulnerability, crash data, and gaps in emergency preparedness.</p>

<p class="mb-4" style="color: #34495E;">Through a series of interactive steps, we examine the question: <strong>“Given all our data layers, what facilities or zones should we prioritize for emergency planning and investment?”</strong></p>
`,
  methods: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Methodology</h2>
<p class="mb-4" style="color: #34495E;">We integrated data from Austin’s open data portal using a sequence-based visualization approach. Each layer added nuance to the analysis:</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li><strong>Infrastructure Health:</strong> Pulled from the <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8" target="_blank">Infrastructure Condition Network</a> and <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Street-Segment-Condition-Data/pcwe-pwxe" target="_blank">Street Segment Data</a>.</li>
  <li><strong>Socio-economic Vulnerability:</strong> Layered demographic datasets related to poverty, car access, and renter density using tract-level indicators.</li>
  <li><strong>Crash and Traffic Patterns:</strong> Sourced from the <a href="https://data.austintexas.gov/Transportation-and-Mobility/Austin-Crash-Report-Data-Crash-Level-Records/y2wy-tgr5" target="_blank">Austin Crash Records</a> and <a href="https://data.austintexas.gov/Transportation-and-Mobility/Traffic-Detectors/qpuw-8eeb" target="_blank">Traffic Detectors</a>.</li>
  <li><strong>Emergency Facility Access:</strong> Mapped emergency facility locations and compared capacity against population density in risk-prone zones.</li>
</ul>

  `,
  findings: `
<h2 class="text-xl font-bold mb-4" style="color: #008080;">Key Findings</h2>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">1. Concentrated Risk Zones</h3>
<p class="mb-4" style="color: #34495E;">Neighborhoods near 7th Street, Red River, and Trinity exhibit critical overlaps in poor infrastructure, high crash rates, and underserved populations.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">2. Traffic Safety Gaps</h3>
<p class="mb-4" style="color: #34495E;">Crash density is highest in areas lacking basic pedestrian infrastructure or traffic calming measures, making them unsafe for non-vehicle users.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">3. Emergency Response Inequities</h3>
<p class="mb-4" style="color: #34495E;">Population-to-capacity ratios at emergency facilities show major gaps in high-risk census tracts. Facilities near floodplain boundaries are particularly at risk during extreme events.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">4. Compound Vulnerabilities</h3>
<p class="mb-4" style="color: #34495E;">Zones with all four indicators—poor infrastructure, crash hotspots, vulnerable populations, and poor emergency access—are present and mappable.</p>
  `,
  analysis: `
<h2 class="text-xl font-bold mb-4" style="color: #008080;">Analysis</h2>
<p class="mb-4" style="color: #34495E;">This flow helped us narrow down downtown’s most fragile systems by tracking the compounding effects of mobility risk, socio-economic hardship, and degraded infrastructure. It becomes clear that traditional siloed planning methods miss these overlaps. Interventions must be cross-sector and data-informed.</p>

<p class="mb-4" style="color: #34495E;">The emergence of hotspots such as the Red River–Cesar Chavez corridor provides a data-driven case for targeted funding and further study. These zones are not only failing in terms of infrastructure but are also least prepared to handle emergency events.</p>
  `,
  conclusion: `
<h2 class="text-xl font-bold mb-4" style="color: #008080;">Conclusion & Recommendations</h2>

<p class="mb-4" style="color: #34495E;">Downtown Austin faces complex resilience challenges that require multi-layered solutions. Our findings suggest an urgent need to focus on areas where vulnerability layers converge. These areas can become pilots for resilience retrofits and planning innovation.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Recommended Actions:</h3>
<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Upgrade emergency facility infrastructure in high-need zones with low access scores.</li>
  <li>Apply for FEMA or HUD funding for corridors exhibiting highest risk convergence.</li>
  <li>Bundle transportation safety projects with infrastructure upgrades to maximize impact.</li>
  <li>Work with local organizations to assess lived experience of at-risk residents and tailor planning accordingly.</li>
</ul>
  `,
  references: `
  `
};


const [sectionContent, setSectionContent] = useState(sampleContent);
  
  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'methods', name: 'Methodology' },
    { id: 'findings', name: 'Key Findings' },
    {id: 'map', name: 'Flood Plains Concerns Map'},
    { id: 'analysis', name: 'Analysis' },
    { id: 'conclusion', name: 'Conclusion' },
    { id: 'references', name: 'References' }
  ];
  
  
  // Refs for each section for intersection observer
  const sectionRefs = useRef({});
  
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
  
  // Observe all section elements
  Object.values(sectionRefs.current).forEach(ref => {
    if (ref) observer.observe(ref);
  });
  
  return () => {
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.unobserve(ref);
    });
  };
}, [isFullscreen]); // Add isFullscreen as a dependency to reinitialize observer when toggling modes
  
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
              setActiveSection(section.id);
              const element = document.getElementById(section.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 rounded-full transition-all"
            style={{
              backgroundColor: activeSection === section.id ? COLORS.coral : COLORS.white,
              color: activeSection === section.id ? COLORS.white : COLORS.secondary,
              border: 'none',
              boxShadow: activeSection === section.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.id) {
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


{section.id === 'map' ? (
      <div className="w-full h-[600px] my-6 rounded-lg overflow-hidden">
        <FloodplainsConcernMap onLayersReady={onLayersReady} />
      </div>
    ) : isEditing ? (
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
    )}
                
                
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
  
                    {/* Exit fullscreen button */}
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
                
{section.id === 'map' ? (
      <div className="w-full h-[600px] my-6 rounded-lg overflow-hidden">
        <FloodplainsConcernMap onLayersReady={onLayersReady} />
      </div>
    ) : isEditing ? (
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
    )}
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    
  </div>
);
  
  return (
    <>
      {isFullscreen ? fullscreenPanelContent : regularPanelContent}
      {showSources && (
          <div ref ={infoRef}className="absolute top-4 right-4 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in" style={{top: '100px'}}>
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
                  href="https://data.austintexas.gov/Transportation-and-Mobility/Traffic-Detectors/qpuw-8eeb/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Traffic
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Transportation-and-Mobility/Austin-Crash-Report-Data-Crash-Level-Records/y2wy-tgr5/about_data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Crash
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/phcn-uuu3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Street Maintenance
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/d/dn4m-2fjj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Projects
                </a>
              </div>
              <div>
                <a
                  href="https://data.austintexas.gov/Public-Safety/Greater-Austin-Fully-Developed-Floodplain/pjz8-kff2/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Floodplain
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
  );
};
export default ReportComponent2;