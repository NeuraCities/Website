"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FileText, File, X, ArrowUpRight } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
//import { Input } from "./ui/input";
import Checkbox from "./ui/Checkbox";

export default function ChatSection({ chatHistory, onSend, isLoading,
  responseReady, setLayersVisibility, setResponseReady, setChartReady, setCustomChartReady, setActiveTab, artifacts, activeTab, onSelectArtifact,
  setShowTutorial, onShowArtifactGallery }) {
  const [typingText, setTypingText] = useState(""); 
  const [isTyping, setIsTyping] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const fullMessageRef = useRef("");
  const typewriterTimerRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const helpDialogRef = useRef(null);
  const questionMarkRef = useRef(null);
  const router = useRouter();
  const [currentButtons, setCurrentButtons] = useState([]);
const [flowState, setFlowState] = useState("initial");
const [flowHistory, setFlowHistory] = useState([]);
const [showTile, setShowTile] = useState(false);
const [showLoginTile, setShowLoginTile] = useState(false);
const [isFlowActive, setIsFlowActive] = useState(false);
const [isFirstResponse, setIsFirstResponse] = useState(true);
const [autoScroll, ] = useState(true);
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

useEffect(() => {
  if (isMobile && activeTab === "chat") {
    const chatPanel = document.querySelector('[data-panel="chat"]');
    if (chatPanel) {
      // Force immediate full width
      chatPanel.style.cssText = "width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important; display: block !important; visibility: visible !important; opacity: 1 !important;";
      
      // Force a reflow
      void chatPanel.offsetHeight;
      
      // Apply again after a short delay
      setTimeout(() => {
        chatPanel.style.cssText = "width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important; display: block !important; visibility: visible !important; opacity: 1 !important;";
      }, 50);
    }
  }
}, [isMobile, activeTab]);

useEffect(() => {
  if (autoScroll && messagesEndRef.current) {
    // Delay the scroll to ensure artifact buttons are rendered
    const scrollTimer = setTimeout(() => {
      if (messagesEndRef.current && messagesEndRef.current.offsetParent !== null) {
        setTimeout(() => {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }    }, 100); // Small delay to allow DOM to update with artifact buttons
    
    return () => clearTimeout(scrollTimer);
  }
}, [chatHistory, autoScroll, typingText, isTyping]);



useEffect(() => {
  if (responseReady && showLoadingMessage && !isLoading) {
    console.log("Response became ready, starting typewriter");
    const lastAssistantIndex = [...chatHistory].reverse().findIndex(msg => msg.role === "assistant");
    if (lastAssistantIndex !== -1) {
      const assistantMessage = [...chatHistory].reverse()[lastAssistantIndex];
      fullMessageRef.current = assistantMessage.content;
      setTypingText("");
      setIsTyping(true);
      setShowLoadingMessage(false); 
      
      if (typewriterTimerRef.current) {
        clearTimeout(typewriterTimerRef.current);
      }
      
      // Check if this is the first response after login
      if (isFirstResponse) {
        console.log("This is the first response - waiting 12000ms for map to load");
        setTimeout(() => {
          startTypewriterEffect(assistantMessage.content);
          // Reset the first response flag
          setIsFirstResponse(false);
        }, 6000); 
      } else {
        setTimeout(() => {
          startTypewriterEffect(assistantMessage.content);
        }, 50);
      }
    } else {
      console.error("No assistant message found in chat history");
      setIsTyping(false);
      setShowLoadingMessage(false);
    }
  }
}, [responseReady, chatHistory, isLoading, showLoadingMessage, isFirstResponse]);

const findArtifactsForMessage = (message) => {
  if (message.role !== "assistant" || !message.artifactIds) {
    return [];
  }
  
  return message.artifactIds
    .map(id => artifacts.find(a => a.id === id))
    .filter(a => a !== undefined);
};

const LoginTile = ({ onClose}) => {
  const [newsletter, setNewsletter] = useState(false);

  // Modified onClose function that also resets isFlowActive
  const handleClose = () => {
    setIsFlowActive(false); // Reset the flow active state
    onClose(); // Call the original onClose function
  };

  const handleMicrosoftLogin = () => {
    // Azure AD application configuration
    const clientId = "050f429e-488a-4dc8-8b78-fd43a9cee740";
    const tenantId = "common";
    
    // This should match the route where your MicrosoftAuthCallback component is rendered
    // Using Next.js routing structure
    const redirectUri = window.location.origin + "/auth/microsoft/callback";
    
    // Scope for basic profile info and email
    const scope = "openid profile email User.Read";
    
    // Generate a state parameter for security
    const state = Math.random().toString(36).substring(2);
    
    // Store state in localStorage to verify when the user returns
    localStorage.setItem("microsoftOAuthState", state);
    
    // Build the authorization URL
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "query");
    
    // Redirect to Microsoft's OAuth page
    window.location.href = authUrl.toString();
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[10000]">
      {/* Container div - different sizes for mobile vs desktop */}
      <div className="bg-white rounded-xl shadow-lg w-full relative md:max-w-lg max-w-xs md:p-8 p-4 text-center">
        {/* Close Button - now using the handleClose function */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={18} />
        </button>

        <h2 className="md:text-3xl text-xl font-bold text-primary md:mb-2 mb-1">Welcome to NeuraCities</h2>
        <p className="md:text-lg text-sm md:mb-6 mb-3 text-secondary">Please sign up to access the demo</p>
        
        <form
          name="demo-form"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          action="/forms.html"
          onSubmit={handleLoginSubmit}
          className="md:space-y-4 space-y-2"
          autoComplete="on"
        >
          <input type="hidden" name="form-name" value="demo-form" />
          <div hidden>
            <input name="bot-field" autoComplete="off" />
          </div>
          {/* Newsletter hidden field */}
          <input
            type="hidden"
            name="newsletter"
            value={newsletter ? "yes" : "no"}
          />

          {/* Name */}
          <div>
            <label
              htmlFor="demo-name"
              className="sr-only"
            >
              Name
            </label>
            <input
              type="text"
              id="demo-name"
              name="name"
              placeholder="Name"
              required
              autoComplete="name"
              className="w-full md:p-3 p-2 border border-secondary rounded-lg md:text-lg text-16 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="demo-email"
              className="sr-only"
            >
              Email
            </label>
            <input
              id="demo-email"
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full md:p-3 p-2 border border-secondary rounded-lg md:text-lg text-16 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
            />
          </div>

          {/* Newsletter Checkbox */}
          <div className="flex items-center space-x-2 text-left">
            <Checkbox
              type="checkbox"
              id="newsletter"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="md:w-4 md:h-4 w-3 h-3 text-coral border-secondary rounded focus:ring-coral"
            />
            <label
              htmlFor="newsletter"
              className="md:text-base text-xs font-medium text-primary"
            >
              Keep me updated with NeuraCities!
            </label>
          </div>

          <p className="md:text-sm text-xs text-primary text-left mt-1">
            We respect your privacy. Your information will never be shared.
          </p>

          <button
            type="submit"
            className="w-full md:py-3 py-2 px-4 bg-coral text-white rounded-lg hover:bg-coral/90 transition duration-200 md:text-lg text-sm font-medium"
          >
            Get Started
          </button>
        </form>

        
        {/* OR divider */}
        <div className="flex items-center md:my-6 my-3">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink md:mx-4 mx-2 md:text-base text-xs text-gray-600">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        {/* Microsoft login button */}
        <button
          onClick={handleMicrosoftLogin}
          className="w-full flex items-center justify-center md:py-3 py-2 md:px-4 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 md:text-base text-xs font-medium"
        >
          <svg className="md:w-5 md:h-5 w-4 h-4 md:mr-3 mr-2" viewBox="0 0 23 23">
            <path fill="#f1511b" d="M11.4 0H0v11.4h11.4V0z" />
            <path fill="#80cc28" d="M23 0H11.6v11.4H23V0z" />
            <path fill="#00adef" d="M11.4 11.6H0V23h11.4V11.6z" />
            <path fill="#fbbc09" d="M23 11.6H11.6V23H23V11.6z" />
          </svg>
          <span className="md:inline">Continue with Microsoft Account</span>
        </button>
      </div>
    </div>
  );
};

// Modify the handleLoginSubmit function in your ChatSection component:

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setShowLoginTile(false);

  // Immediately update the chat history to remove the empty state
  // This is the key addition - we'll push a temporary message to hide the initial button
  const tempMessage = {
    role: "user",
    content: "I want to evaluate the Resilience of Infrastructure around downtown Austin"
  };
  
  // Add this temporary message to chat history to immediately change the UI state
  // The actual onSend below will properly update the chat history
  if (typeof onSend === 'function') {
    // Call onSend immediately to update chat history
    onSend(tempMessage.content, { responseId: "1.0" });
  }

  // Extract form data
  const form = e.target;
  const formData = new FormData(form);

  // Update the newsletter value explicitly
  formData.set('newsletter', newsletter ? 'yes' : 'no');

  // Convert to URL-encoded data
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.append(key, value.toString());
  });

  // Force mobile to always stay on chat tab
  if (window.innerWidth < 768 && typeof setActiveTab === "function") {
    setActiveTab("chat");
  }

  try {
    const response = await fetch('/forms.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (response.ok) {
      // Handle successful submission (e.g., navigate to chat)
    } else {
      console.error('Error submitting form:', response.statusText);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }


  setFlowHistory(prev => [...prev, flowState]);
  setFlowState("infrastructure-analysis");

  // Explicitly mark flow as active to prevent multiple clicks
  setIsFlowActive(true);
  
  // Show loading instead of waiting for response
  setShowLoadingMessage(true);
  setIsFirstResponse(true);
  
  // For mobile, use a cleaner approach - don't rely on triggerFlowSequence
  if (window.innerWidth < 768) {
    // Wait a bit to ensure message is processed
    setTimeout(() => {
      // Directly set response ready flag to trigger typewriter
      setResponseReady(true);
    }, 2500);
  } else {
    // Use normal flow for desktop
    triggerFlowSequence("1.0");
  }

  setTimeout(() => {
    setShowTutorial(true);
  }, 12000);
};

const buttonFlows = useMemo(() => ({
  "1.0": ["map", "neighborhoods", "buildings", "streets", "response", "chart"],
  "1.1": ["map", "chart"],
  "1.2": ["map", "crashes", "response"],
  "1.3.1": ["chart1", "chart2", "response"]
}), []);

const triggerFlowSequence = useCallback(async (buttonId) => {
  const flow = buttonFlows[buttonId];
  if (!flow) return;

  // Reset everything
  setLayersVisibility({
    map: false,
    neighborhoods: false,
    buildings: false,
    streets: false,
    crashes: false
  });
  setChartReady(false);
  setCustomChartReady(false);

  let layersLoaded = false;

  // Function to check if all required layers are visible (map, neighborhoods, etc.)
  const checkIfLayersAreReady = () => {
    // Use the state updater function to access current state
    setLayersVisibility(prevState => {
      // Check if all required layers are visible
      if (prevState.map && prevState.neighborhoods && prevState.buildings) {
        layersLoaded = true;
      }
      // Return the same state to avoid any actual state changes
      return prevState;
    });
  };

  for (const step of flow) {
    await new Promise((res) => setTimeout(res, 400));

    switch (step) {
      case "map":
        setLayersVisibility(prev => ({ ...prev, map: true }));
        checkIfLayersAreReady(); // Check for layers readiness after map is visible
        break;
      case "neighborhoods":
        setLayersVisibility(prev => ({ ...prev, neighborhoods: true }));
        checkIfLayersAreReady(); // Check for layers readiness after neighborhoods are visible
        break;
      case "buildings":
        setLayersVisibility(prev => ({ ...prev, buildings: true }));
        checkIfLayersAreReady(); // Check for layers readiness after buildings are visible
        break;
      case "response":
        if (layersLoaded) {
          setResponseReady(true);  // Proceed if layers are ready
        } else {
          // If layers are not ready, check every 500ms and trigger when layers are visible
          const intervalId = setInterval(() => {
            checkIfLayersAreReady();
            if (layersLoaded) {
              clearInterval(intervalId);  // Stop checking once layers are ready
              setResponseReady(true); // Trigger response
            }
          }, 500);
        }
        break;
      case "chart":
        setChartReady(true);
        break;
      default:
        break;
    }
  }

  // Reset after flow is done
  setTimeout(() => {
    setIsFlowActive(false);
  }, 2000);
}, [buttonFlows, setLayersVisibility, setChartReady, setCustomChartReady, setResponseReady]);




  const handleViewFile = (file, url, type) => {
    setSelectedFile(file);
    setSelectedFileUrl(url || URL.createObjectURL(file));
    setSelectedFileType(type);
    setIsViewerOpen(true);
  };

  // Add near the beginning of your component
useEffect(() => {
  // Monitor for tab changes and handle mobile styling
  const handleTabChange = () => {
    // For mobile, ensure chat takes full width when active
    if (window.innerWidth < 768) {
      const chatPanel = document.querySelector('[data-panel="chat"]');
      if (chatPanel) {
        requestAnimationFrame(() => {
          chatPanel.style.cssText = 'width: 100vw !important; max-width: 100vw !important;';
        });
      }
    }
  };
  
  // Initial setup for mobile
  if (window.innerWidth < 768) {
    handleTabChange();
  }
  
  // Listen for tab changes
  window.addEventListener('tab-change', handleTabChange);
  
  // Cleanup 
  return () => {
    window.removeEventListener('tab-change', handleTabChange);
  };
}, []);
useEffect(() => {
  if (window.innerWidth < 768) {
    const chatPanel = document.querySelector('[data-panel="chat"]');
    if (chatPanel) {
      chatPanel.style.minWidth = '100vw';
      chatPanel.style.maxWidth = '100vw';
      chatPanel.style.width = '100vw';
    }
  }
}, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (helpDialogRef.current && !helpDialogRef.current.contains(event.target)) {
        setShowHelpDialog(false);
      }
    }
  
    if (showHelpDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpDialog]);

  const handleRemoveFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    const previewIndex = filePreviewUrls.findIndex(p => p.file === fileToRemove);
    if (previewIndex !== -1) {
      const previewUrl = filePreviewUrls[previewIndex].url;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFilePreviewUrls(prev => prev.filter((_, i) => i !== previewIndex));
    }
  };

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [filePreviewUrls]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setCurrentButtons([
        {
          id: "1.0",
          text: "I want to evaluate the Resilience of Infrastructure around downtown Austin",
        }
      ]);
    } else {
      // Determine which buttons to show based on flow state
      updateButtonsBasedOnState(flowState);
    }
  }, [chatHistory, flowState]);

  // Function to determine which buttons to show based on current state
  const updateButtonsBasedOnState = (state) => {
    switch(state) {
      case "initial":
        setCurrentButtons([
          {
            id: "1.0",
            text: "I want to evaluate the Resilience of Infrastructure in downtown Austin",
          }
        ]);
        break;
      case "infrastructure-analysis":
        setCurrentButtons([
          {
            id: "1.1",
            text: "Add socio-economic conditions to our Resilience analysis",
            nextState: "socio-economic-analysis"
          },
          {
            id: "1.2",
            text: "Include traffic and crashes data",
            nextState: "traffic-analysis"
          },
          {
            id: "1.3",
            text: "From an environmental POV, what are some factors we should analyze?",
            nextState: "environmental-analysis"
          }
        ]);
        break;
      case "socio-economic-analysis":
        setCurrentButtons([
          {
            id: "1.1.1",
            text: "What are the Policies in place around both improving Resilience and socio-economic conditions of this area?",
            nextState: "resilience-policies"
          },
          {
            id: "1.1.2",
            text: "How is the Emergency responsiveness in this area?",
            nextState: "emergency-socio"
          }
        ]);
        break;
      case "traffic-analysis":
        setCurrentButtons([
          {
            id: "1.2.1",
            text: "What are the ongoing Traffic Projects in the area?",
            nextState: "ongoing-traffic-projects"
          },
          {
            id: "1.2.2",
            text: "In order to improve the resilience from a transportation POV what are some other things I should be aware of?",
            nextState: "transportation-resilience"
          }
        ]);
        break;
      case "environmental-analysis":
        setCurrentButtons([
          {
            id: "1.3.1",
            text: "Let's also add some historical disaster data we have to our analysis",
            nextState: "historical-disaster"
          },
          {
            id: "1.3.2",
            text: "How is the Emergency responsiveness in this area?",
            nextState: "emergency-environmental"
          }
        ]);
        break;
      case "resilience-policies":
        setCurrentButtons([
          {
            id: "1.1.1.1",
            text: "Let's also look at the zoning laws and the land use.",
            nextState: "zoning-laws"
          }
        ]);
        break;
      case "zoning-laws":
        setCurrentButtons([
          {
            id: "1.1.1.1.1",
            text: "I see some patterns here, summarize those in a report",
            nextState: "final-report"
          }
        ]);
        break;
      case "patterns-summary":
        setCurrentButtons([
          {
            id: "S3",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "emergency-socio":
        setCurrentButtons([
          {
            id: "1.1.2.1",
            text: "Given all of this what are the emergency facilities or infrastructure we should prioritize?",
            nextState: "priority-emergency-infrastructure"
          }
        ]);
        break;
      case "priority-emergency-infrastructure":
        setCurrentButtons([
          {
            id: "1.1.2.1.1",
            text: "Given these areas and with the budget left for this year, where can we do a study?",
            nextState: "budget-study-socio"
          }
        ]);
        break;
      case "budget-study-socio":
        setCurrentButtons([
          {
            id: "1.1.2.1.1.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "ongoing-traffic-projects":
        setCurrentButtons([
          {
            id: "1.2.1.1",
            text: "Are there areas in downtown where we can initiate a study given the budget of this year?",
            nextState: "downtown-study-areas"
          },
          {
            id: "1.2.1.2",
            text: "Let's prioritize some areas where Funding from an external agency could be valid",
            nextState: "external-funding-areas-1"
          }
        ]);
        break;
      case "downtown-study-areas":
        setCurrentButtons([
          {
            id: "1.2.1.1.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "external-funding-areas-1":
        setCurrentButtons([
          {
            id: "1.2.1.2.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "transportation-resilience":
        setCurrentButtons([
          {
            id: "1.2.2.1",
            text: "What are some projects already in the pipeline?",
            nextState: "pipeline-projects"
          }
        ]);
        break;
      case "pipeline-projects":
        setCurrentButtons([
          {
            id: "1.2.2.1.1",
            text: "Let's prioritize some areas where Funding from an external agency could be valid",
            nextState: "external-funding-areas-2"
          }
        ]);
        break;
      case "external-funding-areas-2":
        setCurrentButtons([
          {
            id: "1.2.2.1.1.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "historical-disaster":
        setCurrentButtons([
          {
            id: "1.3.1.1",
            text: "Given all of this what are the elements we should prioritize?",
            nextState: "priority-elements"
          }
        ]);
        break;
      case "priority-elements":
        setCurrentButtons([
          {
            id: "1.3.1.1.1",
            text: "Can we apply for FEMA funding for any of these areas to do a project in?",
            nextState: "fema-funding"
          }
        ]);
        break;
      case "fema-funding":
        setCurrentButtons([
          {
            id: "1.3.1.1.1.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
      case "emergency-environmental":
        setCurrentButtons([
          {
            id: "1.3.2.1",
            text: "Given all of this what are the emergency facilities we should prioritize?",
            nextState: "priority-emergency-facilities"
          }
        ]);
        break;
      case "priority-emergency-facilities":
        setCurrentButtons([
          {
            id: "1.3.2.1.1",
            text: "Given these areas and with the budget left for this year, where can we do a study?",
            nextState: "budget-study-environmental"
          }
        ]);
        break;
      case "budget-study-environmental":
        setCurrentButtons([
          {
            id: "1.3.2.1.1.1",
            text: "Great! Can you create a report for all that we talked about?",
            nextState: "final-report"
          }
        ]);
        break;
        // In the updateButtonsBasedOnState function:

case "final-report":
  setCurrentButtons([
    {
      id: "reset",
      text: "Start a new analysis",
      nextState: "initial"
    },
    {
      id: "contact",
      text: "Contact Us",
      nextState: "contact-info",
      style: { backgroundColor: "#FF5747", color: "white", border: "none" } // Exact CTA color
    }
  ]);
  break;

// Also update the same button in the default case:
default:
  setCurrentButtons([
    {
      id: "reset",
      text: "Start a new analysis",
      nextState: "initial"
    },
    {
      id: "contact",
      text: "Contact Us",
      nextState: "contact-info",
      style: { backgroundColor: "#FF5747", color: "white", border: "none" } // Exact CTA color
    }
  ]);
    }
  };

  // Add this useEffect to your ChatSection component or update the existing one
useEffect(() => {
  // Check if this is a redirect from Microsoft OAuth or has the triggerInfrastructureAnalysis flag
  const checkForOAuthRedirect = () => {
    // Check for the triggerInfrastructureAnalysis flag that's set in the MicrosoftAuthCallback component
    const triggerAnalysis = localStorage.getItem("triggerInfrastructureAnalysis");
    console.log('Checking for OAuth redirect, triggerAnalysis flag:', triggerAnalysis);
    
    // Only proceed if we have the trigger flag
    if (triggerAnalysis === "true") {
      console.log("Detected OAuth redirect with analysis flag");
      
      // Clean up localStorage
      localStorage.removeItem("triggerInfrastructureAnalysis");
      
      // Clear query parameters from URL (optional but cleaner)
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Simulate clicking the infrastructure analysis button
      setTimeout(() => {
        console.log("Triggering infrastructure analysis flow after OAuth");
        
        // Same logic as in handleLoginSubmit to trigger the analysis flow
        const buttonData = {
          id: "1.0",
          text: "I want to evaluate the Resilience of Infrastructure around downtown Austin",
          nextState: "infrastructure-analysis"
        };
        
        setFlowHistory(prev => [...prev, flowState]);
        setFlowState("infrastructure-analysis");
        setIsFlowActive(true);
        
        // Send message and trigger response processing
        onSend(buttonData.text, { responseId: buttonData.id });
        setShowLoadingMessage(true);
        setIsFirstResponse(true);
        
        // For mobile, use a cleaner approach
        if (window.innerWidth < 768) {
          setTimeout(() => {
            setResponseReady(true);
          }, 2500);
        } else {
          triggerFlowSequence("1.0");
        }
        
        // Show tutorial after a delay
        setTimeout(() => {
          setShowTutorial(true);
        }, 12000);
      }, 1000); // Small delay to ensure component is fully mounted
    }else {
      console.log("No analysis flag found or flag is not 'true'");
    }
  };
  
  // Run the check
  checkForOAuthRedirect();
}, [flowState, onSend, setResponseReady, setShowTutorial, triggerFlowSequence]);

// Add this new useEffect to your ChatSection component
useEffect(() => {
  // Function to check for the flag
  const checkForFlag = () => {
    const triggerAnalysis = localStorage.getItem("triggerInfrastructureAnalysis");
    console.log("Focus event: Checking for trigger flag:", triggerAnalysis);
    if (triggerAnalysis === "true") {
      console.log("Found trigger flag on focus, initiating analysis flow");
      localStorage.removeItem("triggerInfrastructureAnalysis");
      
      // Trigger the infrastructure analysis flow
      const buttonData = {
        id: "1.0",
        text: "I want to evaluate the Resilience of Infrastructure around downtown Austin",
        nextState: "infrastructure-analysis"
      };
      
      setFlowHistory(prev => [...prev, flowState]);
      setFlowState("infrastructure-analysis");
      setIsFlowActive(true);
      
      // Send message and trigger response processing
      onSend(buttonData.text, { responseId: buttonData.id });
      setShowLoadingMessage(true);
      setIsFirstResponse(true);
      
      // For mobile, use a cleaner approach
      if (window.innerWidth < 768) {
        setTimeout(() => {
          setResponseReady(true);
        }, 2500);
      } else {
        triggerFlowSequence("1.0");
      }
      
      // Show tutorial after a delay
      setTimeout(() => {
        setShowTutorial(true);
      }, 12000);
    }
  };
  
  // Check when window gets focus, as this happens after redirect
  window.addEventListener('focus', checkForFlag);
  
  // Cleanup
  return () => {
    window.removeEventListener('focus', checkForFlag);
  };
}, [flowState, onSend, setResponseReady, setShowTutorial, triggerFlowSequence]);

  useEffect(() => {
    // Reset critical state on mount
    setIsFlowActive(false);
    setShowLoginTile(false);
    
    console.log("State reset on mount");
  }, []);
  useEffect(() => {
    console.log("ChatSection mounted with states:", {
      isFlowActive,
      showLoginTile,
      flowState,
      isLoading,
      isTyping
    });
  }, [flowState, isFlowActive, isLoading, isTyping, showLoginTile]);

  const InfoTile = ({ onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[10000]">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <X size={10} />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Want to see a different use case?</h2>
        <button 
              onClick={() => router.push('/contact', { scroll: true })}
              className="px-6 py-2 bg-cta text-white rounded-lg hover:bg-teal-600 transition duration-200"
              >
              Contact
        </button>
      </div>
    </div>
  );
  
  const handleButtonClick = (button) => {
    // For the initial button (1.0), simplify the condition
    if (button.id === "1.0") {
      // If login tile is already showing, don't do anything
      if (showLoginTile) {
        return;
      }
      
      console.log("Initial demo button clicked");
      setIsFlowActive(true);
      setShowLoginTile(true);
      return; // Exit early
    }
  
    if (button.id === "contact") {
      // Navigate to contact page
      router.push('/contact', { scroll: true });
      return; // Exit early
    }
    
    // For all other buttons, check if we're already processing something
    if (isLoading || isTyping || isFlowActive) {
      console.log("Button click ignored - system busy");
      return;
    }
    
    console.log("Button clicked with ID:", button.id);
    setIsFlowActive(true);
    
    // Handle other buttons as before
    if (["1.2.1.2.1", "1.2.1.1.1", "1.1.1.1.1", "1.2.2.1.1.1", "1.1.2.1.1.1", "1.3.2.1.1.1", "1.3.1.1.1.1"].includes(button.id)) {
      setShowTile(true);
    } else {
      setShowTile(false);
    }
  
    if (button.id === "reset") {
      setFlowState("infrastructure-analysis");
      setFlowHistory([]); 
      setIsFlowActive(false);
      
      // Check if we're on mobile
      if (window.innerWidth < 768) {
        // On mobile, stay on chat tab
        if (setActiveTab) {
          setActiveTab("chat");
        }
        // Don't show artifact gallery on mobile
        onShowArtifactGallery(false);
      } else {
        // On desktop, show gallery as before
        if (setActiveTab) {
          setActiveTab("gallery");
        }
        onShowArtifactGallery(true);
      }
    } else {
      setFlowHistory(prev => [...prev, flowState]);
      setFlowState(button.nextState);
      
      // Always ensure we exit gallery view for non-reset buttons
      if (window.innerWidth < 768) {
        // For mobile, always stay on chat tab for better UX
        if (setActiveTab) {
          setActiveTab("chat");
        }
      } else {
        // Desktop behavior - switch tabs
        if (setActiveTab) {
          setActiveTab("map");
        }
      }
      onShowArtifactGallery(false); // Always exit gallery mode for button clicks
    }
  
    onSend(button.text, { responseId: button.id });
    setShowLoadingMessage(true);
    if (button.id === "1.2") {
      triggerFlowSequence(button.id);
    }
  };
  
  useEffect(() => {
    // Check URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const source = queryParams.get('source');
    
    // If coming from homepage, make sure to reset all states
    if (source === 'homepage') {
      setIsFlowActive(false);
      setShowLoginTile(false);
      setFlowState("initial");
      // Any other state resets needed
      console.log("States reset due to homepage navigation");
    }
    
    console.log("Navigation source:", source || "direct/internal");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, typingText, showLoadingMessage]);

  const startTypewriterEffect = (text) => {
    if (!text || text.length === 0) {
      console.error("Empty text provided to typewriter effect");
      setIsTyping(false);
      return;
    }
    
    console.log("Starting typewriter with text length:", text.length);
    
    const words = text.match(/(\S+|\s+)/g) || [];
    let currentIndex = 0;
  
    // Clear any existing timer
    if (typewriterTimerRef.current) {
      clearTimeout(typewriterTimerRef.current);
    }
  
setTypingText(words[0] || " ");
currentIndex = 1;

const typeNextWord = () => {
  if (currentIndex < words.length) {
    // Add a space before the next word if it's not already a space
    if (words[currentIndex-1] && !words[currentIndex-1].match(/^\s+$/) && !words[currentIndex].match(/^\s+$/)) {
      setTypingText(prev => prev + (prev.endsWith(' ') ? '' : ' ') + words[currentIndex]);
    } else {
      setTypingText(prev => prev + words[currentIndex]);
    }
    currentIndex++;

    const delay = Math.floor(20 * (Math.random() * 0.3 + 0.85));
    typewriterTimerRef.current = setTimeout(typeNextWord, delay);
  } else {
    console.log("Typewriter completed");
    setIsTyping(false);
    setIsFlowActive(false);
  }
};

// Start the sequence
typewriterTimerRef.current = setTimeout(typeNextWord, 30);
  };


  // Updated renderMessage function in ChatSection.js
// Replace the existing renderMessage function with this one

const renderMessage = (msg, idx) => {
  // For user messages, always render normally with adjusted width on mobile
  if (msg.role === "user") {
    return (
      <div
        key={idx}
        className="bg-neutral p-3 rounded-lg w-auto max-w-[80%] md:max-w-[fit-content] ml-auto mb-2 text-sm md:text-base"
      >
        <div className="text-primary break-words">
          {msg.content}
        </div>
      </div>
    );
  }

  const isLastAssistantMessage = idx === chatHistory.length - 1 && msg.role === "assistant";
  const isResetResponse = msg.content === "Starting a new analysis. What would you like to evaluate?";

  // If we're waiting for map to load, show "Generating..." message
  if (isLastAssistantMessage && !responseReady && !isTyping && !isResetResponse) {
    return (
      <div
        key={idx}
        className="bg-primary p-3 rounded-lg shadow-sm w-auto max-w-[80%] md:max-w-[fit-content] mr-auto mb-2 text-sm md:text-base"
      >
        <div className="text-white break-words whitespace-pre-line">
          Generating
          <span className="dot-typing ml-1"></span>
        </div>
      </div>
    );
  }

  // For the most recent assistant message and we're typing
  if (isLastAssistantMessage && isTyping && !isResetResponse) {
    console.log("Rendering typing message on mobile:", { typingText: typingText });
    return (
      <div
        key={idx}
        className="bg-primary p-3 rounded-lg shadow-sm w-auto max-w-[80%] md:max-w-[fit-content] mr-auto mb-2 text-sm md:text-base"
      >
        <div className="text-white break-words whitespace-pre-line">
          {typingText || "\u00A0"}
          <span className="typing-cursor">|</span>
        </div>
      </div>
    );
  }
    
  // Find artifacts associated with this message
  const messageArtifacts = findArtifactsForMessage(msg, idx);
    
  // For all other assistant messages, render normally with artifact buttons if available
  return (
    <div key={idx} className="mr-auto mb-4 max-w-[80%] md:max-w-full">
      <div className="bg-primary p-3 rounded-lg shadow-sm w-auto max-w-full text-sm md:text-base">
        <div className="text-white break-words">
          {msg.content}
        </div>
      </div>
        
      {/* Render artifact buttons if there are artifacts */}
      {messageArtifacts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 ml-1">
          {messageArtifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => {
                onSelectArtifact(artifact.id);
                
                // For mobile, open panel instead of changing tabs
                if (window.innerWidth < 768) {
                  if (typeof window.openMobileArtifactPanel === 'function') {
                    window.openMobileArtifactPanel(artifact.id);
                  }
                } else {
                  // Desktop behavior - switch tabs
                  if (setActiveTab) {
                    setActiveTab("map");
                  }
                }
              }}
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-[#e0f2f2] to-white border border-[#008080] text-[#008080] rounded-md py-1.5 px-3 
                        hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#009999] hover:text-white transition-all duration-200 shadow-sm
                        transform hover:scale-105 active:scale-95 hover:shadow-md relative overflow-hidden
                        after:absolute after:inset-0 after:rounded-md after:top-0 after:h-1/2"
            >
              <span className="font-medium relative z-10">{artifact.title || `View ${artifact.type}`}</span>
              <ArrowUpRight size={12} className="relative z-10" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  return (

<div className={`flex flex-col h-[670px] md:h-full w-full md:max-w-3xl mx-auto overflow-auto bg-transparent ${isMobile && activeTab === "chat" ? "chat-reset-mobile" : ""}`}>
{/* Inject custom CSS for typing animation */}
        <style>{`
          .typing-cursor {
            display: inline-block;
            width: 2px;
            animation: blink 1s step-end infinite;
          }
          
          @keyframes blink {
            from, to { opacity: 1; }
            50% { opacity: 0; }
          }
          
          .dot-typing::after {
            content: '';
            animation: dotTyping 1.5s infinite;
          }
          
          @keyframes dotTyping {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
            100% { content: ''; }
          }
    
          /* Fix iOS height issues */
          @supports (-webkit-touch-callout: none) {
            .ios-height-fix {
              height: -webkit-fill-available;
            }
          }
        `}</style>
    
        {/* Scrollable messages area */}
        
        <div className="flex-1 overflow-hidden mt-20 md:mt-2 mb-0 md:mb-0">
  <div className="h-full overflow-y-auto px-4 md:px-4">

{chatHistory.length === 0 ? (
  <div className="fixed inset-0 flex flex-col items-center justify-center h-full min-h-screen text-center text-secondary px-4">
  <h2 className="text-xl md:text-4xl font-semibold mb-4 text-primary">
Ready to see NeuraCities in action? </h2>
 <h1 className="text-xl md:text-2xl mb-6 text-secondary">
Click below to begin </h1>
  <button
    onClick={() =>
      handleButtonClick({
        id: "1.0",
        text: "I want to evaluate the Resilience of Infrastructure around downtown Austin",
      })
    }
    className="flex items-center gap-1 bg-gradient-to-r from-[#e0f2f2] to-white border border-[#008080] text-[#008080] rounded-lg py-3 px-6 hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#009999] hover:text-white transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95 hover:shadow-md relative overflow-hidden after:absolute after:inset-0 after:rounded-md after:top-0 after:h-1/2 mx-auto"

  >
  <span className="font-medium relative z-10">I want to evaluate the Resilience of Infrastructure around downtown Austin</span>
  </button>
  <h3 className="text-sm mt-10 mb-0 font-semi-bold text-coral underline">Disclaimer</h3>
  <p className="text-xs max-w-xl text-secondary leading-relaxed"> This demo is provided for informational and illustrative purposes only. The data and visualizations shown are not guaranteed to be complete, accurate, or up-to-date and should not be used as the sole basis for any decision-making.</p>
          </div>
          ) : (
            <div className="space-y-4">
              {/* Render all chat messages */}
              {chatHistory.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        </div>
    
  
      {/* Render LoginTile conditionally */}
      {showLoginTile && (
        <LoginTile onClose={() => setShowLoginTile(false)} onSubmit={handleLoginSubmit} />
      )}
  
      {showHelpDialog && (
        <div
          className="fixed text-gray-800 p-2 rounded-md shadow-lg z-50 bg-white"
          style={{
            maxWidth: '200px',
            minWidth: '150px',
            bottom: `${questionMarkRef.current ? window.innerHeight - questionMarkRef.current.getBoundingClientRect().top : 60}px`,
            right: `${questionMarkRef.current ? window.innerWidth - questionMarkRef.current.getBoundingClientRect().right + 5 : 20}px`,
            fontSize: '0.75rem'
          }}
          ref={helpDialogRef}
        >
          <div className="text-xs space-y-1">
            <button
              className="block w-full text-left py-1 px-2 rounded-md transition-all hover:bg-teal-600 hover:text-white"
              style={{
                color: '#teal-600',
                border: 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Help & FAQ
            </button>
            <button
              className="block w-full text-left py-1 px-2 rounded-md transition-all hover:bg-teal-600 hover:text-white"
              style={{
                color: '#teal-600',
                border: 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Release notes
            </button>
            <button
              className="block w-full text-left py-1 px-2 rounded-md transition-all hover:bg-teal-600 hover:text-white"
              style={{
                color: '#teal-600',
                border: 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Keyboard shortcuts
            </button>
          </div>
        </div>
      )}
  
      {/* File Preview Area */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white/95 border border-gray-200 rounded-lg p-3 mb-2 mx-2">
          <div className="text-xs font-medium text-gray-500 mb-2">Uploaded Files:</div>
          <div className="flex flex-wrap gap-2">
            {filePreviewUrls.map((preview, index) => (
              <div key={index} className="relative inline-block">
                {preview.type === 'image' ? (
                  <Image
                  src={preview.url}
                  alt={preview.file.name}
                  width={64} // Set the width
                  height={64} // Set the height
                  className="object-cover rounded-md border border-gray-200 shadow-sm cursor-pointer"
                  onClick={() => handleViewFile(preview.file, preview.url, preview.type)}
                />
                ) : (
                  <div
                    className="h-16 w-16 bg-transparent rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center p-1 cursor-pointer"
                    onClick={() => handleViewFile(preview.file, preview.url, preview.type)}
                  >
                    {/* Icon based on file type */}
                    {preview.type === 'pdf' ? (
                      <FileText size={16} className="text-red-500" />
                    ) : preview.type === 'excel' ? (
                      <FileText size={16} className="text-green-500" />
                    ) : preview.type === 'word' ? (
                      <FileText size={16} className="text-blue-500" />
                    ) : preview.type === 'csv' ? (
                      <FileText size={16} className="text-green-500" />
                    ) : preview.type === 'json' ? (
                      <FileText size={16} className="text-yellow-500" />
                    ) : (
                      <File size={16} className="text-gray-500" />
                    )}
                    <span className="text-xs text-gray-700 mt-1 truncate w-full text-center">
                      {preview.file.name.length > 10
                        ? `${preview.file.name.substring(0, 7)}...`
                        : preview.file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Display Info Tile if needed */}
      {showTile && <InfoTile onContactClick={() => console.log('Redirecting to contact page...')} onClose={() => setShowTile(false)} />}
  {/* Fixed prompt buttons at the bottom */}
{flowState !== "initial" && (
  <div 
    className="sticky w-full z-10 bg-none border-gray-200 px-4"
    style={{ 
      bottom: "0",
      paddingTop: "15px", 
      paddingBottom: "0px",
    }} 
  >
    <div className="md:flex md:flex-row md:items-center md:justify-center md:gap-3 px-4 pb-4 w-full relative">
      {/* Back button container */}
      {flowHistory.length > 0 && flowState !== "infrastructure-analysis" && (
        <div className="flex justify-center md:block mb-3 md:mb-0">
          <button
            onClick={() => {
              const newHistory = [...flowHistory];
              const previous = newHistory.pop();
              setFlowHistory(newHistory);
              setFlowState(previous);
            }}
            className="aspect-square w-10 h-10 flex items-center justify-center bg-white border border-teal-600 text-teal-700 rounded-full text-xs transition hover:bg-teal-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            title="Back"
          >
            ←
          </button>
        </div>
      )}

      {/* Buttons container - flex-col on mobile, normal flex row on desktop */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
        {currentButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            disabled={isLoading || isTyping || isFlowActive}
            className={`button-option whitespace-normal break-words justify-center w-full md:w-auto md:max-w-[320px] px-4 py-3 md:px-4 md:py-2.5 rounded-md text-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-center shadow-md ${button.id !== "contact" ? "bg-white border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white" : ""} ${button.className || ""}`}
            style={button.style || {}}
          >
            {button.text}
          </button>
        ))}
      </div>
    </div>
  </div>

)}


{/* Add padding at the bottom of the chat area to prevent text from appearing behind buttons */}
<style jsx global>{`
  .flex-1.p-2.md\\:p-4.overflow-auto.ios-height-fix {
    padding-bottom: ${flowState !== "initial" ? "60px" : "16px"};
  }
  @media (min-width: 768px) {
    .flex-1.p-2.md\\:p-4.overflow-auto.ios-height-fix {
      padding-bottom: ${flowState !== "initial" ? "70px" : "24px"};
    }
  }
    .chat-reset-mobile {
  width: 100vw !important;
  max-width: 100vw !important;
  min-width: 100vw !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
`}</style>
  </div>
);}