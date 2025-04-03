"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Brain, Zap, Clipboard, Wand2, FastForward, BarChart, Map, FileText, Database, LineChart, Layers, FileSpreadsheet, Settings, FileImage, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResponseStep { 
  action: string; 
  icon: JSX.Element; 
  detail: string; 
}

interface Feature { 
  icon: JSX.Element; 
  title: string; 
  tagline: string; 
  description: string; 
  details: string[]; 
  prompt: string; 
  responseSteps: ResponseStep[]; 
  finalResponse: string; 
  outputArtifacts: string[]; 
  color: string; 
}

const FeatureSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>('timeWarper');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [currentResponseStep, setCurrentResponseStep] = useState(0);
  const [showFinalResponse, setShowFinalResponse] = useState(false);
  const router = useRouter();

  // Changed from NodeJS.Timeout to number for browser compatibility
  const typingRef = useRef<number | null>(null);
  const responseTimerRef = useRef<number | null>(null);
  const responseStepTimerRef = useRef<number | null>(null);

  // Wrap the features object in useMemo to prevent recreation on each render
  const features = useMemo<Record<string, Feature>>(() => ({
    timeWarper: {
      icon: <FastForward className="w-10 h-10" />,
      title: "Time Warper",
      tagline: "Planning at Warp Speed",
      description: "Complete complex planning cycles in days instead of months using plain language.",
      color: "from-closeC to-coral",
      details: [
        "Compress traditional planning timelines by 5-10x",
        "Generate realistic scenarios in minutes instead of weeks",
        "Respond to urgent planning needs with same-day deliverables",
        "Transform multi-meeting decision processes into single sessions"
      ],
      prompt: "Model three different zoning approaches and the projected outcomes",
      responseSteps: [
        { action: "Fetching geospatial data", icon: <Database />, detail: "Census, zoning, property values, and transportation networks" },
        { action: "Analyzing spatial patterns", icon: <Layers />, detail: "Density distribution, transit accessibility, land use patterns" },
        { action: "Generating scenario maps", icon: <Map />, detail: "Three zoning proposals with varying density allowances and mixed-use configurations" }
      ],
      finalResponse: "Scenario analysis complete with projected outcomes for traffic, density, and economic impact for each model.",
      outputArtifacts: ["Report.pdf", "Map.shp", "Density Projections.csv"]
    },
    deepPlanner: {
      icon: <Brain className="w-10 h-10" />,
      title: "Deep Planning Intelligence",
      tagline: "Beyond Basic Analysis",
      description: "Turn complex urban challenges into actionable insights with geospatial AI that understands planning context.",
      color: "from-closeS to-closeC",
      details: [
        "Discover hidden patterns in city dynamics that traditional analysis might miss",
        "Receive smart recommendations based on planning best practices",
        "Transform community feedback into quantifiable insights",
        "Automatically calculate spatial equity assessments for proposed changes"
      ],
      prompt: "Analyze how our new transit proposal impacts equity across neighborhoods",
      responseSteps: [
        { action: "Gathering demographic data", icon: <Database />, detail: "Census, income levels, and transportation dependency" },
        { action: "Mapping transit access", icon: <MapPin />, detail: "Current and proposed routes with walking distance analysis" },
        { action: "Running equity calculations", icon: <BarChart />, detail: "Service changes with demographic distributions and opportunity access" }
      ],
      finalResponse: "Identified 3 neighborhoods with reduced transit access. Recommending route adjustments to improve equity.",
      outputArtifacts: ["Equity Report.pdf", "Transit Maps.gdb", "Demographic.xlsx"]
    },
    knowledgeKeeper: {
      icon: <Clipboard className="w-10 h-10" />,
      title: "Institutional Memory",
      tagline: "Knowledge Preservation",
      description: "Preserve critical planning knowledge regardless of staff changes and access it instantly using natural language.",
      color: "from-cta/80 to-closeCTA",
      details: [
        "Extract insights from decades of planning documents in seconds",
        "Maintain continuity when team members transition",
        "Connect current projects to historical context automatically",
        "Build a living knowledge base that evolves with your organization"
      ],
      prompt: "What approaches have we tried for downtown revitalization in the past?",
      responseSteps: [
        { action: "Searching document archives", icon: <FileText />, detail: "Planning reports, meeting minutes, and maps (1990-2024)" },
        { action: "Extracting key initiatives", icon: <FileSpreadsheet />, detail: "Identified 5 revitalization programs with execution timelines" },
        { action: "Analyzing outcome data", icon: <LineChart />, detail: "Occupancy, business licenses, property values, pedestrians" }
      ],
      finalResponse: "5 initiatives from 1998-2023. Most successful: 2015 mixed-use incentive program, downtown occupancy - 22% increase.",
      outputArtifacts: ["Report.pdf", "Metrics.csv", "Historic Maps.png"]
    },
    workflowMagic: {
      icon: <Wand2 className="w-10 h-10" />,
      title: "Workflow Standardization",
      tagline: "Streamlined Processes",
      description: "Standardize your planning workflows and automate repetitive tasks with simple plain language instructions.",
      color: "from-closeP to-closeS",
      details: [
        "Standardize reporting formats and processes across departments",
        "Automate repetitive planning tasks with simple templates",
        "Create department-specific workflows that anyone can use",
        "Generate consistent reports and presentations in seconds"
      ],
      prompt: "Create a workflow for reviewing development proposals against our sustainability guidelines",
      responseSteps: [
        { action: "Analyzing current process", icon: <Settings />, detail: "Review procedures, sustainability guidelines, evaluation tasks" },
        { action: "Creating standardized templates", icon: <FileText />, detail: "Evaluation forms, scoring guide, sustainability metrics" },
        { action: "Building workflow", icon: <FileImage />, detail: "Step-by-step procedure with checklist, automated scoring, and report generation" }
      ],
      finalResponse: "Workflow ready! With evaluation templates, scoring calculation, and consistent reports for every proposal.",
      outputArtifacts: ["Template.docx", "Checklist.pdf", "Standard Procedure.pdf"]
    },
  }), []); // Empty dependency array means this will only be created once

  const startResponseStepAnimation = useCallback(() => {
    const steps = features[activeFeature].responseSteps;

    const animateNextStep = (stepIndex: number) => {
      if (stepIndex < steps.length) {
        setCurrentResponseStep(stepIndex);
        responseStepTimerRef.current = window.setTimeout(() => {
          animateNextStep(stepIndex + 1);
        }, 2000);
      } else {
        setShowFinalResponse(true);
      }
    };

    animateNextStep(0);
  }, [activeFeature, features]);

  // Memoize the function so it doesn't change on every render
  const startTypingAnimation = useCallback(() => {
    // Reset states
    setShowResponse(false);
    setShowFinalResponse(false);
    setCurrentResponseStep(0);
    setIsTyping(true);
    setDisplayText('');

    const currentPrompt = features[activeFeature].prompt;
    let i = 0;

    // Clear any existing timeouts
    if (typingRef.current) window.clearTimeout(typingRef.current);
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    if (responseStepTimerRef.current) window.clearTimeout(responseStepTimerRef.current);

    const typeNextChar = () => {
      if (i < currentPrompt.length) {
        setDisplayText(currentPrompt.substring(0, i + 1));
        i++;
        typingRef.current = window.setTimeout(typeNextChar, 40 + Math.random() * 30);
      } else {
        setIsTyping(false);
        responseTimerRef.current = window.setTimeout(() => {
          setShowResponse(true);
          startResponseStepAnimation();
        }, 800);
      }
    };

    // Start typing with a delay
    typingRef.current = window.setTimeout(typeNextChar, 600);
  }, [activeFeature, features, startResponseStepAnimation]);

  // Initialize animation when component mounts or active feature changes
  useEffect(() => {
    // Ensure clean start
    setIsTyping(false);
    setDisplayText('');
    setShowResponse(false);
    setShowFinalResponse(false);

    // Start animation with a slight delay
    const initTimer = window.setTimeout(() => {
      startTypingAnimation();
    }, 300);

    // Clean up timeouts
    return () => {
      window.clearTimeout(initTimer);
      if (typingRef.current) window.clearTimeout(typingRef.current);
      if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
      if (responseStepTimerRef.current) window.clearTimeout(responseStepTimerRef.current);
    };
  }, [activeFeature, startTypingAnimation]);

  const handleFeatureChange = (key: string) => {
    if (key === activeFeature) return; // Don't change if same feature

    setIsAnimating(true);

    // Clear all timeouts
    if (typingRef.current) window.clearTimeout(typingRef.current);
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    if (responseStepTimerRef.current) window.clearTimeout(responseStepTimerRef.current);

    // Reset states during animation
    setIsTyping(false);
    setDisplayText('');
    setShowResponse(false);
    setShowFinalResponse(false);

    setTimeout(() => {
      setActiveFeature(key);
      setIsAnimating(false);
    }, 300);
  };

  // Helper to return a dynamic icon based on artifact extension
  const getArtifactIcon = useCallback((artifact: string) => {
    if (artifact.endsWith('.pdf')) {
      return <FileText size={12} className="mr-1" />;
    } else if (artifact.endsWith('.csv') || artifact.endsWith('.xlsx')) {
      return <FileSpreadsheet size={12} className="mr-1" />;
    } else if (artifact.endsWith('.shp') || artifact.toLowerCase().includes('map')) {
      return <Map size={12} className="mr-1" />;
    } else {
      return <FileText size={12} className="mr-1" />;
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-neutral/50 to-neutral/50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-primary mb-2">Beyond Basic Tools</h2>
        <p className="text-lg text-center mb-8 text-secondary max-w-2xl mx-auto">
          Capabilities that fundamentally transform how you solve Planning challenges.
        </p>

        {/* Feature Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 max-w-4xl mx-auto">
          {Object.entries(features).map(([key, feature]) => (
            <button
              key={key}
              onClick={() => handleFeatureChange(key)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                activeFeature === key
                  ? `bg-gradient-to-br ${feature.color} text-white shadow-lg scale-105`
                  : 'bg-white text-secondary hover:bg-neutral shadow'
              }`}
            >
              <div className={`mb-2 transition-transform duration-300 ${activeFeature === key ? 'scale-110' : ''}`}>
                {React.cloneElement(feature.icon, { 
                  size: 28,
                  className: activeFeature === key ? 'text-white' : 'text-secondary'
                })}
              </div>
              <span className="font-medium text-sm text-center">{feature.title}</span>
              {activeFeature === key && (
                <span className="text-xs mt-1 opacity-80">{feature.tagline}</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Feature Display */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col md:flex-row">
            {/* Left Panel */}
            <div className={`w-full md:w-1/2 p-6 md:p-8 bg-gradient-to-br ${features[activeFeature].color} text-white`}>
              <div className="max-w-md mx-auto">
                <div className="flex items-center mb-2">
                  <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm mr-4">
                    {features[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                    <p className="text-white/70 text-sm uppercase tracking-wider font-medium">{features[activeFeature].tagline}</p>
                  </div>
                </div>
                
                <p className="text-white/90 text-lg mb-2 leading-relaxed">
                  {features[activeFeature].description}
                </p>
                
                {/* Prompt with typing effect - Added key prop for forced re-render */}
                <div className="bg-black/20 p-4 rounded-lg backdrop-blur-sm mb-2" key={`prompt-${activeFeature}`}>
                  <div className="flex items-center mb-2">
                    <Zap size={16} className="mr-2" />
                    <span className="text-sm font-medium">Just Say...</span>
                  </div>
                  <div className="font-mono text-white/90 text-sm min-h-[3rem]">
                    {displayText}
                    {isTyping && <span className="inline-block w-2 h-4 bg-white/80 ml-1 animate-pulse"></span>}
                  </div>
                </div>
                
                {/* Response section - Added clearer visibility control */}
                <div 
                  className={`bg-white/10 rounded-lg p-4 transition-all duration-500 ${
                    showResponse 
                    ? 'opacity-100 max-h-[600px]' 
                    : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                  key={`response-${activeFeature}`}
                >
                  {features[activeFeature].responseSteps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`transition-all duration-300 ${
                        index <= currentResponseStep ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                      }`}
                    >
                      <div className="flex items-center mb-2 text-sm text-white/80">
                        <span className="flex items-center">
                          {React.cloneElement(step.icon, { size: 16, className: "mr-2" })}
                          <span className="font-medium">{step.action}</span>
                        </span>
                        <span className={`ml-2 flex items-center space-x-1 ${index < currentResponseStep ? 'hidden' : ''}`}>
                          <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse"></span>
                          <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse delay-100"></span>
                          <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse delay-200"></span>
                        </span>
                        <span className={`ml-2 ${index < currentResponseStep ? '' : 'hidden'}`}>✓</span>
                      </div>
                      <div className="border-l-2 border-white/30 pl-3 mt-1 mb-3 text-sm text-white/80">
                        <p>{step.detail}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Final response */}
                  <div 
                    className={`border-t border-white/20 pt-3 mt-2 transition-all duration-500 ${
                      showFinalResponse 
                      ? 'opacity-100 max-h-[300px]' 
                      : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  >
                    <p className="text-white font-medium mb-2">{features[activeFeature].finalResponse}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {features[activeFeature].outputArtifacts.map((artifact, index) => (
                        <span key={index} className="bg-white/20 text-white text-xs py-1 px-2 rounded-full flex items-center">
                          {getArtifactIcon(artifact)}
                          {artifact}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white">
              <div className="max-w-md mx-auto">
                <h4 className="text-lg font-semibold text-primary mb-6">How This Changes Planning</h4>
                <ul className="space-y-4">
                  {features[activeFeature].details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 bg-gradient-to-br ${features[activeFeature].color}`}>
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-secondary font-medium">{detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10 pt-6 border-t border-neutral">
                  <div className="flex justify-between items-center">
                    <span className="text-md text-secondary/90">Ready to transform your planning team?</span>
                    <button 
                    onClick={() => router.push('/demo', { scroll: true })}
                    className={`px-5 py-2 rounded-lg text-white bg-gradient-to-r ${features[activeFeature].color} hover:scale-105 hover:shadow-lg transition-all`}>
                      See It In Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;