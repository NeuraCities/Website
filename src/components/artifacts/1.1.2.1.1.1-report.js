import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2,  Download, Edit2, Save, Menu, Minimize2, Info } from "lucide-react";
import EquityEmergencyChart from './1.1.2.1.1-chart';
import EquityEmergencyMap from './1.1.2.1-map';

const ReportComponent7 = ({ onLayersReady, reportName = "Equity & Emergency Infrastructure in Downtown Austin: A Budget-Constrained Prioritization Report", artifacts = [],
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
<p class="mb-4" style="color: #34495E;">This report identifies underserved zones in downtown Austin where socio-economic vulnerability, infrastructure degradation, and gaps in emergency responsiveness intersect. Using city budget data, it recommends locations where targeted resilience studies can begin within this year’s budget allocation.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Neighborhoods near East 7th Street and Red River show severe infrastructure wear, high renter density, and lower emergency satisfaction scores.</li>
  <li>Demographic overlays reveal a correlation between low-income communities, older buildings, and longer EMS response times.</li>
  <li>There is sufficient room in the 2024 budget under planning and EMS resilience to launch at least two small-area studies.</li>
</ul>

<p class="mb-4" style="color: #34495E;">This report recommends launching corridor-specific studies in these areas to inform future capital planning and resilience funding efforts.</p>
`,
  intro: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Introduction</h2>
<p class="mb-4" style="color: #34495E;">Downtown Austin is experiencing growing equity challenges related to emergency response, infrastructure maintenance, and demographic stress. This report seeks to prioritize zones for study where these challenges converge and where planning can begin under the current fiscal budget.</p>

<p class="mb-4" style="color: #34495E;">We focus on the question: <strong>“Given existing EMS service gaps and socio-economic vulnerability, where should we prioritize infrastructure or emergency preparedness studies within this year’s funding constraints?”</strong></p>
`,
  methods: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Methodology</h2>
<p class="mb-4" style="color: #34495E;">This analysis overlays infrastructure degradation, demographic vulnerability, and EMS data against Austin’s 2024 city budget to identify feasible study areas.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li><strong>Infrastructure:</strong> Mapped using <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8" target="_blank">Infrastructure Charts</a> and <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Street-Segment-Condition-Data/pcwe-pwxe" target="_blank">Street Condition</a> data.</li>
  <li><strong>Demographics:</strong> Analyzed household income, renter status, and access to transportation from the <a href="https://data.austintexas.gov/stories/s/Austin-Demographic-Data-Hub/3wck-mabg/" target="_blank">Austin Demographic Data Hub</a>.</li>
  <li><strong>EMS Readiness:</strong> Assessed using <a href="https://data.austintexas.gov/d/gjtj-jt2d" target="_blank">EMS response metrics</a> and <a href="https://data.austintexas.gov/d/fszi-c96k" target="_blank">resident satisfaction data</a>.</li>
  <li><strong>Budget Filter:</strong> Applied thresholds from the <a href="https://data.austintexas.gov/d/g5k8-8sud" target="_blank">FY24 Budget</a> to determine where studies could be launched this year without additional funding.</li>
</ul>
`,
  findings: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Key Findings</h2>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">1. Service Gaps Cluster Around Equity Stress</h3>
<p class="mb-4" style="color: #34495E;">Zones with poor EMS satisfaction and slower response times correlate with areas of low median income, high renter density, and older housing stock—especially in east downtown sectors.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">2. Infrastructure Decline is Widespread but Uneven</h3>
<p class="mb-4" style="color: #34495E;">Key corridors such as East 6th–7th and near Trinity show a combination of failing street segments, deteriorating buildings, and poor sidewalk access.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">3. Budget Room Exists for Initial Study Launch</h3>
<p class="mb-4" style="color: #34495E;">Review of the budget tracker shows underutilized funds in EMS planning and infrastructure assessment categories that can support study kickoff in at least two focus areas.</p>
`,
  analysis: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Analysis</h2>
<p class="mb-4" style="color: #34495E;">By combining physical infrastructure condition with socio-economic and EMS data, a clear spatial story emerges: downtown Austin’s most vulnerable residents are often also the least served by emergency infrastructure.</p>

<p class="mb-4" style="color: #34495E;">This mismatch—when paired with budget feasibility—creates a unique opportunity for equitable, targeted study launches without delay or major cost barriers.</p>
`,
  conclusion: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Conclusion & Recommendations</h2>

<p class="mb-4" style="color: #34495E;">Austin’s 2024 fiscal year presents an opportunity to take action on resilience and equity. This report recommends launching studies in areas where vulnerability is highest and where resources already exist to support them.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Priority Study Zones:</h3>
<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>East 6th–7th Street Corridor between I-35 and Chicon St</li>
  <li>Trinity & East Cesar Chavez node</li>
</ul>

<p class="mb-4" style="color: #34495E;">These studies will help shape the next round of infrastructure investments while addressing persistent service inequities in emergency response.</p>
`,
  references: `
  `
};


const [sectionContent, setSectionContent] = useState(sampleContent);
  
  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'methods', name: 'Methodology' },
    { id: 'findings', name: 'Key Findings' },
    { id: 'map', name: 'Equity & Emergency Map' },        
  { id: 'chart', name: 'Budget-Constrained Chart' },  
    { id: 'analysis', name: 'Analysis' },
    { id: 'conclusion', name: 'Conclusion' },
    { id: 'references', name: 'References' }
  ];
  
  
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
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // This is the key change
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
    className="fixed top-6 right-6 z-30"
    style={{
      top: '4rem',
      right: '2rem'
    }}
  >
    <div 
      className="flex px-3 py-2 rounded-full"
      style={{ 
        backgroundColor: 'transparent',
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
        <EquityEmergencyMap onLayersReady={onLayersReady} />
      </div>
    ) : section.id === 'chart' ? (
      <div className="w-full my-6">
        <EquityEmergencyChart onLayersReady={onLayersReady} />
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
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex flex-col">

      <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Floating menu button when sidebar is closed */}
          {!sidebarVisible && (
            <div 
              className="fixed z-50"
              style={{
                top: '1rem',
                right: '2rem'
              }}
            >
              <div 
                className="flex px-3 py-2 rounded-full"
                style={{ 
                  backgroundColor: 'transparent',
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
        <EquityEmergencyMap onLayersReady={onLayersReady} />
      </div>
    ) : section.id === 'chart' ? (
      <div className="w-full my-6">
        <EquityEmergencyChart onLayersReady={onLayersReady} />
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

      {regularPanelContent}
      {isFullscreen && fullscreenPanelContent}
      {showSources && (
  <div ref={infoRef}className="fixed top-20 right-6 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000] animate-fade-in" style={{top:'120px'}}>
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
            href="https://data.austintexas.gov/d/gjtj-jt2d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            EMS
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/fszi-c96k"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            EMS Satisfaction
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/g5k8-8sud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Budget
          </a>
        </div>
    </div>
  </div>
)}
    </>
  );
};
export default ReportComponent7;