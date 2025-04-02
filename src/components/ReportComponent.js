import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Share2, Download, BookmarkPlus, Edit2, Save, Menu, Minimize2 } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { FullscreenArtifactNavigation, FullscreenArtifactGallery } from "./FullscreenArtifactComponents";

const ReportComponent = ({ onSaveMap, reportName = "Climate Trends Report 2025", artifacts = [],
  currentArtifactId,
  onSelectArtifact,
  onBack}) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const reportContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showArtifactGallery, setShowArtifactGallery] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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

const handleFullscreenShowGallery = () => {
  setShowArtifactGallery(true);
};

const handleFullscreenGalleryBack = () => {
  setShowArtifactGallery(false);
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
    <p class="mb-4" style="color: #34495E;">This report analyzes global climate trends for 2025, identifying critical patterns and providing actionable recommendations for stakeholders. Our findings indicate a 0.8°C increase in global average temperatures over the past decade, with accelerating impacts on biodiversity, agriculture, and human settlements.</p>
    <p class="mb-4" style="color: #34495E;">Key findings include:</p>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">Significant warming in northern latitudes, exceeding 1.5°C above pre-industrial levels</li>
      <li class="mb-1">Enhanced frequency of extreme weather events, particularly in coastal regions</li>
      <li class="mb-1">Promising results from carbon reduction initiatives in urban centers</li>
      <li class="mb-1">Economic opportunities in renewable energy sectors</li>
    </ul>
    <p style="color: #34495E;">This executive summary highlights essential information from the full report, which provides comprehensive analysis and detailed recommendations for various stakeholders.</p>
  `,
  intro: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Introduction</h2>
    <p class="mb-4" style="color: #34495E;">The global climate continues to evolve at an unprecedented rate, necessitating rigorous monitoring and analysis to inform policy decisions and adaptation strategies. This report synthesizes data from multiple international sources, including satellite observations, ocean monitoring systems, and terrestrial weather stations.</p>
    <p class="mb-4" style="color: #34495E;">The scope of this report encompasses:</p>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">Temperature trends across terrestrial and marine environments</li>
      <li class="mb-1">Precipitation patterns and hydrological impacts</li>
      <li class="mb-1">Extreme weather event frequency and intensity</li>
      <li class="mb-1">Carbon cycle dynamics and atmospheric composition</li>
      <li class="mb-1">Regional impact assessments</li>
    </ul>
    <p style="color: #34495E;">By integrating these diverse data streams, we aim to provide a comprehensive overview of the current state of the global climate system and its implications for natural and human systems.</p>
  `,
  methods: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Methodology</h2>
    <p class="mb-4" style="color: #34495E;">Our analysis employs a multi-modal approach, combining statistical analysis of observational data with advanced climate modeling techniques. We prioritize transparency and reproducibility in all methodological choices.</p>
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Data Sources</h3>
    <p class="mb-4" style="color: #34495E;">Primary data sources include:</p>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">NASA GISS Surface Temperature Analysis</li>
      <li class="mb-1">NOAA Global Monitoring Laboratory atmospheric data</li>
      <li class="mb-1">World Meteorological Organization observational networks</li>
      <li class="mb-1">Copernicus Climate Change Service</li>
      <li class="mb-1">Local meteorological agencies worldwide</li>
    </ul>
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Analytical Approaches</h3>
    <p class="mb-4" style="color: #34495E;">Our analytical framework integrates:</p>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">Time series analysis of temperature and precipitation records</li>
      <li class="mb-1">Spatial pattern recognition using GIS techniques</li>
      <li class="mb-1">Comparative analysis against CMIP6 model projections</li>
      <li class="mb-1">Attribution analysis for extreme events</li>
      <li class="mb-1">Statistical confidence testing and uncertainty quantification</li>
    </ul>
  `,
  findings: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Key Findings</h2>
    <p class="mb-4" style="color: #34495E;">Our analysis reveals several significant findings with implications for global climate policy and adaptation strategies:</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Temperature Trends</h3>
    <p class="mb-4" style="color: #34495E;">Global average temperatures continue to rise at approximately 0.18°C per decade, with 2024 ranking as the second warmest year on record. Arctic amplification remains pronounced, with warming rates approximately twice the global average.</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Precipitation Patterns</h3>
    <p class="mb-4" style="color: #34495E;">We observe an intensification of the hydrological cycle, with arid regions generally becoming drier and humid regions experiencing increased precipitation intensity. Monsoon systems show increasing variability, affecting agricultural planning across tropical and subtropical regions.</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Extreme Events</h3>
    <p class="mb-4" style="color: #34495E;">The frequency of heat waves has increased by 35% compared to the 1981-2010 baseline period. Tropical cyclone intensity metrics show statistically significant increases, particularly in maximum sustained wind speeds and precipitation rates.</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Cryosphere</h3>
    <p class="mb-4" style="color: #34495E;">Arctic sea ice continues to decline at approximately 13% per decade (September minimum). Greenland and Antarctic ice sheets show accelerating mass loss, contributing to observed sea level rise of 4.5mm/year.</p>
  `,
  analysis: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Analysis</h2>
    <p class="mb-4" style="color: #34495E;">The observed climate trends align with projections from climate models under moderate to high emissions scenarios, suggesting that current mitigation efforts remain insufficient to limit warming to the Paris Agreement targets.</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Regional Disparities</h3>
    <p class="mb-4" style="color: #34495E;">Climate impacts manifest unevenly across regions, with particular vulnerability in:</p>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">Low-lying coastal areas facing sea level rise and storm surge risks</li>
      <li class="mb-1">Arid and semi-arid regions experiencing enhanced drought conditions</li>
      <li class="mb-1">Tropical regions with limited adaptive capacity despite high exposure</li>
      <li class="mb-1">Arctic communities facing rapid environmental change</li>
    </ul>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Sectoral Impacts</h3>
    <p class="mb-4" style="color: #34495E;">Our analysis indicates significant impacts across key economic sectors:</p>
    
    <h4 class="text-base font-medium mt-3 mb-1" style="color: #008080;">Agriculture</h4>
    <p class="mb-3" style="color: #34495E;">Shifting growing seasons and increased water stress in major agricultural regions is affecting crop yields, with particular impacts on staple crops in tropical and subtropical regions.</p>
    
    <h4 class="text-base font-medium mt-3 mb-1" style="color: #008080;">Water Resources</h4>
    <p class="mb-3" style="color: #34495E;">Changing precipitation patterns are affecting water availability for human consumption, agriculture, and hydropower generation, with increased competition for resources in water-stressed regions.</p>
    
    <h4 class="text-base font-medium mt-3 mb-1" style="color: #008080;">Energy</h4>
    <p class="mb-3" style="color: #34495E;">Increasing cooling demand in warmer regions is placing pressure on energy systems, while creating opportunities for renewable energy deployment.</p>
  `,
  conclusion: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">Conclusion</h2>
    <p class="mb-4" style="color: #34495E;">The evidence presented in this report underscores the accelerating pace of climate change and its widespread impacts on human and natural systems. While challenges remain substantial, there are also encouraging developments in technology, policy, and public awareness that provide pathways for effective response.</p>
    
    <h3 class="text-lg font-semibold mt-4 mb-2" style="color: #008080;">Key Recommendations</h3>
    <ul class="list-disc pl-5 mb-4" style="color: #34495E;">
      <li class="mb-1">Accelerate decarbonization across all economic sectors, with emphasis on energy systems, transportation, and industry</li>
      <li class="mb-1">Enhance adaptive capacity through infrastructure investment, particularly in vulnerable regions</li>
      <li class="mb-1">Strengthen early warning systems and disaster preparedness for extreme weather events</li>
      <li class="mb-1">Integrate climate considerations into all levels of governance and planning</li>
      <li class="mb-1">Increase investment in climate-resilient agriculture and food systems</li>
    </ul>
    
    <p class="mb-4" style="color: #34495E;">In conclusion, while the climate challenges documented in this report are substantial, there are viable pathways for effective response through coordinated global action, technological innovation, and strengthened governance frameworks.</p>
  `,
  references: `
    <h2 class="text-xl font-bold mb-4" style="color: #008080;">References</h2>
    <div class="space-y-3">
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">IPCC</span> (2023). Climate Change 2023: Synthesis Report. Contribution of Working Groups I, II and III to the Sixth Assessment Report of the Intergovernmental Panel on Climate Change.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">NASA GISS</span> (2024). GISS Surface Temperature Analysis (GISTEMP v4). NASA Goddard Institute for Space Studies.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">NOAA</span> (2024). State of the Climate: Global Climate Report for Annual 2024. National Centers for Environmental Information.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">WMO</span> (2025). WMO Statement on the State of the Global Climate in 2024. World Meteorological Organization.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">Copernicus Climate Change Service</span> (2025). European State of the Climate 2024. Copernicus Climate Change Service, European Union.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">Smith, J. et al.</span> (2024). "Emerging patterns in global temperature extremes." Nature Climate Change, 14(3): 245-258.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">Chen, L. et al.</span> (2023). "Agricultural productivity under changing climate regimes: A global meta-analysis." Science Advances, 9(6): eabd8754.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">Rodriguez, A. and Williams, K.</span> (2024). "Urban heat island effects on energy demand." Energy Policy, 175: 113314.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">UNEP</span> (2024). Emissions Gap Report 2024. United Nations Environment Programme.
      </p>
      <p class="text-sm" style="color: #34495E;">
        <span class="font-medium">World Bank</span> (2024). Climate Change and Development: An Economic Analysis. World Bank, Washington, DC.
      </p>
    </div>
  `
};


const [sectionContent, setSectionContent] = useState(sampleContent);
  
  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'methods', name: 'Methodology' },
    { id: 'findings', name: 'Key Findings' },
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

  // Function to handle the share action
  const handleShare = () => {
    if (isEditing) {
      setIsEditing(false);
    }
    setShareDialogOpen(true);
  };

  // Function to handle share dialog submission
  const handleShareSubmit = (email) => {
    // Here you would implement actual sharing functionality
    console.log(`Sharing report with ${email}`);
    // For now, we'll just close the dialog
    setShareDialogOpen(false);
  };

  const handleSave = () => {
    if (isEditing) {
      setIsEditing(false);
    }
    // Generate a timestamp-based artifact name like CombinedVisualizationPanel does
    const artifactName = `Report ${new Date().toLocaleDateString()}`;
    
    // Get the HTML content from the report container
    const reportContent = reportContainerRef.current?.innerHTML || '';
    
    // Just directly call onSaveMap exactly like CombinedVisualizationPanel does
    if (onSaveMap && typeof onSaveMap === 'function') {
      onSaveMap(artifactName, reportContent);
    } else {
      console.error("onSaveMap function is not available");
    }
  };
  
  // Render geographic distribution chart
  const renderGeographicDistribution = () => {
    // This will be provided later by you
    return null;
  };
  
  // Render Temperature Trends chart
  const renderTemperatureTrends = () => {
    // This will be provided later by you
    return null;
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
    <div className="flex justify-center">
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
              onClick={handleShare}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title="Share report"
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
              <Share2 size={20} />
            </button>

            <button 
              onClick={handleSave}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
              title="Save to artifacts"
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
              <BookmarkPlus size={20} />
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

          <button 
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title="Share report"
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
            <Share2 size={20} />
          </button>

          <button 
            onClick={handleSave}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
            title="Save to artifacts"
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
            <BookmarkPlus size={20} />
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

{/* Section content - editable or static based on mode */}
{isEditing ? (
  <div 
    className="prose prose-sm max-w-none p-3 rounded-md"
    style={{ 
      backgroundColor: '#f8f9fa',
      border: `1px solid ${COLORS.coral}30`,
      minHeight: '150px',
      outline: 'none'
    }}
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
                
                {/* Charts/graphics - only show for Key Findings section */}
                {section.id === 'findings' && (
                  <div className="mt-8 border-t pt-6" style={{ borderColor: '#e5e7eb' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.coral }}>Supporting Data</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: COLORS.white, borderColor: '#e5e7eb' }}>
                        {renderTemperatureTrends && renderTemperatureTrends()}
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: COLORS.white, borderColor: '#e5e7eb' }}>
                        {renderGeographicDistribution && renderGeographicDistribution()}
                      </div>
                    </div>
                    
                    <div 
  className={`mt-4 p-4 rounded-lg ${isEditing ? 'border border-dashed' : 'flex items-start'}`}
  style={{ 
    backgroundColor: isEditing ? 'transparent' : `${COLORS.coral}05`,
    borderColor: isEditing ? COLORS.coral : `${COLORS.coral}20`
  }}
>
  {isEditing ? (
    <div 
      contentEditable={true}
      suppressContentEditableWarning={true}
      className="outline-none w-full"
      dangerouslySetInnerHTML={createMarkup(
        '<h4 class="font-medium text-sm">Methodology Note</h4>' +
        '<p class="text-sm">Temperature anomalies are calculated relative to the 1951-1980 average. ' +
        'Sea ice extent represents September minimum values. All data has been ' +
        'validated through multiple sources and statistical analyses.</p>'
      )}
    />
  ) : (
    <>
      <h4 className="font-medium text-sm" style={{ color: COLORS.coral }}>Methodology Note</h4>
      <p className="text-sm ml-2" style={{ color: COLORS.secondary }}>
        Temperature anomalies are calculated relative to the 1951-1980 average. 
        Sea ice extent represents September minimum values. All data has been 
        validated through multiple sources and statistical analyses.
      </p>
    </>
  )}
</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      
      {/* Share Dialog */}
      {shareDialogOpen && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          onShare={handleShareSubmit}
          conversationName={reportName}
        />
      )}
    </div>
  );
  
  const fullscreenPanelContent = (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex flex-col">
{showArtifactGallery && (
        <FullscreenArtifactGallery
          artifacts={artifacts}
          onSelectArtifact={onSelectArtifact}
          onBack={handleFullscreenGalleryBack}
        />
      )}

      {/* Show artifact navigation if artifacts exist and not showing gallery */}
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
                    
                    {/* Share button */}
                    <button 
                      onClick={handleShare}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title="Share report"
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
                      <Share2 size={20} />
                    </button>
  
                    {/* Save button */}
                    <button 
                      onClick={handleSave}
                      className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow mr-2"
                      title="Save to artifacts"
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
                      <BookmarkPlus size={20} />
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
                    backgroundColor: 'transparent',
                    boxShadow: 'none)',
                    backgroundColor: 'transparent',
                    border: 'none'
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
                        onClick={handleShare}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title="Share report"
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
                        <Share2 size={20} />
                      </button>
  
                      <button 
                        onClick={handleSave}
                        className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
                        title="Save to artifacts"
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
                        <BookmarkPlus size={20} />
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
                {isEditing ? (
                  <div 
                    className="prose prose-lg max-w-none p-4 rounded-md"
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      border: `1px solid ${COLORS.coral}30`,
                      minHeight: '200px',
                      outline: 'none'
                    }}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={createMarkup(sectionContent[section.id] || '')}
                    onBlur={(e) => handleContentChange(section.id, e)}
                  />
                ) : (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={createMarkup(sectionContent[section.id] || '')} 
                  />
                )}
                
                {/* Charts/graphics - only show for Key Findings section */}
                {section.id === 'findings' && (
                  <div className="mt-10 border-t pt-8" style={{ borderColor: '#e5e7eb' }}>
                    <h3 className="text-xl font-semibold mb-5" style={{ color: COLORS.coral }}>Supporting Data</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-5 rounded-lg border" style={{ backgroundColor: COLORS.white, borderColor: '#e5e7eb' }}>
                        {renderTemperatureTrends && renderTemperatureTrends()}
                        <div className="mt-2 text-sm text-center font-medium" style={{ color: COLORS.secondary }}>
                          Global Temperature Anomalies (1980-2025)
                        </div>
                      </div>
                      <div className="p-5 rounded-lg border" style={{ backgroundColor: COLORS.white, borderColor: '#e5e7eb' }}>
                        {renderGeographicDistribution && renderGeographicDistribution()}
                        <div className="mt-2 text-sm text-center font-medium" style={{ color: COLORS.secondary }}>
                          Regional Climate Impact Distribution
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`mt-4 p-4 rounded-lg ${isEditing ? 'border border-dashed' : 'flex items-start'}`}
                      style={{ 
                        backgroundColor: isEditing ? 'transparent' : `${COLORS.coral}05`,
                        borderColor: isEditing ? COLORS.coral : `${COLORS.coral}20`
                      }}
                    >
                      {isEditing ? (
                        <div 
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          className="outline-none w-full"
                          dangerouslySetInnerHTML={createMarkup(
                            '<h4 class="font-medium text-sm">Methodology Note</h4>' +
                            '<p class="text-sm">Temperature anomalies are calculated relative to the 1951-1980 average. ' +
                            'Sea ice extent represents September minimum values. All data has been ' +
                            'validated through multiple sources and statistical analyses.</p>'
                          )}
                        />
                      ) : (
                        <>
                          <h4 className="font-medium text-sm" style={{ color: COLORS.coral }}>Methodology Note</h4>
                          <p className="text-sm ml-2" style={{ color: COLORS.secondary }}>
                            Temperature anomalies are calculated relative to the 1951-1980 average. 
                            Sea ice extent represents September minimum values. All data has been 
                            validated through multiple sources and statistical analyses.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Share Dialog */}
    {shareDialogOpen && (
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onShare={handleShareSubmit}
        conversationName={reportName}
      />
    )}
  </div>
);
  
  return (
    <>
      {regularPanelContent}
      {isFullscreen && fullscreenPanelContent}
    </>
  );
};
export default ReportComponent;