"use client";
import { useState, useEffect, useRef, useMemo, useCallback} from "react";
import ChatSection from "./ChatSection";
import CombinedVisualizationPanel from "./CombinedVisualizationPanel";
import TableAndToolsComponent from "./TableAndToolsComponent";
import ExtractsComponent from "./ExtractsComponent";
import ReportComponent from "./ReportComponent";
import ChartsComponent from "./ChartsComponent";
import CodeComponent from "./CodeComponent";
import { GripVertical } from "lucide-react";
import ArtifactNavigation from "./ArtifactNavigation";
import ArtifactGallery from "./ArtifactGallery";
import Chart1_0 from './artifacts/1.0-chart';
import Map1_0 from './artifacts/1.0-map';
import SocioEconomicDashboard from './artifacts/1.1-chart';
import CrashTrafficMap from './artifacts/1.2-map.js';
import ClimateVulnerabilityDashboard from './artifacts/1.3-chart';
import FloodplainsMap from './artifacts/1.3-map'
import TransportAndPlansMap from './artifacts/1.2.1-map'
import TransportMap from './artifacts/1.2.2-map'
import SidewalkConditionDashboard from './artifacts/1.2.2-chart'
import EmergencyResponsivenessDashboard from './artifacts/1.1.2-chart'
import DisasterHistoryDashboard from './artifacts/1.3.1-chart1'
import LandUseZoningMap from './artifacts/1.1.1.1-map'
import EmergencyTemporalTrends from './artifacts/1.3.2-chart'
import PoliciesComponent from './artifacts/1.1.1-extracts'
import UpdatedFloodInfraIntersectionMap from './artifacts/1.3.1.1-map'
import GrantsComponent from './artifacts/1.3.1.1.1-extracts'
import ConcernAreasMap from './artifacts/1.3.2.1-map'
import BudgetStudyDashboard from './artifacts/1.3.2.1.1-chart'
import HighPriorityInfrastructureMap from './artifacts/1.1.2.1-map'
import BudgetStudyDashboard2 from './artifacts/1.1.2.1.1-chart'
import CombinedTransportPlanningMap from './artifacts/1.2.2.1-map'
import BudgetDashboard from './artifacts/1.2.1.1-chart'
import CombinedTransportPlanningFloodMap from './artifacts/1.2.2.1.1-map'
import FemaComponent from "./artifacts/1.2.2.1.1-extract";
import ConcernMap from './artifacts/1.2.1.1-map';
import FloodplainsConcernMap from './artifacts/1.2.1.2-map';
import ReportComponent1 from './artifacts/1.1.1.1.1-report';
import ReportComponent2 from './artifacts/1.2.1.2.1-report';
import ReportComponent3 from './artifacts/1.2.1.1.1-report';
import ReportComponent4 from './artifacts/1.2.2.1.1.1-report';
import ReportComponent5 from './artifacts/1.3.1.1.1.1-report';
import ReportComponent6 from './artifacts/1.3.2.1.1.1-report';
import ReportComponent7 from './artifacts/1.1.2.1.1.1-report'
import DraggableArtifactPanel from "./DraggableArtifactPanel";


export default function ResizablePanels({
  chatHistory,
  onSend,
  isLoading,
  mapContent,
  tableContent,
  activeTab,
  setActiveTab,
  onSaveMap,
  savedMaps = [],
  showVisualization = true, 
  showArtifactGallery,
  onShowArtifactGallery,
  artifacts,
  currentArtifactId,
  onSelectArtifact,
  setLayersVisibility,
  onLayersReady,
  responseReady,
  setResponseReady,
  setChartReady,
  setCustomChartReady,
  showTutorial,
  setShowTutorial,
})  {
  // References for direct DOM manipulation
  const containerRef = useRef(null);
  const chatPanelRef = useRef(null);
  const visualPanelRef = useRef(null);
  const dividerRef = useRef(null);
  const [isDashboardFullscreen, setIsDashboardFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  


  const [showCreatedPrompt, setShowCreatedPrompt] = useState(false);
const [showMobileArtifactPanel, setShowMobileArtifactPanel] = useState(false);
const [mobileArtifactComponent, setMobileArtifactComponent] = useState(null);
const [mobileArtifactTitle, setMobileArtifactTitle] = useState("");
const artifactComponentMap = useMemo(() => ({
  "1.0": {
    "map": Map1_0,
    "charts": Chart1_0,
  },
  "1.1": {
    "charts1": SocioEconomicDashboard,
  },
  "1.2": {
    "map1.2": CrashTrafficMap,
  },
  "1.3": {
    "map1.3": FloodplainsMap,
    "chart1.3": ClimateVulnerabilityDashboard,
  },
  "1.2.1": {
    "map1.2.1": TransportAndPlansMap,
  },
  "1.2.2": {
    "map1.2.2": TransportMap,
    "charts1.2.2": SidewalkConditionDashboard,
  },
  "1.1.2": {
    "charts1.1.2": EmergencyResponsivenessDashboard,
  },
  "1.3.1": {
    "charts1.3.1part1": DisasterHistoryDashboard,
  },
  "1.3.2": {
    "chart1.3.2": EmergencyTemporalTrends,
  },
  "1.1.1": {
    "extract1.1.1": PoliciesComponent,
  },
  "1.1.1.1": {
    "map1.1.1.1": LandUseZoningMap,
  },
  "1.3.1.1": {
    "map1.3.1.1": UpdatedFloodInfraIntersectionMap,
  },
  "1.3.1.1.1": {
    "extract1.3.1.1.1": GrantsComponent,
  },
  "1.3.2.1": {
    "map1.3.2.1": ConcernAreasMap,
  },
  "1.3.2.1.1": {
    "chart1.3.2.1.1": BudgetStudyDashboard,
  },
  "1.1.2.1": {
    "map1.1.2.1": HighPriorityInfrastructureMap,
  },
  "1.1.2.1.1": {
    "map1.1.2.1.1": CombinedTransportPlanningFloodMap,
    "chart1.1.2.1.1": BudgetStudyDashboard2,
  },
  "1.2.2.1": {
    "map1.2.2.1": CombinedTransportPlanningMap,
  },
  "1.2.2.1.1": {
    "map1.2.2.1.1": CombinedTransportPlanningFloodMap,
    "extract1.2.2.1.1": FemaComponent,
  },
  "1.2.1.1": {
    "map1.2.1.1": ConcernMap,
    "chart1.2.1.1": BudgetDashboard,
  },
  "1.2.1.2": {
    "map1.2.1.2": FloodplainsConcernMap,
    "extract1.2.1.2": FemaComponent,
  },
  "1.1.1.1.1": {
    "report1.1.1.1.1": ReportComponent1,
  },
  "1.2.1.2.1": {
    "report1.2.1.2.1": ReportComponent2,
  },
  "1.2.1.1.1": {
    "report1.2.1.1.1": ReportComponent3,
  },
  "1.2.2.1.1.1": {
    "report1.2.2.1.1.1": ReportComponent4,
  },
  "1.3.1.1.1.1": {
    "report1.3.1.1.1.1": ReportComponent5,
  },
  "1.3.2.1.1.1": {
    "report1.3.2.1.1.1": ReportComponent6,
  },
  "1.1.2.1.1.1": {
    "report1.1.2.1.1.1": ReportComponent7,
  },
}), []);
useEffect(() => {
  console.log("showArtifactGallery updated:", showArtifactGallery);
}, [showArtifactGallery]);
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile(); // Run on mount

  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

  // Function to open mobile artifact panel
  const openMobileArtifactPanel = useCallback((artifactId) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;
  
  // Extract button ID and artifact type from the artifact
  let buttonId = null;
  let artifactType = artifact.type;
  
  // Check if buttonId is directly stored in the artifact
  if (artifact.buttonId) {
    buttonId = artifact.buttonId;
  } else if (artifact.id) {
    const idMatch = artifact.id.match(/^(\d+\.\d+(?:\.\d+)*)/);
    if (idMatch) {
      buttonId = idMatch[1];
    } else if (artifact.title) {
      const titleMatch = artifact.title.match(/^(\d+\.\d+(?:\.\d+)*)/);
      if (titleMatch) {
        buttonId = titleMatch[1];
      } else if (artifact.title.includes("Socio-Economic")) {
        buttonId = "1.1";
      } else if (artifact.title.includes("Infrastructure Condition")) {
        buttonId = "1.0";
      }
    }
  }
  
  // If no type property, try to extract from ID
  if (!artifactType && artifact.id && artifact.id.includes('-')) {
    artifactType = artifact.id.split('-')[1];
  }
  
  // If we have a specific component for this button and artifact type, use it
  const ComponentToRender = buttonId && 
    artifactComponentMap[buttonId] && 
    artifactComponentMap[buttonId][artifactType] ? 
    artifactComponentMap[buttonId][artifactType] : null;
  
  // Set the component to render in the mobile panel
  if (ComponentToRender) {
    setMobileArtifactComponent(<ComponentToRender />);
  } else {
    // Default rendering based on artifact type
    switch (artifactType) {
      case "map":
        setMobileArtifactComponent(
          <CombinedVisualizationPanel
            mapContent={artifact.content || mapContent}
            tableContent={tableContent}
            hideHeader={true}
            onSaveMap={onSaveMap}
            savedMaps={savedMaps}
            onShowArtifactGallery={onShowArtifactGallery}
            isMobilePanel={true}
          />
        );
        break;
      case "charts":
        // Render appropriate chart component
        setMobileArtifactComponent(<div className="h-full">Charts Component</div>);
        break;
      // Add other cases as needed for your different artifact types
      default:
        setMobileArtifactComponent(
          <div className="h-full p-4 flex items-center justify-center">
            <p>Artifact content not available for mobile view</p>
          </div>
        );
    }
  }
  
  // Set the title for the draggable panel
  setMobileArtifactTitle(artifact.title || "Artifact");
  
  // Show the panel
  setShowMobileArtifactPanel(true);
}, [artifacts, artifactComponentMap, mapContent, onSaveMap, onShowArtifactGallery, savedMaps, tableContent]);
useEffect(() => {
  window.openMobileArtifactPanel = openMobileArtifactPanel;
  return () => {
    delete window.openMobileArtifactPanel;
  };
}, [openMobileArtifactPanel]);


const handleDashboardFullscreenChange = (isFullscreen) => {
  setIsDashboardFullscreen(isFullscreen);
};
const closeMobileArtifactPanel = () => {
  setShowMobileArtifactPanel(false);
  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent("artifact-panel-close"));
};

const handleSelectArtifactDisplay = (artifactId) => {
  const artifact = artifacts.find(a => a.id === artifactId);
  if (!artifact) return;
  
  // Set current artifact ID
  onSelectArtifact(artifactId);
  
  if (isMobile) {
    // For mobile, always use split view and NEVER open the panel
    setActiveTab("chat"); // This triggers split view
    openMobileArtifactPanel(artifactId);
  } else {
    // Desktop behavior - use the passed prop function instead of direct state setter
    onShowArtifactGallery(false);
    setActiveTab(artifact.type);
  }
};


// Add near the top of your useEffect hooks in ResizablePanels
useEffect(() => {
  // Make openMobileArtifactPanel available globally
  window.openMobileArtifactPanel = openMobileArtifactPanel;
  
  return () => {
    // Clean up
    delete window.openMobileArtifactPanel;
  };
}, [openMobileArtifactPanel]);
  useEffect(() => {
    const handler = () => {
      setShowCreatedPrompt(true);
      setShowPreviousPrompt(true);
      const timer = setTimeout(() => {
        setShowCreatedPrompt(false);
        setShowPreviousPrompt(false);
      }, 3000);
      return () => clearTimeout(timer);
    };
  
    window.addEventListener('show-two-artifact-prompt', handler);
    return () => {
      window.removeEventListener('show-two-artifact-prompt', handler);
    };
  }, []);
// Single comprehensive useEffect for mobile-specific styling


useEffect(() => {
  if (isMobile) {
    // Force immediate styles for mobile
    const applyMobileStyles = () => {
      if (chatPanelRef.current) {
        if (activeTab === "chat") {
          chatPanelRef.current.style.cssText = "width: 100vw !important; max-width: 100vw !important; display: block !important;";
        } else {
          chatPanelRef.current.style.cssText = "width: 0 !important; display: none !important;";
        }
      }
      
      if (visualPanelRef.current) {
        if (activeTab !== "chat") {
          visualPanelRef.current.style.cssText = "width: 100vw !important; max-width: 100vw !important; display: block !important;";
        } else {
          visualPanelRef.current.style.cssText = "width: 0 !important; display: none !important;";
        }
      }
    };
    
    // Apply immediately
    applyMobileStyles();
    
    // Apply again after a delay to ensure it takes effect
    setTimeout(applyMobileStyles, 100);
    
    // Also apply whenever active tab changes
    const handleTabChange = () => {
      applyMobileStyles();
    };
    
    window.addEventListener("tab-change", handleTabChange);
    return () => window.removeEventListener("tab-change", handleTabChange);
  } else {
    // Desktop behavior - handle split panel
    const container = containerRef.current;
    if (container && chatPanelRef.current && visualPanelRef.current && showVisualization) {
      const containerWidth = container.clientWidth;
      const visualWidth = containerWidth * 0.4;
      const dividerWidth = dividerRef.current ? dividerRef.current.clientWidth : 0;
      const chatWidth = containerWidth - visualWidth - dividerWidth;
      
      chatPanelRef.current.style.width = `${chatWidth}px`;
      visualPanelRef.current.style.width = `${visualWidth}px`;
      
      // Update stored widths for transitions
      widthsRef.current = {
        chat: `${chatWidth}px`,
        visual: `${visualWidth}px`
      };
    } else if (!showVisualization && chatPanelRef.current) {
      chatPanelRef.current.style.width = '100%';
    }
  }
}, [isMobile, activeTab, showVisualization]);

useEffect(() => {
  if (!isMobile || !chatPanelRef.current) return;

  const chatPanel = chatPanelRef.current;

  if (activeTab === "chat") {
    // Fully reset and enforce correct layout styles
    chatPanel.style.display = "block";
    chatPanel.style.width = "100vw";
    chatPanel.style.maxWidth = "100vw";
    chatPanel.style.minHeight = "100%";
    chatPanel.style.margin = "0"; // Reset any stray margins
    chatPanel.style.paddingTop = "0"; // Adjust if top margin is large
    chatPanel.style.paddingBottom = "70px"; // Accommodate for prompt buttons
    chatPanel.scrollTop = 0; // Reset scroll position
  } else {
    // Hide the chat panel cleanly
    chatPanel.style.display = "none";
    chatPanel.style.width = "0";
  }
}, [activeTab, isMobile]);


  useEffect(() => {
    const container = containerRef.current;
    const divider = dividerRef.current;
  
    if (!container || !divider) return;
  
    // Skip this setup for mobile
    if (isMobile) return;
  
    // Initial setup - visual panel takes 40% of the container width on desktop
    const setInitialWidths = () => {
      const containerWidth = container.clientWidth;
  
      // If visualization is hidden, chat takes full width
      if (!showVisualization) {
        if (chatPanelRef.current) {
          chatPanelRef.current.style.width = '100%';
        }
        return;
      }
  
      const visualWidth = containerWidth * 0.4;
      const chatWidth = containerWidth - visualWidth - divider.clientWidth;
  
      if (chatPanelRef.current && visualPanelRef.current) {
        chatPanelRef.current.style.width = `${chatWidth}px`;
        visualPanelRef.current.style.width = `${visualWidth}px`;
  
        // Store these values for transitions
        widthsRef.current = {
          chat: `${chatWidth}px`,
          visual: `${visualWidth}px`
        };
      }
    };
  
    // Set initial widths when component mounts
    setInitialWidths();
  
    // Handle window resize
    window.addEventListener('resize', setInitialWidths);
  
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', setInitialWidths);
    };
  }, [showVisualization, isMobile]);
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile(); // Run on mount

  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

  
  // Track initial position and whether dragging
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startWidths: {
      container: 0,
      chat: 0,
      visual: 0
    }
  });
  const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);

  useEffect(() => {
    if (artifacts.length === 2) {
      setShowPreviousPrompt(true);
  
      const timer = setTimeout(() => {
        setShowPreviousPrompt(false);
      }, 3000); // Prompt disappears after 3 seconds
  
      return () => clearTimeout(timer);
    }
  }, [artifacts]);
  
  

  // Add a state to track whether visualization is in transition
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Previously calculated widths to use during transitions
  const widthsRef = useRef({
    chat: '60%',
    visual: '40%'
  });

  useEffect(() => {
    if (visualPanelRef.current && chatPanelRef.current) {
      setIsTransitioning(true);
  
      // Store the previous widths before transition starts
      if (chatPanelRef.current.style.width) {
        widthsRef.current.chat = chatPanelRef.current.style.width;
      }
      if (visualPanelRef.current.style.width) {
        widthsRef.current.visual = visualPanelRef.current.style.width;
      }
  
      // Copy the current visualPanel element to ensure it doesn't change during cleanup
      const visualPanelCurrent = visualPanelRef.current;
  
      const transitionEndHandler = () => {
        setIsTransitioning(false);
      };
  
      visualPanelCurrent.addEventListener('transitionend', transitionEndHandler);
  
      return () => {
        visualPanelCurrent.removeEventListener('transitionend', transitionEndHandler);
      };
    }
  }, [showVisualization]);
  

  useEffect(() => {
    const container = containerRef.current;
    const divider = dividerRef.current;

    if (!container || !divider) return;

    // Initial setup - visual panel takes 40% of the container width
    const setInitialWidths = () => {
      const containerWidth = container.clientWidth;

      // If visualization is hidden, chat takes full width
      if (!showVisualization) {
        if (chatPanelRef.current) {
          chatPanelRef.current.style.width = '100%';
        }
        return;
      }

      const visualWidth = containerWidth * 0.4;
      const chatWidth = containerWidth - visualWidth - divider.clientWidth;

      if (chatPanelRef.current && visualPanelRef.current) {
        chatPanelRef.current.style.width = `${chatWidth}px`;
        visualPanelRef.current.style.width = `${visualWidth}px`;

        // Store these values for transitions
        widthsRef.current = {
          chat: `${chatWidth}px`,
          visual: `${visualWidth}px`
        };
      }
    };

    // Set initial widths when component mounts
    setInitialWidths();

    // Handle window resize
    window.addEventListener('resize', setInitialWidths);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', setInitialWidths);
    };
  }, [showVisualization]);


  // In ResizablePanels.js, modify the useEffect for mobile-specific styling

useEffect(() => {
  if (isMobile) {
    // Create a robust function that forces correct styles
    const forceCorrectMobileStyles = () => {
      if (chatPanelRef.current) {
        if (activeTab === "chat") {
          // Apply multiple critical properties and use !important
          chatPanelRef.current.style.cssText = "width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important; display: block !important; visibility: visible !important; opacity: 1 !important;";
          
          // Force a reflow to make sure styles are applied
          void chatPanelRef.current.offsetHeight;
        } else {
          chatPanelRef.current.style.cssText = "width: 0 !important; display: none !important;";
        }
      }
      
      if (visualPanelRef.current) {
        if (activeTab !== "chat") {
          visualPanelRef.current.style.cssText = "width: 100vw !important; max-width: 100vw !important; display: block !important;";
        } else {
          visualPanelRef.current.style.cssText = "width: 0 !important; display: none !important;";
        }
      }
    };
    
    // Apply the styles immediately
    forceCorrectMobileStyles();
    
    // Also apply after a small delay to catch any missed updates
    setTimeout(forceCorrectMobileStyles, 50);
    
    // Create a more robust tab change handler
    const handleTabChange = () => {
      forceCorrectMobileStyles();
      // Apply again after a delay to catch any animation issues
      setTimeout(forceCorrectMobileStyles, 50);
    };
    
    // Listen for tab changes
    window.addEventListener("tab-change", handleTabChange);
    
    // Also listen for artifact panel close event which might affect layout
    const handleArtifactPanelClose = () => {
      if (activeTab === "chat") {
        setTimeout(forceCorrectMobileStyles, 50);
      }
    };
    
    window.addEventListener("artifact-panel-close", handleArtifactPanelClose);
    
    return () => {
      window.removeEventListener("tab-change", handleTabChange);
      window.removeEventListener("artifact-panel-close", handleArtifactPanelClose);
    };
  }
}, [isMobile, activeTab]);

  const handleMouseDown = (e) => {
    if (window.innerWidth < 768) return;
  
    e.preventDefault();
    const container = containerRef.current;
    const chatPanel = chatPanelRef.current;
    const visualPanel = visualPanelRef.current;
  
    if (!container || !chatPanel || !visualPanel) return;
  
    // Disable transitions during drag
    chatPanel.style.transition = 'none';
    visualPanel.style.transition = 'none';
  
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startWidths: {
        container: container.clientWidth,
        chat: chatPanel.clientWidth,
        visual: visualPanel.clientWidth,
      }
    };
  
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseUp = () => {
    dragState.current.isDragging = false;
    
    // Add map resize call here
    if (window.resizeActiveMap) window.resizeActiveMap();
    
    // Existing code remains unchanged
    const chatPanel = chatPanelRef.current;
    const visualPanel = visualPanelRef.current;
    if (chatPanel) chatPanel.style.transition = '';
    if (visualPanel) visualPanel.style.transition = '';
    
    document.body.classList.remove('resizing');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  useEffect(() => {
    if (visualPanelRef.current && chatPanelRef.current) {
      setIsTransitioning(true);
    
      // Store the previous widths before transition starts
      if (chatPanelRef.current.style.width) {
        widthsRef.current.chat = chatPanelRef.current.style.width;
      }
      if (visualPanelRef.current.style.width) {
        widthsRef.current.visual = visualPanelRef.current.style.width;
      }
    
      const visualPanelCurrent = visualPanelRef.current;
    
      const transitionEndHandler = () => {
        setIsTransitioning(false);
        
        // Add this: resize map after transition completes
        if (window.resizeActiveMap) window.resizeActiveMap();
      };
    
      visualPanelCurrent.addEventListener('transitionend', transitionEndHandler);
    
      return () => {
        visualPanelCurrent.removeEventListener('transitionend', transitionEndHandler);
      };
    }
  }, [showVisualization]);  
  
  

  // Handle mouse movement
  const handleMouseMove = (e) => {
    if (!dragState.current.isDragging) return;

    const chatPanel = chatPanelRef.current;
    const visualPanel = visualPanelRef.current;
    const container = containerRef.current;

    if (!container || !chatPanel || !visualPanel) return;

    // Calculate how far mouse has moved
    const deltaX = e.clientX - dragState.current.startX;

    // Apply constraints
    const containerWidth = container.clientWidth;
    const minChatWidth = containerWidth * 0.3;
    const maxChatWidth = containerWidth * 0.7;

    // Calculate new widths
    let newChatWidth = dragState.current.startWidths.chat + deltaX;

    // Apply constraints
    if (newChatWidth < minChatWidth) {
      newChatWidth = minChatWidth;
    } else if (newChatWidth > maxChatWidth) {
      newChatWidth = maxChatWidth;
    }

    const dividerWidth = dividerRef.current ? dividerRef.current.clientWidth : 5;
    const newVisualWidth = containerWidth - newChatWidth - dividerWidth;

    // Update panel widths
    chatPanel.style.width = `${newChatWidth}px`;
    visualPanel.style.width = `${newVisualWidth}px`;

    // Store these values for transitions
    widthsRef.current = {
      chat: `${newChatWidth}px`,
      visual: `${newVisualWidth}px`
    };
  };


  const renderVisualComponent = () => {
    // Gallery view takes precedence
    if (showArtifactGallery) {
      return (
        <div className="h-full flex flex-col">
          <ArtifactGallery 
            artifacts={artifacts}
            onSelectArtifact={onSelectArtifact}
            onBack={() => onShowArtifactGallery(false)}
            showCreatedPrompt={artifacts.length === 2}
            isMobile={isMobile}
          />
        </div>
      );
    }
  
    // Get the current artifact
    const currentArtifact = artifacts.find(a => a.id === currentArtifactId);
    
    // Create the navigation bar element to reduce repetition
    const navigationBar = artifacts.length > 0 ? (
      <ArtifactNavigation 
        artifacts={artifacts}
        currentArtifactId={currentArtifactId}
        onSelectArtifact={onSelectArtifact}
        onShowGallery={() => {
          setShowCreatedPrompt(false); 
          onShowArtifactGallery(true);
        }}
        showPreviousPrompt={showPreviousPrompt}
        showCreatedPrompt={showCreatedPrompt}
        isMobile={isMobile}
      />
    ) : null;
  
    // If no artifact is selected, show default view based on activeTab
    if (!currentArtifact) {
      return (
        <>
          {navigationBar}
          <CombinedVisualizationPanel
            mapContent={mapContent}
            tableContent={tableContent}
            hideHeader={false}
            onSaveMap={onSaveMap}
            savedMaps={savedMaps}
            onShowArtifactGallery={onShowArtifactGallery}
          />
        </>
      );
    }
  
    // Extract button ID and artifact type from the artifact
    let buttonId = null;
    
    // Check if buttonId is directly stored in the artifact (from updated saveArtifact function)
    if (currentArtifact.buttonId) {
      buttonId = currentArtifact.buttonId;
    } 
    // Extract from ID (format: "1.0-charts-timestamp")
    else if (currentArtifact.id) {
      const idMatch = currentArtifact.id.match(/^(\d+\.\d+(?:\.\d+)*)/);
      if (idMatch) {
        buttonId = idMatch[1];
      }
      // If not in ID, try extracting from title
      else if (currentArtifact.title) {
        const titleMatch = currentArtifact.title.match(/^(\d+\.\d+(?:\.\d+)*)/);
        if (titleMatch) {
          buttonId = titleMatch[1];
        }
        // Use specific title patterns as fallback
        else if (currentArtifact.title.includes("Socio-Economic")) {
          buttonId = "1.1";
        } else if (currentArtifact.title.includes("Infrastructure Condition")) {
          buttonId = "1.0";
        }
        // Add more pattern matching as needed
      }
    }
    
    // Get the artifact type
    let artifactType = currentArtifact.type; // Use the type property if available
    
    // If no type property, try to extract from ID
    if (!artifactType && currentArtifact.id && currentArtifact.id.includes('-')) {
      artifactType = currentArtifact.id.split('-')[1];
    }
    
    // If still no type, use the activeTab
    if (!artifactType) {
      artifactType = activeTab;
    }
    
    
    // If we have a specific component for this button and artifact type, use it
    if (buttonId && 
      artifactComponentMap[buttonId] && 
      artifactComponentMap[buttonId][artifactType]) {
    const SpecificComponent = artifactComponentMap[buttonId][artifactType];
    if (buttonId === "1.0" || buttonId === "1.1" || buttonId === "1.1.1.1" || buttonId === "1.1.2" || buttonId === "1.1.2.1" || buttonId === "1.1.2.1.1" || buttonId === "1.2" ||  buttonId === "1.2.1"
      || buttonId === "1.2.1.1" || buttonId === "1.2.1.1" || buttonId === "1.2.2" || buttonId === "1.2.2.1" || buttonId === "1.2.2.1.1" || buttonId === "1.3" || buttonId === "1.3.1" || buttonId === "1.3.1.1" 
      || buttonId === "1.3.2" || buttonId === "1.3.2.1" || buttonId === "1.3.2.1.1"
    ) {
      return (
        <>
          {navigationBar}
          <SpecificComponent 
  onFullscreenChange={handleDashboardFullscreenChange}
  onLayersReady={onLayersReady}
  isFullscreen={isDashboardFullscreen}
/>
        </>
      );
    }
  
    const isInfraMap = buttonId === "1.1.2.1" && artifactType === "map1.1.2.1";
  
    return (
      <>
        {navigationBar}
        <SpecificComponent
          {...(isInfraMap ? {
            onLayersReady: () => {
              setResponseReady(true);
              window.setResponseReady = setResponseReady;
            }
          } : {})}
        />
      </>
    );
  }  
    
    // Otherwise, render based on artifact type
    switch (artifactType) {
      case "map":
        return (
          <>
            {navigationBar}
            <CombinedVisualizationPanel
              mapContent={currentArtifact.content || mapContent}
              tableContent={tableContent}
              hideHeader={false}
              onSaveMap={onSaveMap}
              savedMaps={savedMaps}
              onShowArtifactGallery={onShowArtifactGallery}
            />
          </>
        );
        
      case "charts":
        return (
          <>
            {navigationBar}
            <ChartsComponent />
          </>
        );
        
      case "tabletools":
        return (
          <>
            {navigationBar}
            <TableAndToolsComponent />
          </>
        );
        
      case "extracts":
        return (
          <>
            {navigationBar}
            <ExtractsComponent />
          </>
        );
        
      case "report":
        return (
          <>
            {navigationBar}
            <ReportComponent />
          </>
        );
        
      case "code":
        return (
          <>
            {navigationBar}
            <CodeComponent />
          </>
        );
        
      default:
        // Default fallback
        return (
          <>
            {navigationBar}
            <CombinedVisualizationPanel
              mapContent={mapContent}
              tableContent={tableContent}
              hideHeader={false}
              onSaveMap={onSaveMap}
              savedMaps={savedMaps}
              onShowArtifactGallery={onShowArtifactGallery}
            />
          </>
        );
    }
  };


const getChatPanelStyle = () => {
  if (isMobile) {
    return { 
      width: activeTab === "chat" ? "100%" : "0",
      display: activeTab === "chat" ? "block" : "none",
      height: "100%",
    };
  }
    
    // For desktop, respect the showVisualization toggle
    if (isTransitioning) {
      return {
        width: showVisualization ? widthsRef.current.chat : "100%",
        transition: "width 0.3s ease-in-out"
      };
    }
    
    return {
      width: showVisualization ? widthsRef.current.chat : "100%"
    };
  };
  const getVisualPanelStyle = () => {
    if (isMobile) {
      return {
        width: activeTab !== "chat" ? "100%" : "0",
        display: activeTab !== "chat" ? "block" : "none",
        height: "100%",
      };
    }
  
    return {
      width: widthsRef.current.visual,  // ← use this
      transition: "width 0.3s ease-in-out, opacity 0.3s ease-in-out",
      opacity: showVisualization ? 1 : 0,
    };
  };
  

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col md:flex-row overflow-hidden relative ${chatHistory.length > 0 ? 'border border-secondary/25 rounded-lg' : ''}`}
      >
        
{showVisualization && (
<div className="md:hidden sticky top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex shadow-sm h-10">
    <button
      onClick={() => {
        setActiveTab("chat");
        if (showMobileArtifactPanel) {
          setShowMobileArtifactPanel(false);
        }
      }}
      className={`flex-1 h-full px-4 text-sm font-medium ${
        activeTab === "chat" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-500"
      }`}
    >
      Chat
    </button>
    <button
      onClick={() => {
        onShowArtifactGallery(true);
        setActiveTab("map");
      }}
      className={`flex-1 h-full px-4 text-sm font-medium ${
        activeTab === "map" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-500"
      }`}
    >
      Artifacts
    </button>
  </div>
)}
      <div
  
>
<div
  ref={chatPanelRef}
  style={getChatPanelStyle()}
  className="h-full"
  data-panel="chat"
>
  <
    ChatSection
    chatHistory={chatHistory}
    onSend={onSend}
    isLoading={isLoading}
    setLayersVisibility={setLayersVisibility}
    setResponseReady={setResponseReady}
    setChartReady={setChartReady}
    setCustomChartReady={setCustomChartReady}
    responseReady={responseReady}
    onLayersReady={onLayersReady}
    showTutorial={showTutorial}
  setShowTutorial={setShowTutorial}
    setActiveTab={isMobile ? 
      // For mobile, don't switch tabs - just open the panel over the chat
      (tab) => {
        if (tab === "map" && currentArtifactId) {
          openMobileArtifactPanel(currentArtifactId);
          // Don't change activeTab - stay on chat
        } else {
          setActiveTab(tab);
        }
      } : 
      // Normal tab switching for desktop
      setActiveTab
    }
    artifacts={artifacts}
    onSelectArtifact={handleSelectArtifactDisplay}
    activeTab={activeTab}
    onShowArtifactGallery={onShowArtifactGallery}
  />
  </div>
</div>

      {/* Drag Handle */}
      {showVisualization && (
        <div
          ref={dividerRef}
          className="hidden md:flex w-1 h-full cursor-col-resize relative z-10 flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-1 w-1 text-gray-400" />
        </div>
      )}

      {/* Visualization Panel */}
      <div
  ref={visualPanelRef}
  className="h-full w-full flex flex-col border-l border-secondary/25"
  style={{ 
    ...getVisualPanelStyle(), 
    padding: 0, 
    margin: 0,
    visibility: isDashboardFullscreen ? 'hidden' : 'visible' 
  }}
>
  {renderVisualComponent()}
</div>
{isDashboardFullscreen && (
      <div className="absolute inset-0 z-[100] bg-white">
        {/* Get the current artifact to pass to the fullscreen view */}
        {(() => {
          const currentArtifact = artifacts.find(a => a.id === currentArtifactId);
          if (!currentArtifact) return null;
          
          let buttonId = currentArtifact.buttonId;
if (!buttonId && currentArtifact.id) {
  const idMatch = currentArtifact.id.match(/^(\d+\.\d+(?:\.\d+)*)/);
  if (idMatch) buttonId = idMatch[1];
}

let artifactType = currentArtifact.type;
if (!artifactType && currentArtifact.id && currentArtifact.id.includes('-')) {
  artifactType = currentArtifact.id.split('-')[1];
}

          
          if (artifactComponentMap[buttonId] && artifactComponentMap[buttonId][artifactType]) {
            const FullscreenComponent = artifactComponentMap[buttonId][artifactType];
            return (
              <FullscreenComponent 
  isFullscreen={isDashboardFullscreen}
  onFullscreenChange={handleDashboardFullscreenChange}
  onLayersReady={onLayersReady}
/>
            );
          }
          return null;
        })()}
      </div>
    )}

      {/* Add custom CSS for cursor styles */}
      <style jsx global>{`
        .resizing {
          cursor: col-resize !important;
          user-select: none !important;
        }
      `}</style>
      
      {isMobile && activeTab === "map" && showArtifactGallery && (
  <div 
    className="fixed inset-0 pt-12 pb-0 z-20 bg-white"
    style={{
      left: 0,
      right: 0,
      top: 78,
      bottom: 0,
      width: '100%',
      overflow: 'auto'
    }}
  >
    <div 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 8px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <ArtifactGallery 
          artifacts={artifacts}
          onSelectArtifact={handleSelectArtifactDisplay}
          onBack={() => {
            setActiveTab("chat");
            onShowArtifactGallery(false);
          }}
          showCreatedPrompt={artifacts.length === 2}
          isMobile={true}
        />
      </div>
    </div>
  </div>
)}
{isMobile && (
  <DraggableArtifactPanel
  isOpen={showMobileArtifactPanel}
  onClose={closeMobileArtifactPanel}
  title={mobileArtifactTitle}
>
  {mobileArtifactComponent}
</DraggableArtifactPanel>
)}
    </div>
  );
}