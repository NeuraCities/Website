import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Download, Edit2, Save, Menu, Minimize2, Info } from "lucide-react";
import DowntownResilienceMap from './1.1.1.1-map';
import DowntownResilienceChart from './1.1-chart';


const ReportComponent1 = ({ onLayersReady, reportName = "Downtown Austin Resilience Assessment: Infrastructure, Risk & Opportunity", artifacts = [],
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
  }, []);
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
<p class="mb-4" style="color: #34495E;">This report presents a comprehensive resilience evaluation of downtown Austin’s infrastructure through a multi-layered analysis that includes structural condition data, socio-economic indicators, transportation safety, environmental vulnerabilities, zoning policies, and climate equity frameworks. Our goal is to identify overlapping zones of concern and highlight initial intervention areas.</p>

<p class="mb-4" style="color: #34495E;">The findings show a distinct correlation between aging or deteriorated infrastructure, high crash densities, and socio-economically vulnerable populations. These vulnerabilities are often intensified by environmental stressors such as flooding and poor land use planning. This report synthesizes these factors and offers policy-aware recommendations to improve downtown resilience and equity outcomes.</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Street and infrastructure condition ratings reveal clusters of critical degradation across key downtown corridors including Red River St, East Cesar Chavez, and the area between I-35 and Trinity St.</li>
  <li>Demographic overlays highlight that these degraded zones often serve communities with lower incomes, higher renter density, and elevated rates of environmental health risks.</li>
  <li>Crash and traffic datasets further confirm safety concerns in these areas, especially where pedestrian infrastructure is underdeveloped or poorly maintained.</li>
  <li>Environmental overlays (e.g. floodplain boundaries) intersect with aging infrastructure, posing compounding risks for emergency access and mobility in extreme events.</li>
  <li>Zoning and land use codes currently limit adaptive redevelopment in many affected areas, indicating a misalignment between planning policy and resilience needs.</li>
</ul>

<p style="color: #34495E;">Together, these findings support a targeted strategy for capital improvements, regulatory reform, and potential federal funding applications (e.g. FEMA BRIC or HUD CDBG-DR) to enhance resilience in Austin’s urban core.</p>
  `,
  intro: `<h2 class="text-xl font-bold mb-4" style="color: #008080;">Introduction</h2>
<p class="mb-4" style="color: #34495E;">Downtown Austin is the economic and cultural heart of the city, but its infrastructure is aging and increasingly stressed by population growth, climate variability, and historic inequities. This report is part of a broader effort to embed resilience thinking into Austin’s urban planning and policy agenda by leveraging public datasets, community indicators, and environmental vulnerability metrics.</p>

<p class="mb-4" style="color: #34495E;">Specifically, this report builds upon previous visualizations and layered spatial analysis to answer the question: <strong>“What is the current state of downtown Austin’s infrastructure, and what are the socio-economic, environmental, and policy factors that should influence resilience planning moving forward?”</strong></p>

<p class="mb-4" style="color: #34495E;">We take a data-driven and equity-centered approach, layering infrastructure health with crash trends, population vulnerability, zoning regulations, and land use overlays to construct a multidimensional view of risk and opportunity.</p>
  `,
  methods: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Methodology</h2>
<p class="mb-4" style="color: #34495E;">We used a spatial intersection and pattern analysis method combining publicly available datasets from the City of Austin and supporting planning documents. The process included the following steps:</p>

<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li><strong>Condition Assessment:</strong> Mapped infrastructure condition scores and street segment ratings from 2022–2023 datasets. Key sources include the <a href="https://data.austintexas.gov/City-Infrastructure/Strategic-Measure_Infrastructure-Condition_Network/5sh6-vxv8" target="_blank">Strategic Measure Infrastructure Condition Network</a>.</li>
  <li><strong>Crash and Traffic Overlay:</strong> Analyzed recent crash density and traffic volume data to locate hotspots, especially where pedestrian infrastructure is lacking.</li>
  <li><strong>Demographic Layering:</strong> Overlaid income, race, age, and renter rate data using the <a href="https://data.austintexas.gov/stories/s/Austin-Demographic-Data-Hub/3wck-mabg/" target="_blank">Austin Demographic Hub</a>. Emphasis was placed on identifying Environmental Justice (EJ) communities per EPA guidelines.</li>
  <li><strong>Environmental Risk Zones:</strong> Used City of Austin floodplain and stormwater hazard maps to identify environmental stress overlaps.</li>
  <li><strong>Zoning and Policy Review:</strong> Referenced <a href="https://library.municode.com/tx/austin/codes/code_of_ordinances?nodeId=TIT25LADE_CH25-7DR" target="_blank">Title 25 Land Development Code</a> and Austin’s <a href="https://www.austintexas.gov/sites/default/files/files/Sustainability/Climate%20Equity%20Plan/Climate%20Equity%20Plan%20Full%20Document__FINAL.pdf" target="_blank">Climate Equity Plan</a> to assess alignment of planning policy with observed risk zones.</li>
</ul>

<p class="mb-4" style="color: #34495E;">Maps, charts, and visual overlays were created through custom tooling in React using interactive layers to visualize overlaps and analyze patterns at the block and corridor level.</p>

  `,
  findings: `
  <h2 class="text-xl font-bold mb-4" style="color: #008080;">Key Findings</h2>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">1. Street & Infrastructure Condition</h3>
<p class="mb-4" style="color: #34495E;">Over 30% of downtown street segments are rated in poor or failed condition. High degradation is seen near 7th Street, Red River, and within the East Cesar Chavez corridor. This correlates with older pavement age, deferred maintenance, and stormwater system backlog.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">2. Socio-economic Vulnerability</h3>
<p class="mb-4" style="color: #34495E;">Census tracts in these areas exhibit above-average rates of poverty, housing burden, and low access to vehicles. These conditions increase the risk of disconnection during flooding or infrastructure failure events.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">3. Crash Hotspots</h3>
<p class="mb-4" style="color: #34495E;">Recent crash data identifies hotspots along Red River, E 6th, and E Cesar Chavez, which overlap areas with poor infrastructure and low pedestrian infrastructure quality. Over 200 incidents were recorded in the past two years in these overlapping corridors.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">4. Environmental Exposure</h3>
<p class="mb-4" style="color: #34495E;">Floodplain overlays show significant overlap with poor infrastructure zones, particularly near Waller Creek. Several critical roadways in these areas lack permeable surfaces or adequate drainage infrastructure.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">5. Policy and Zoning Gaps</h3>
<p class="mb-4" style="color: #34495E;">Land use data shows that several of these high-risk areas fall into zoning types that do not support resilience-focused retrofitting, green infrastructure, or multi-use transit improvements. These include Commercial Services (CS) and Light Industrial (LI) zones.</p>
  `,
  analysis: `
<h2 class="text-xl font-bold mb-4" style="color: #008080;">Analysis</h2>
<p class="mb-4" style="color: #34495E;">The convergence of poor infrastructure, socio-economic hardship, environmental stress, and planning misalignment in the downtown core reveals systemic resilience vulnerabilities. These are not distributed evenly but clustered in predictable zones, often shaped by historic disinvestment and zoning decisions made decades ago.</p>

<p class="mb-4" style="color: #34495E;">The ability of downtown infrastructure to withstand climate events, serve residents equitably, and enable safe mobility is currently impaired in multiple corridors. In the context of climate adaptation and economic recovery, this creates both urgency and opportunity for investment and policy innovation.</p>
  `,
  conclusion: `
  <h2 class="text-xl font-bold mb-4" style="color: #008080;">Conclusion & Recommendations</h2>
<p class="mb-4" style="color: #34495E;">To improve resilience in downtown Austin, the city should prioritize integrated interventions in identified hotspots. This includes investing in street repairs, implementing green infrastructure, updating zoning, and planning around equity-focused data.</p>

<h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Recommended Next Steps:</h3>
<ul class="list-disc pl-5 mb-4" style="color: #34495E;">
  <li>Launch corridor-specific resilience upgrades starting with East Cesar Chavez and Red River corridors.</li>
  <li>Overlay FEMA’s BRIC program eligibility to explore federal co-funding opportunities.</li>
  <li>Revise zoning overlays to support resilience retrofitting and mixed-income housing in critical areas.</li>
  <li>Deploy rapid-response pedestrian infrastructure in crash hotspots with high foot traffic.</li>
  <li>Include community organizations in co-designing upgrades for neighborhoods with high vulnerability scores.</li>
</ul>

<p class="mb-4" style="color: #34495E;">Resilience planning must be proactive, equity-centered, and data-informed. The downtown core — as the symbolic and logistical center of Austin — deserves focused and sustained attention as both the most vulnerable and most high-impact zone for change.</p>
  `,
  references: `
  `
};


const [sectionContent, setSectionContent] = useState(sampleContent);
  
  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'methods', name: 'Methodology' },
    { id: 'findings', name: 'Key Findings' },
    { id: 'analysis', name: 'Analysis' },
    { id: 'map', name: 'Downtown Infrastructure Map' },  
  { id: 'chart', name: 'Crash & Vulnerability Chart' },
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
  
  const handleDownload = () => {
    if (isEditing) {
      setIsEditing(false);
    }
    
    // Dynamically import html2pdf
    import('html2pdf.js').then(html2pdfModule => {
      const html2pdf = html2pdfModule.default;
      
      // Get all section elements
      const sectionElements = sections.map(section => {
        return document.getElementById(section.id) || document.getElementById(`fullscreen-${section.id}`);
      }).filter(el => el); // Filter out any undefined elements
      
      // Create temporary container for the entire report
      const tempContainer = document.createElement('div');
      document.body.appendChild(tempContainer);
      
      // Add each section to the container with a page break after each
      sectionElements.forEach((section, index) => {
        // Clone the section to avoid modifying the original
        const sectionClone = section.cloneNode(true);
        
        // Add page-break-after style to force a new page after each section
        sectionClone.style.pageBreakAfter = 'always';
        sectionClone.style.breakAfter = 'page';
        sectionClone.style.marginBottom = '50px'; // Add some space
        
        // Add a visible separator at the bottom to help force the page break
        const separator = document.createElement('div');
        separator.style.height = '1px';
        separator.style.width = '100%';
        separator.style.marginTop = '40px';
        separator.style.marginBottom = '40px';
        
        // Add the section to the container
        tempContainer.appendChild(sectionClone);
        
        // Don't add a separator after the last section
        if (index < sectionElements.length - 1) {
          tempContainer.appendChild(separator);
        }
      });
      
      // Set PDF generation options with explicit page break settings
      const options = {
        margin: [25, 25, 25, 25], // Increased margins
        filename: `${reportName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: ['.page-break-after', 'section'],
          avoid: ['.avoid-break']
        }
      };
      
      // Use html2pdf to convert temp container to PDF
      html2pdf()
        .from(tempContainer)
        .set(options)
        .toPdf()
        .get('pdf')
        .then(pdf => {
          // Clean up the temp container
          document.body.removeChild(tempContainer);
          
          // Save the PDF
          pdf.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          document.body.removeChild(tempContainer);
        });
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
            </button>    {!isMobile && (

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
        backgroundColor: 'white',
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

          <button 
  onClick={() => setShowSources(prev => !prev)} 
  title="View Sources"
  style={{ 
    color: COLORS.coral,
    backgroundColor: 'transparent',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '0.5rem'
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
        <div className="flex-1 overflow-auto pl-4 relative" style={{ backgroundColor: COLORS.white }}>
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 my-4 bg-white rounded-lg shadow-sm" ref={reportContainerRef}>
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
<div className="w-full h-[400px] sm:h-[500px] md:h-[600px] my-6 rounded-lg overflow-hidden">
        <DowntownResilienceMap onLayersReady={onLayersReady} />
      </div>
    ) : section.id === 'chart' ? (
      <div className="w-full my-6">
        <DowntownResilienceChart onLayersReady={onLayersReady} />
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
<div className="absolute inset-0 z-[100] bg-white flex flex-col">

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
                    <button 
  onClick={() => setShowSources(prev => !prev)} 
  title="View Sources"
  style={{ 
    color: COLORS.coral,
    backgroundColor: 'transparent',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '0.5rem'
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
  
                      <button 
  onClick={() => setShowSources(prev => !prev)} 
  title="View Sources"
  style={{ 
    color: COLORS.coral,
    backgroundColor: 'transparent',
    border: 'none',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '0.5rem'
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

{section.id === 'map' ? (
      <div className="w-full h-[600px] my-6 rounded-lg overflow-hidden">
        <DowntownResilienceMap onLayersReady={onLayersReady} />
      </div>
    ) : section.id === 'chart' ? (
      <div className="w-full my-6">
        <DowntownResilienceChart onLayersReady={onLayersReady} />
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
    <div ref={infoRef}className="absolute top-full right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-[1000000]" style={{top:'170px'}}>
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
            Flood Mitigation Task Force-Final Report to Austin City Council Codes
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/q3y3-ungd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Zoning
          </a>
        </div>
        <div>
          <a
            href="https://data.austintexas.gov/d/4etb-jk4d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Land use
          </a>
        </div>
      </div>
    </div>
  )}
  
    </>
  );
};
export default ReportComponent1;