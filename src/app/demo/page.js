
"use client";

import { useState, useEffect, Suspense } from "react";
import ResizablePanels from "../../components/ResizablePanels";
import ArtifactService from "@/app/services/ArtifactService";
import TutorialOverlay from "../../components/TutorialOverlay"
import SearchParamsWrapper from "../../components/SearchParamsWrapper";

export default function ChatPage() {
  
  // Core state
  const [chatHistory, setChatHistory] = useState([]);
  const [mapContent, setMapContent] = useState("");
  const [tableContent, setTableContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(Date.now());
  const [savedMaps, setSavedMaps] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
const [currentArtifactId, setCurrentArtifactId] = useState(null);
const [showArtifactGallery, setShowArtifactGallery] = useState(false);
const [responseReady, setResponseReady] = useState(false);
const [chartReady, setChartReady] = useState(false);
const [customChartReady, setCustomChartReady] = useState(false);
const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);
const [showTutorial, setShowTutorial] = useState(false);

const [layersVisibility, setLayersVisibility] = useState({
  map: false,
  neighborhoods: false,
  buildings: false,
  streets: false,
  crashes: false
});
const handleLayersReady = () => {
  setResponseReady(true); 
};

const roadwayTable = `
<table>
  <thead>
    <tr>
      <th>Begin (MP)</th>
      <th>End (MP)</th>
      <th>Width (ft)</th>
      <th>Surface Type</th>
      <th>PASER Rating</th>
      <th>Condition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0.0</td>
      <td>0.5</td>
      <td>30.5</td>
      <td>Paved</td>
      <td>3</td>
      <td>Poor</td>
    </tr>
    <tr>
      <td>0.5</td>
      <td>1.0</td>
      <td>24.5</td>
      <td>Paved</td>
      <td>4</td>
      <td>Fair</td>
    </tr>
    <tr>
      <td>1.0</td>
      <td>1.5</td>
      <td>22.0</td>
      <td>Paved</td>
      <td>5</td>
      <td>Fair</td>
    </tr>
    <tr>
      <td>1.5</td>
      <td>2.0</td>
      <td>25.5</td>
      <td>Paved</td>
      <td>6</td>
      <td>Good</td>
    </tr>
  </tbody>
</table>
`;

const bridgesTable = `
<table>
  <thead>
    <tr>
      <th>Structure No.</th>
      <th>Location (MP)</th>
      <th>Feature Crossed</th>
      <th>Year Built</th>
      <th>Width (ft)</th>
      <th>Length (ft)</th>
      <th>Condition</th>
      <th>Rating</th>
      <th>Design Load</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>3808</td>
      <td>0.3</td>
      <td>Flathead Creek</td>
      <td>1955</td>
      <td>24.2</td>
      <td>52</td>
      <td>Fair</td>
      <td>90.6</td>
      <td>HS15</td>
    </tr>
    <tr>
      <td>4221</td>
      <td>1.2</td>
      <td>Cedar River</td>
      <td>1978</td>
      <td>32.0</td>
      <td>120</td>
      <td>Good</td>
      <td>95.2</td>
      <td>HS20</td>
    </tr>
    <tr>
      <td>5103</td>
      <td>1.9</td>
      <td>Railroad Crossing</td>
      <td>1995</td>
      <td>28.5</td>
      <td>85</td>
      <td>Very Good</td>
      <td>98.3</td>
      <td>HS25</td>
    </tr>
  </tbody>
</table>
`;
const handleSourceChange = (source) => {
  if (source === 'homepage') {
    setIsFlowActive(false);
    setShowLoginTile(false);
    setFlowState("initial");
    console.log("States reset due to homepage navigation (desktop)");
  }
};

// Create hardcodedTables array at component level
const hardcodedTables = [roadwayTable, bridgesTable];

// Add this near the top of your ChatPage component
const buttonResponses = {
  "1.0": {
    response: "I've analyzed downtown Austin's infrastructure resilience and identified several critical vulnerability hotspots. As shown on the map, building conditions in the southeast quadrant and street segments along West MLK Boulevard fall below acceptable thresholds. Utility metrics also flag concerns with storm drainage near Waller Creek and three aging bridges approaching end-of-life. Would you like to explore socio-economic impacts next?",
    artifactType: ["map", "charts"],
    artifactTitle: "Infrastructure Condition",
    mapContent: "<div>Map for 1.0...</div>"
  },
  "1.1": {
    response: "I've overlaid socio-economic data onto our resilience analysis. The chart reveals that neighborhoods with lower income and education levels—like East Downtown—face infrastructure vulnerability scores 15–20% higher than the city average. From 2021 to 2022, Austin saw a $10,000 increase in median income and a 1.17% rise in population density.",
    artifactType: "charts1",
    artifactTitle: "Socio-Economic Analysis"
  },
  "1.2": {
    response: "I've integrated traffic volume and crash data with the infrastructure analysis. The heatmap highlights that high-crash intersections—such as East 12th/I-35 and Lavaca/West 9th Street directly align with deteriorating road conditions. These intersections also show 25–30% higher peak congestion.",
    artifactType: "map1.2",
    artifactTitle: "Traffic & Crashes",
    mapContent: "<div>Map for 1.2...</div>"
  },
  "1.3": {
    response: "I've incorporated environmental factors into the resilience assessment. The Shoal Creek floodplain overlaps with already vulnerable infrastructure in northwest Austin, while heat island zones—especially near the Convention Center—register up to 8°F higher than surrounding areas, accelerating infrastructure wear.",
    artifactType: ["map1.3","chart1.3"],
    artifactTitle: "Environmental Risk Factors",
    mapContent: "<div>Map for 1.3...</div>"
  },
  "1.1.1": {
    response: "I've identified key policies that influence both resilience and socio-economic conditions in downtown Austin. The Downtown Austin Plan and Imagine Austin initiatives include equity-driven infrastructure improvements. For instance, Section 4.3 mandates investment in historically underserved areas.",
    artifactType: "extract1.1.1",
    artifactTitle: "Policy: Resilience & Socio-economic"
  },
  "1.1.2": {
    response: "My emergency response analysis reveals gaps between service capacity and community needs—particularly in high-stress areas. For example, response times in low-income neighborhoods exceed city targets by 2–3 minutes, with 35% higher call volume but fewer resources.",
    artifactType: "charts1.1.2",
    artifactTitle: "Emergency Responsiveness"
  },
  "1.2.1": {
    response: "There are currently five major traffic projects underway downtown. The North Lamar Boulevard project is 65% done, while improvements along Cesar Chavez have just started. I've also noted recently completed projects like the 3rd Street reconstruction.",
    artifactType: "map1.2.1", 
    artifactTitle: "Ongoing Traffic Projects"
  },
  "1.2.2": {
    response: "Beyond ongoing work, our analysis reveals resilience gaps in transit infrastructure. The downtown cycling network and sidewalks in the Warehouse District score below 60% in quality—making them vulnerable during high-traffic events. Strengthening these corridors could improve emergency redundancy.",
    artifactType: ["map1.2.2", "charts1.2.2"],
    artifactTitle: "Transportation Resilience Factors"
  },
  "1.3.1": {
    response: "I've overlaid historical disaster data, focusing on floods that account for 65% of Austin’s disaster history. The 2015 Memorial Day and 2018 Shoal Creek floods significantly impacted areas that remain vulnerable today. Improvements like the Waterloo Greenway helped, but the west side still shows high risk.",
    artifactType: "charts1.3.1part1",
    artifactTitle: "Historical Disaster Analysis"
  },
  "1.3.2": {
    response: "Analyzing emergency response through an environmental lens shows clear strain. During the 2018 floods, response times rose 7–12 minutes in flood zones, and resident satisfaction fell by 45%. Call volumes spiked while services lagged, particularly around Shoal Creek and southeast downtown.",
    artifactType: "chart1.3.2",
    artifactTitle: "Emergency Response in High-Risk Zones"
  },
  "1.1.1.1": {
    response: "I've examined how zoning and land use patterns impact infrastructure resilience in downtown Austin. Areas zoned for dense commercial development with minimal green space—especially CBD zones—show worse infrastructure scores. In contrast, mixed-use zones with green space requirements outperform by 15–20%.",
    artifactType: "map1.1.1.1",
    artifactTitle: "Zoning & Land Use"
  },
  "1.1.1.1.1": {
    response: "From our zoning and land use analysis, clear trends emerge: areas with high density (FAR > 8:1) and low pervious cover face 30% more frequent infrastructure failures. The most resilient neighborhoods balance moderate density with green infrastructure and mixed land use. These patterns are summarized in this report.",
    artifactType: "report1.1.1.1.1",
    artifactTitle: "Zoning Resilience Report"
  },
  "1.3.1.1": {
    response: "After integrating disaster history and current vulnerabilities, stormwater systems along Shoal Creek and the Public Library in southeast downtown emerge as critical priorities. These assets are both exposed to environmental hazards and in poor condition.",
    artifactType: "map1.3.1.1",
    artifactTitle: "Priority Areas"
  },
  "1.3.1.1.1": {
    response: "Yes, several of the identified priority areas qualify for FEMA funding. The Shoal Creek corridor and the Public Library in southeast downtown meet the criteria under the BRIC and Pre-Disaster Mitigation programs. Potential funding could reach $10 million. I've highlighted these eligible zones on the map.",
    artifactType: "extract1.3.1.1.1",
    artifactTitle: "FEMA Funding Eligibility"
  },
  "1.3.2.1": {
    response: "Our analysis finds no critical emergency facilities in need of attention. The map shows buildings and streets located in multi-hazard zones and serve high-vulnerability populations. These elements also suffer from aging infrastructure.",
    artifactType: "map1.3.2.1",
    artifactTitle: "Priority Areas"
  },
  "1.3.2.1.1": {
    response: "With a constrained budget, the northwestern downtown quadrant emerges as an ideal candidate for a focused pilot study. It balances high vulnerability with financial feasibility. This initial assessment can guide funding applications for future resilience investments.",
    artifactType: "chart1.3.2.1.1",
    artifactTitle: "Budget & Study Area Analysis"
  },
  "1.1.2.1": {
    response: "Our analysis finds no critical emergency facilities in need of attention. The map shows buildings and streets located in multi-hazard zones and serve high-vulnerability populations. These elements also suffer from aging infrastructure.",
    artifactType: "map1.1.2.1",
    artifactTitle: "Priority Infrastructure"
  },
  "1.1.2.1.1": {
    response: "Two areas stand out for initiating a study within the current budget: the downtown street network and building systems. The estimated cost is around $95,000—well within limits. A broader study would require $130,000.",
    artifactType: "chart1.1.2.1.1",
    artifactTitle: "Priority Areas within budget"
  },
  "1.2.2.1": {
    response: "Several transportation projects are already in progress. Notably, the West MLK Boulevard initiative is 65% done, and transit priority lanes on Guadalupe are underway. Recent completions like the 3rd Street upgrades offer valuable lessons.",
    artifactType: "map1.2.2.1",
    artifactTitle: "Projects"
  },
  "1.2.2.1.1": {
    response: "I've highlighted zones with strong external funding potential—particularly those overlapping with floodplains. FEMA’s BRIC grants are a great fit here. The eastern downtown corridor stands out due to high risk and concentrated infrastructure.",
    artifactType: ["map1.2.2.1.1","extract1.2.2.1.1"],
    artifactTitle: "External Funding Opportunities"
  },
  "1.2.1.1": {
    response: "Based on the budget, two study zones stand out: the Shoal Creek corridor ($120K est.) and the southeastern electrical grid ($85K est.). Each is high-risk and feasible this year. The map and chart detail these options.",
    artifactType: ["map1.2.1.1","chart1.2.1.1"],
    artifactTitle: "Potential Study Areas within Budget"
  },
  "1.2.1.2": {
    response: "These zones are strong candidates for external agency funding—especially where infrastructure intersects floodplains. The Shoal Creek corridor and the Public Library in southeast downtown align well with FEMA’s funding criteria.",
    artifactType: ["map1.2.1.2","extract1.2.1.2"],
    artifactTitle: "External Funding Priorities"
  },
  "S3": {
    response: "Here is your comprehensive report summarizing the zoning patterns and their impact on resilience.",
    artifactType: "report",
    artifactTitle: "Comprehensive Zoning Impact Report"
  },
  "1.2.1.1.1": {
    response: "Here's the report detailing our downtown study area selection and supporting budget logic. It outlines priorities, vulnerability metrics, and cost projections.",
    artifactType: "report1.2.1.1.1",
    artifactTitle: "Downtown Study Areas Report"
  },
  "1.3.2.1.1.1": {
    response: "Here's your environmental resilience report. It compiles high-risk zones, emergency gaps, and budget-fit study recommendations.",
    artifactType: "report1.3.2.1.1.1",
    artifactTitle: "Environmental Resilience Report"
  },
  "1.2.1.2.1": {
    response: "This report outlines all potential areas for external investment, matched with eligibility criteria from FEMA and other funding programs.",
    artifactType: "report1.2.1.2.1",
    artifactTitle: "FEMA Opportunities Report"
  },
  "1.2.2.1.1.1": {
    response: "Here’s your transportation resilience report with current projects, future priorities, and external funding matches.",
    artifactType: "report1.2.2.1.1.1",
    artifactTitle: "Transportation Resilience Report"
  },
  "1.1.2.1.1.1": {
    response: "This socio-economic emergency infrastructure report covers high-priority zones, gaps in responsiveness, and budget-aligned studies.",
    artifactType: "report1.1.2.1.1.1",
    artifactTitle: "Socio-Economic Resilience Report"
  },
  "1.3.1.1.1.1": {
    response: "This FEMA eligibility report focuses on the Shoal Creek and southeast grid zones, outlining their hazard history and fit for federal programs.",
    artifactType: "report1.3.1.1.1.1",
    artifactTitle: "FEMA Funding Eligibility Report"
  },
  "reset": {
    response: "Starting a new analysis. What would you like to evaluate?",
  }
};


useEffect(() => {
  if (currentConversationId) {
    const conversationArtifacts = ArtifactService.getArtifactsForConversation(currentConversationId);
    setArtifacts(conversationArtifacts);
    
    // Get current artifact ID
    const storedArtifactId = ArtifactService.getCurrentArtifactId(currentConversationId);
    
    if (storedArtifactId && conversationArtifacts.some(a => a.id === storedArtifactId)) {
      setCurrentArtifactId(storedArtifactId);
    } else if (conversationArtifacts.length > 0) {
      // Default to first artifact
      setCurrentArtifactId(conversationArtifacts[0].id);
    }
  }
}, [currentConversationId]);

// Add this useEffect to automatically create artifacts for new content
useEffect(() => {
  // Skip if no conversation ID or not showing visualization
  if (!currentConversationId || !showVisualization) return;

  // If tab switch only (user clicked "Chat"), skip artifact creation
  if (activeTab === "chat") return;
  
  // Skip if we already have an artifact of this type
  const hasExistingArtifactOfCurrentType = artifacts.some(a => 
    a.type === activeTab && 
    (activeTab === 'map' ? a.content === mapContent : true)
  );
  
  if (hasExistingArtifactOfCurrentType) return;
  
  // Create artifact based on content type
  let content = '';
  let title = '';
  
  switch (activeTab) {
    case 'map':
      if (mapContent && mapContent.trim()) {
        content = mapContent;
        title = 'Map Visualization';
      } else {
        return; // Don't create empty artifacts
      }
      break;
    case 'report':
      title = 'Generated Report';
      break;
    case 'charts':
      title = 'Data Charts';
      break;
    // Handle other types
  }
  
  // Create and save the artifact
  const artifactId = `${activeTab}-${Date.now()}`;
  const savedArtifact = ArtifactService.saveArtifact(currentConversationId, {
    id: artifactId,
    type: activeTab,
    title: title,
    content: content,
    timestamp: new Date().toISOString()
  });
  
  if (savedArtifact) {
    // Update local state
    setArtifacts(prev => [...prev, savedArtifact]);
    setCurrentArtifactId(artifactId);
  }
}, [activeTab, mapContent, showVisualization, currentConversationId, artifacts]);


const handleShowArtifactGallery = (show = true) => {
  
  setShowArtifactGallery(show);
};
const handleTutorialComplete = () => {
  setShowTutorial(false);
  // Store in localStorage so it doesn't show again (optional)
  try {
    localStorage.setItem('tutorialCompleted', 'true');
  } catch (error) {
    console.warn("localStorage error:", error);
  }
};

const handleSelectArtifact = (artifactId) => {
  const artifact = artifacts.find(a => a.id === artifactId);
  if (artifact) {
    setCurrentArtifactId(artifactId);
    ArtifactService.setCurrentArtifactId(currentConversationId, artifactId);
    
    // Set content based on artifact type
    if (artifact.type === 'map' && artifact.content) {
      setMapContent(artifact.content);
    }
    
    setShowArtifactGallery(false);
    setActiveTab(artifact.type);
  }
};
useEffect(() => {
  // Make setResponseReady available globally
  window.setResponseReady = setResponseReady;
  
  return () => {
    // Clean up
    delete window.setResponseReady;
  };
}, []);

const fetchChatResponse = async (message, extraData = null) => {
  if (!message || !message.trim()) return;
  
  setIsLoading(true);
  setResponseReady(false);

  const updatedHistory = [...chatHistory, { role: "user", content: message }];
  setChatHistory(updatedHistory);

  const saveArtifactForConversation = (type, title, content, buttonId = null) => {
    let conversationIdToUse = currentConversationId;

    if (!conversationIdToUse) {
      conversationIdToUse = Date.now();
      setCurrentConversationId(conversationIdToUse);
    }

    const extractBaseId = (buttonId) => {
      if (!buttonId) return null;
      const parts = buttonId.split('.');
      return parts.slice(0, 2).join('.');
    };

    const baseId = extractBaseId(buttonId);

    if (type === 'map') {
      const updatedArtifacts = artifacts.filter(artifact => {
        const artifactBaseId = extractBaseId(artifact.buttonId);
        return !(artifact.type === 'map' && artifactBaseId === baseId);
      });
      setArtifacts(updatedArtifacts);
    }

    const artifactId = buttonId 
      ? `${buttonId}-${type}-${Date.now()}`
      : `${type}-${Date.now()}`;

    const savedArtifact = ArtifactService.saveArtifact(conversationIdToUse, {
      id: artifactId,
      type: type,
      title: title,
      content: content,
      buttonId: buttonId,
      timestamp: new Date().toISOString()
    });

    return savedArtifact;
  };

  try {
    if (extraData?.responseId === "reset") {
      // Just add the response without creating any artifacts
      const resetResponse = { 
        role: "assistant", 
        content: "Starting a new analysis. What would you like to evaluate?"
        // No artifactIds here
      };
      
      const newHistory = [...updatedHistory, resetResponse];
      setChatHistory(newHistory);
      
      try {
        localStorage.setItem('currentConversation', JSON.stringify(newHistory));
      } catch (error) {
        console.warn("localStorage error:", error);
      }
    
      setIsLoading(false);
      return;
    }
    if (extraData?.responseId && buttonResponses[extraData.responseId]) {

      
      const buttonId = extraData.responseId;
      const responseInfo = buttonResponses[buttonId];
      
      // Create an array to track artifact IDs for this message
      const messageArtifactIds = [];
      
      const artifactTypes = Array.isArray(responseInfo.artifactType)
        ? responseInfo.artifactType
        : [responseInfo.artifactType];

      const isDualArtifact = artifactTypes.length === 2;

      let firstArtifact = null;
      let newArtifacts = [];

      for (const type of artifactTypes) {
        if (type === 'map') {
          handleSaveMap(responseInfo.artifactTitle, responseInfo.mapContent);
        }

        const getArtifactTypeLabel = (type) => {
          if (type.startsWith("map")) return "Map";
          if (type.startsWith("chart")) return "Graph";
          if (type.startsWith("extract")) return "Extract";
          if (type.startsWith("report")) return "Report";
          return "Visualization";
        };
        
        const title = responseInfo.artifactTitle
  ? `${responseInfo.artifactTitle} ${getArtifactTypeLabel(type)}`
  : `Visualization ${getArtifactTypeLabel(type)}`;
        

        const artifact = saveArtifactForConversation(type, title, '', buttonId);

        if (artifact) {
          newArtifacts.push(artifact);
          messageArtifactIds.push(artifact.id); // Track this artifact ID
          
          if (!firstArtifact) {
            firstArtifact = artifact;
          }
        }
      }

      // Add all new artifacts to state at once
      if (newArtifacts.length) {
        setArtifacts(prev => [...prev, ...newArtifacts]);

        // Only show the prompt when exactly 2 were created
        if (newArtifacts.length === 2) {
          window.dispatchEvent(new CustomEvent('show-two-artifact-prompt'));
        }
      }

      // Create the assistant response with artifact IDs attached
      const botResponse = { 
        role: "assistant", 
        content: responseInfo.response,
        artifactIds: messageArtifactIds // Add the artifact IDs to the message
      };
      
      const newHistory = [...updatedHistory, botResponse];
      setChatHistory(newHistory);

      if (firstArtifact) {
        setCurrentArtifactId(firstArtifact.id);
        
        // Only switch tabs if not on mobile
        if (window.innerWidth >= 768) {
          // Desktop behavior
          setActiveTab(firstArtifact.type || "map");
        } else {
          // On mobile, keep chat active and open the draggable panel
          setActiveTab("chat");

    // Delay the call to ensure ResizablePanels has time to expose the function
    setTimeout(() => {
      if (typeof window.openMobileArtifactPanel === 'function') {
        window.openMobileArtifactPanel(firstArtifact.id);
      } else {
        console.warn("window.openMobileArtifactPanel not defined yet");
      }
    }, 400);
        }
      }

      setShowVisualization(true);

      // Trigger prompt if exactly 2 artifacts were created
      if (isDualArtifact) {
        setShowPreviousPrompt(true);
        setTimeout(() => setShowPreviousPrompt(false), 3000);
      }

      try {
        localStorage.setItem('currentConversation', JSON.stringify(newHistory));
      } catch (error) {
        console.warn("localStorage error:", error);
      }

      setIsLoading(false);
      return;
    }

    // For regular responses (not from buttons)
    

    const genericResponse = {
      role: "assistant",
      content: `I've analyzed your query about "${message}". You can find the relevant data in the visualization panel.`,
      artifactIds: messageArtifactIds
    };

    const newHistory = [...updatedHistory, genericResponse];
    setChatHistory(newHistory);

    const defaultMapContent = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;background:#f5f5f5;">
        <div style="text-align:center;padding:20px;">
          <h2 style="margin-bottom:15px;color:#333;">Map Visualization</h2>
          <p style="color:#666;">Geographic data visualization for: ${message}</p>
        </div>
      </div>
    `;

    setMapContent(defaultMapContent);
    setTableContent(hardcodedTables);

    const mapArtifact = saveArtifactForConversation('map', 'Map Visualization', defaultMapContent);
    if (mapArtifact) {
      setArtifacts(prev => [...prev, mapArtifact]);
      setCurrentArtifactId(mapArtifact.id);
    }

    setShowVisualization(true);
    setActiveTab("map");

    try {
      localStorage.setItem('currentConversation', JSON.stringify(newHistory));
      localStorage.setItem('currentMapContent', defaultMapContent);
    } catch (error) {
      console.warn("localStorage error:", error);
    }

  } catch (error) {
    console.error("Error in fetchChatResponse:", error);
    const errorHistory = [
      ...updatedHistory,
      { role: "assistant", content: "Sorry, I encountered an error processing your request. Please try again." }
    ];
    setChatHistory(errorHistory);

    try {
      localStorage.setItem('currentConversation', JSON.stringify(errorHistory));
    } catch (storageError) {
      console.warn("localStorage error:", storageError);
    }

  } finally {
    setIsLoading(false);
  }
};

const handleSaveMap = (mapName, mapContent) => {
  console.log("Saving map:", { name: mapName, contentLength: mapContent?.length });

  if (!mapContent || !mapContent.trim()) {
      return Promise.reject(new Error("No map content to save"));
  }

  try {
      // Create a new map object
      const newMap = {
          id: `map-${Date.now()}`,
          name: mapName,
          content: mapContent,
          date: new Date().toISOString(),
          relatedConversationId: currentConversationId
      };

      // Replace old map with the new one (remove previous maps)
      setSavedMaps([newMap]);  // Only keep the latest map in savedMaps

      return Promise.resolve();
  } catch (error) {
      console.error("Error saving map:", error);
      return Promise.reject(error);
  }
};

return (
<div className="fixed inset-0 top-[68px]">
<Suspense fallback={null}>
        <SearchParamsWrapper onSourceChange={handleSourceChange} />
      </Suspense>
<style jsx global>{`
      /* Fix iOS height issues */
      html, body {
        height: 100%;
        overflow: hidden;
      }
      
      @supports (-webkit-touch-callout: none) {
        .ios-height-fix {
          height: -webkit-fill-available;
        }
      }
      
      /* Improve button appearance on small screens */
      @media (max-width: 640px) {
        .button-option {
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          min-height: 2.5rem;
        }
      }

      /* Ensure panels don't overflow */
      .panel-container {
        width: 100%;
        height: 100%;
        display: flex;
      }
    `}</style>
<div className="w-full h-[calc(100vh-64px)] flex flex-col overflow-y-scroll">

    <main className="flex-1 flex overflow-hidden px-4 md:px-6 py-4 h-full">
      <ResizablePanels
        chatHistory={chatHistory}
        onSend={fetchChatResponse}
        isLoading={isLoading}
        mapContent={mapContent}
        tableContent={tableContent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSaveMap={handleSaveMap}
        savedMaps={savedMaps}
        showVisualization={showVisualization}
        currentConversationId={currentConversationId}
        setMapContent={setMapContent}
        artifacts={artifacts}
        currentArtifactId={currentArtifactId}
        onSelectArtifact={handleSelectArtifact}
        showArtifactGallery={showArtifactGallery}
        onShowArtifactGallery={handleShowArtifactGallery}
        responseReady={responseReady}
        setResponseReady={setResponseReady}
        setLayersVisibility={setLayersVisibility}
        onLayersReady={handleLayersReady}
        layersVisibility={layersVisibility}
        setChartReady={setChartReady}
        chartReady={chartReady}
        setCustomChartReady={setCustomChartReady}
        customChartReady={customChartReady}
        showPreviousPrompt={showPreviousPrompt}
        showTutorial={showTutorial}
        setShowTutorial={setShowTutorial}
      />
    </main>
    <TutorialOverlay 
      isVisible={showTutorial} 
      onComplete={handleTutorialComplete} 
    />
  </div>
  </div>
);
}