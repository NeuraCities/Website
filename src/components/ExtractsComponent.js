import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Share2, Download, BookmarkPlus, Menu, Minimize2 } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { FullscreenArtifactNavigation, FullscreenArtifactGallery } from "./FullscreenArtifactComponents";

// Define the theme colors as constants - matching the report component
const COLORS = {
  primary: '#2C3E50',
  secondary: '#34495E',
  neutral: '#F5F5F5',
  white: '#FFFFFF',
  coral: '#008080',
  cta: '#FF5747'
};

const ExtractsComponent = ({ onSaveExtract, extractsCollectionName = "Research Extracts Collection",
  artifacts = [],
  currentArtifactId,
  onSelectArtifact,
  onBack }) => {
  const [activeExtract, setActiveExtract] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const extractsContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComponentArtifactGallery, setShowComponentArtifactGallery] = useState(false);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const handleFullscreenShowGallery = () => {
    setShowComponentArtifactGallery(true);
  };

  const handleFullscreenGalleryBack = () => {
    setShowComponentArtifactGallery(false);
  };
  // Extract refs for intersection observer
  const extractRefs = useRef({});
  
  const extracts = [
    {
      id: 1,
      title: 'Population Growth Analysis',
      source: 'population_report.pdf',
      page: 'Page 12',
      date: 'Mar 14, 2025',
      content: 'The global population growth rate has decreased from 1.1% in 2010 to 0.9% in 2025, with projections indicating continued deceleration through 2050. Urban centers are expected to account for 68% of the world population by 2030, up from 56% in 2020. These demographic shifts will have significant implications for infrastructure planning, resource allocation, and environmental impact assessment in urban and rural areas alike.',
      tags: ['Demographics', 'Trends', 'Research']
    },
    {
      id: 2,
      title: 'Climate Impact Assessment',
      source: 'environmental_assessment.docx',
      page: 'Pages 23-24',
      date: 'Mar 10, 2025',
      content: 'Climate change impacts are projected to reduce agricultural yields by 8-13% in tropical regions by 2035, with cascading effects on food security and economic stability. Adaptation strategies focused on drought-resistant crops and improved irrigation systems have shown promise in initial trials, reducing vulnerability by approximately 40% in test regions. Geographic information systems have been instrumental in identifying optimal locations for implementing these strategies based on soil conditions, water availability, and climate projections.',
      tags: ['Climate', 'Analysis', 'Agriculture']
    },
    {
      id: 3,
      title: 'Economic Indicators Report',
      source: 'quarterly_report.pptx',
      page: 'Slide 15',
      date: 'Mar 5, 2025',
      content: 'Q1 2025 showed a 3.2% increase in GDP compared to Q4 2024, exceeding market expectations. The service sector led growth with a 4.1% expansion, while manufacturing showed modest gains of 2.3%. Inflation remained stable at 2.1%, within target ranges. Spatial analysis of economic activity reveals significant regional disparities, with coastal urban centers showing accelerated growth rates compared to inland regions. This geographic pattern suggests the need for targeted economic development initiatives to address imbalances.',
      tags: ['Finance', 'Quarterly', 'Economics']
    },
    {
      id: 4,
      title: 'Urban Development Plan',
      source: 'city_planning.pdf',
      page: 'Pages 45-47',
      date: 'Mar 3, 2025',
      content: 'The proposed urban development framework adopts a polycentric approach, establishing multiple activity centers connected by efficient transit corridors. This model has been demonstrated to reduce commute times by 22% and decrease carbon emissions from transportation by 18% compared to traditional centralized urban plans. Land use allocation prioritizes mixed-use development with 40% residential, 30% commercial, 15% green space, and 15% public services/infrastructure. GIS models predict this distribution will optimize accessibility while maintaining neighborhood character.',
      tags: ['Urban Planning', 'Development', 'Policy']
    },
    {
      id: 5,
      title: 'Water Resource Management',
      source: 'hydrology_assessment.xlsx',
      page: 'Sheet: Regional Summary',
      date: 'Feb 28, 2025',
      content: 'Groundwater depletion rates have accelerated by 15% over the past five years in the western basin. Hydrological modeling suggests that current extraction rates exceed recharge capacity by approximately 2.4 million cubic meters annually. Spatial analysis identifies three critical zones requiring immediate intervention, primarily in agricultural regions with intensive irrigation practices. Recommended management strategies include modernized irrigation systems, revised water pricing structures, and targeted aquifer recharge projects at locations identified through GIS analysis.',
      tags: ['Hydrology', 'Resources', 'Management']
    }
  ];
  
  // Handle sidebar animation
  useEffect(() => {
    if (isSidebarOpen) {
      // First make the sidebar visible but with 0 width
      setSidebarVisible(true);
      // Then trigger a reflow and animate width in
      setTimeout(() => {
        const sidebar = document.getElementById('extracts-sidebar');
        const fullscreenSidebar = document.getElementById('extracts-fullscreen-sidebar');
        
        if (sidebar) {
          sidebar.style.width = '260px';
        }
        
        if (fullscreenSidebar) {
          fullscreenSidebar.style.width = '220px';
        }
      }, 10);
    } else {
      // First animate width out
      const sidebar = document.getElementById('extracts-sidebar');
      const fullscreenSidebar = document.getElementById('extracts-fullscreen-sidebar');
      
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
  
      // Delay to ensure DOM is updated before applying sidebar width
      setTimeout(() => {
        const sidebar = document.getElementById('extracts-sidebar');
        const fullscreenSidebar = document.getElementById('extracts-fullscreen-sidebar');
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
  
  // Function to handle the download action
  const handleDownload = () => {
    // Dynamically import html2pdf
    import('html2pdf.js').then(html2pdfModule => {
      const html2pdf = html2pdfModule.default;
      const element = extractsContainerRef.current;
      if (!element) return;

      const options = {
        margin: 10,
        filename: `${extractsCollectionName.replace(/\s+/g, '_')}.pdf`,
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
    setShareDialogOpen(true);
  };

  // Function to handle share dialog submission
  const handleShareSubmit = (email) => {
    // Here you would implement actual sharing functionality
    console.log(`Sharing extracts with ${email}`);
    // For now, we'll just close the dialog
    setShareDialogOpen(false);
  };

  // Function to handle save action
  const handleSave = () => {
    // Generate a timestamp-based artifact name
    const artifactName = `Extracts ${new Date().toLocaleDateString()}`;
    
    // Get the HTML content from the extracts container
    const extractsContent = extractsContainerRef.current?.innerHTML || '';
    
    // Call the onSaveExtract function
    if (onSaveExtract && typeof onSaveExtract === 'function') {
      onSaveExtract(artifactName, extractsContent);
    } else {
      console.error("onSaveExtract function is not available");
    }
  };
  
  // Button group for floating controls
const ActionButtons = ({ insideSidebar = false }) => (
  <div 
    className={insideSidebar ? "flex justify-center py-3" : "fixed z-50"}
    style={insideSidebar ?{
      // Add more left padding when inside the sidebar
      paddingLeft: '16px',
      width: '100%'
    } : {
      top: isFullscreen ? '1.5rem' : '4rem',
            right: '2rem'
    }}
  >
    <div 
      className="flex px-3 py-2 rounded-full"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* For sidebar: always show buttons */}
      {/* For floating: only show other buttons when menu is open */}
      {(insideSidebar || isMenuOpen) && (
        <>
          {/* Share button */}
          <button 
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
            title="Share extracts"
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

          {/* Download button */}
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
          
          {/* Sidebar toggle button - context aware */}
          {!insideSidebar ? (
            !isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
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
            )
          ) : (
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
          )}

          {/* Fullscreen toggle button */}
          <button 
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 rounded-full transition-all hover:shadow"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </>
      )}
      
      {/* Menu toggle button - only when not inside sidebar */}
      {!insideSidebar && (
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
      )}
    </div>
  </div>
);

  // Regular panel content
  const regularPanelContent = (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: COLORS.white }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Table of contents sidebar - animated with CSS transitions */}
        {sidebarVisible && (
          <div 
            id="extracts-sidebar"
            className="border-r overflow-auto"
            style={{ 
              width: '0px', 
              borderColor: '#e5e7eb', 
              backgroundColor: COLORS.white,
              transition: 'width 300ms ease-in-out',
              overflowX: 'hidden' 
            }}
          >
            {/* Add ActionButtons at the top of the sidebar */}
            <ActionButtons insideSidebar={true} />
            
            <div className="py-4 justify-center whitespace-nowrap">
              {/* Tab header without back button */}
             
              
              {/* Content items */}
              <div className="flex flex-col justify-center w-full">
                {extracts.map((extract, index) => (
                  <button
                    key={extract.id}
                    onClick={() => {
                      setActiveExtract(index);
                      const element = document.getElementById(`extract-${index}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-left px-4 py-3 text-sm flex items-center mb-2 rounded-full transition-all"
                    style={{
                      backgroundColor: activeExtract === index ? COLORS.coral : COLORS.white,
                      color: activeExtract === index ? COLORS.white : COLORS.secondary,
                      border: 'none',
                      boxShadow: activeExtract === index ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s ease-in-out',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (activeExtract !== index) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeExtract !== index) {
                        e.currentTarget.style.backgroundColor = COLORS.white;
                      }
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{extract.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
          
        {/* Main content area */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: COLORS.white }}>
        <div className="max-w-3xl mx-2 p-6 bg-white my-4 rounded-lg shadow-sm" style={{ paddingBottom: '5rem', paddingTop: '2rem', marginBottom: '3rem' }} ref={extractsContainerRef}>            
            {extracts.map((extract, index) => (
              <div 
                key={extract.id}
                id={`extract-${index}`}
                data-index={index}
                ref={el => extractRefs.current[index] = el}
                className="mb-10 pb-6 border-b"
                style={{ borderColor: '#e5e7eb' }}
              >
                {/* Extract content */}
                <div className="pb-4 mb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.coral }}>
                        {extract.title}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-1">
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
    style={{
      backgroundColor: `${COLORS.coral}10`,
      color: COLORS.coral
    }}
  >
    {extract.source}
  </span>
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
    style={{
      backgroundColor: `${COLORS.coral}10`,
      color: COLORS.coral
    }}
  >
    {extract.page}
  </span>
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
    style={{
      backgroundColor: `${COLORS.coral}10`,
      color: COLORS.coral
    }}
  >
    {extract.date}
  </span>
</div>
                    </div>
                  </div>
  
                  
                </div>
  
                {/* Content body */}
                <div style={{ backgroundColor: COLORS.white, padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <p style={{ color: COLORS.secondary, lineHeight: '1.6' }}>
                    {extract.content}
                  </p>
                </div>
              </div>
            ))}
  
          </div>
        </div>
      </div>
      
      {/* Floating menu when sidebar is closed */}
      {!sidebarVisible && (
        <ActionButtons insideSidebar={false} />
      )}
      
      {/* Share Dialog */}
      {shareDialogOpen && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          onShare={handleShareSubmit}
          conversationName={extractsCollectionName}
        />
      )}
    </div>
  );
  // Fullscreen panel content
  const fullscreenPanelContent = (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm flex flex-col">
      {showComponentArtifactGallery && (
        <FullscreenArtifactGallery
          artifacts={artifacts}
          onSelectArtifact={onSelectArtifact}
          onBack={handleFullscreenGalleryBack}
        />
      )}

      {/* Show artifact navigation if artifacts exist and not showing gallery */}
      {artifacts.length > 0 && !showComponentArtifactGallery && (
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
          {/* Sidebar for fullscreen mode */}
          {sidebarVisible && (
            <div 
              id="extracts-fullscreen-sidebar"
              className="border-r overflow-auto" 
              style={{ 
                width: '0px', 
                borderColor: '#e5e7eb', 
                backgroundColor: COLORS.white,
                transition: 'width 300ms ease-in-out' 
              }}
            >
              {/* Action buttons inside sidebar */}
              <ActionButtons insideSidebar={true} />
              
              
              {/* Extract titles */}
              <div className="pl-6 mt-2">
              {extracts.map((extract, index) => (
                  <button
                    key={extract.id}
                    onClick={() => {
                      setActiveExtract(index);
                      const element = document.getElementById(`fullscreen-extract-${index}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm flex items-center mb-2 rounded-full transition-all"
                    style={{
                      backgroundColor: activeExtract === index ? COLORS.coral : COLORS.white,
                      color: activeExtract === index ? COLORS.white : COLORS.secondary,
                      border: 'none',
                      boxShadow: activeExtract === index ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      if (activeExtract !== index) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeExtract !== index) {
                        e.currentTarget.style.backgroundColor = COLORS.white;
                      }
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{extract.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Main content for fullscreen mode */}
          <div className="flex-1 overflow-auto pl-4 " style={{ backgroundColor: COLORS.white }}>
            <div className="max-w-4xl mx-auto p-8 bg-white my-6 rounded-lg shadow-sm" ref={extractsContainerRef}>
              {extracts.map((extract, index) => (
                <div 
                  key={extract.id}
                  id={`fullscreen-extract-${index}`}
                  data-index={index}
                  ref={el => extractRefs.current[`fullscreen-${index}`] = el}
                  className="mb-12 pb-8 border-b"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  {/* Extract content */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.coral }}>
                      {extract.title}
                    </h2>
                    <div className="text-sm mb-3" style={{ color: COLORS.secondary }}>
                      <span>{extract.source}</span>
                      <span className="mx-1">•</span>
                      <span>{extract.page}</span>
                      <span className="mx-1">•</span>
                      <span>{extract.date}</span>
                    </div>
  
                    <div className="flex flex-wrap gap-1">
                      {extract.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${COLORS.coral}10`,
                            color: COLORS.coral
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content body */}
                  <div className="prose prose-lg max-w-none" style={{ color: COLORS.secondary }}>
                    <p style={{ lineHeight: '1.8' }}>
                      {extract.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating action buttons when sidebar is closed */}
        {!sidebarVisible && (
          <ActionButtons insideSidebar={false} />
        )}
        
        {/* Share Dialog */}
        {shareDialogOpen && (
          <ShareDialog
            isOpen={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            onShare={handleShareSubmit}
            conversationName={extractsCollectionName}
          />
        )}
      </div>
    </div>
  );
  
  return (
    <>
      {regularPanelContent}
      {isFullscreen && fullscreenPanelContent}
    </>
  );
};

export default ExtractsComponent;