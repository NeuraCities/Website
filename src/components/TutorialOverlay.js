"use client";
import React, { useState, useEffect, useRef } from "react";

const TutorialOverlay = ({ isVisible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef(null);
  const [, setIsReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (isMobile) {
        const readyTimer = setTimeout(() => {
          setIsReady(true);
        }, 1800); 
        return () => clearTimeout(readyTimer);
      } else {
        setIsReady(true);
      }
    } else {
      setIsReady(false);
    }
  }, [isVisible, isMobile]);

  const getSteps = () => {
    if (isMobile) {
      return [
      ];
    } else {
      return [
        {
          text: "Choose any to proceed",
          selector: ".button-option",
        },
        {
          text: "Click these to see generated results",
          selector: "button[class*='gap-1 text-xs bg-gradient-to-r']",
        },
        {
          text: "All generated results can be found here",
          selector: "button[aria-label='Back to Artifacts']",
        },
        {
          text: "Legend and Sources!",
          selector: ".mapboxgl-ctrl-layers, .legend-button",
        }
      ];
    }
  };

  const tutorialSteps = getSteps();

  const calculatePosition = (element, stepConfig) => {
    if (!element || !tooltipRef.current) {
      // Manual fallback if no target element — e.g., bottom center of screen
      return { top: window.innerHeight + 100, left: window.innerWidth / 2 - 100 };
    };

    const rect = element.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;

    let top = 0, left = 0;
    const stepText = stepConfig.text;

    if (isMobile) {
      switch (stepText) {
        case "Click these to see generated results":
          top = rect.top - tooltipHeight - 10;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "All generated results can be found here":
          top = rect.bottom - 320;
          left = rect.left + rect.width / 2 - tooltipWidth / 2 + 150;
          break;
          case "Adjust map size by dragging here":
            top = rect.top - tooltipHeight +500;
            left = rect.left + rect.width / 2 - tooltipWidth / 2; 
            break;
      }
    } else {
      switch (stepText) {
        case "Choose any to proceed":
          top = rect.top - tooltipHeight - 20;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "Click these to see generated results":
          top = rect.top - tooltipHeight - 25;
          left = rect.left + rect.width / 2 - tooltipWidth / 2 + 10;
          break;
        case "All generated results can be found here":
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - tooltipWidth / 2 + 10;
          break;
        case "Legend and Sources!":
            top = rect.bottom + -13;  
            left = rect.left + rect.width / 2 - tooltipWidth + 400;
          break;
        default:
          top = rect.bottom + 15;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }
    }

    return { top, left };
  };

  const findTargetElement = () => {
    if (currentStep >= tutorialSteps.length) return null;
    const step = tutorialSteps[currentStep];
    if (!step.selector) return null; // ← Skip if no selector
    const elements = document.querySelectorAll(step.selector);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const style = window.getComputedStyle(element);
      if (style.display !== "none" && style.visibility !== "hidden" && element.offsetParent !== null) {
        return element;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isVisible) return;
    const handleResize = () => {
      const element = findTargetElement();
      setTargetElement(element);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    const timerId = setTimeout(handleResize, 500);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timerId);
    };
  }, [isVisible, currentStep, isMobile]);

  useEffect(() => {
    if (!tooltipRef.current || !targetElement || !isVisible) return;
    const step = tutorialSteps[currentStep];
    requestAnimationFrame(() => {
      const position = calculatePosition(targetElement, step);
      setTooltipPosition(position);
    });
  }, [tooltipRef.current, targetElement, currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    const handleClick = (e) => {
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      handleNext();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isVisible, currentStep]);

  if (!isVisible || currentStep >= tutorialSteps.length) return null;
  const currentStepConfig = tutorialSteps[currentStep];

  const getArrowStyle = (stepConfig) => {
    const baseStyle = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
    };
    const stepText = stepConfig.text;

    if (isMobile) {
      switch (stepText) {
        case "These buttons will take you to the artifacts":
        case "Click these to see generated results":
          return { ...baseStyle, bottom: "-10px", left: "50%", transform: "translateX(-50%)", borderWidth: "10px 10px 0 10px", borderColor: "white transparent transparent transparent" };
        case "All generated results can be found here":
          return { ...baseStyle, top: "-10px", left: "50%", transform: "translateX(-50%)", borderWidth: "0 10px 10px 10px", borderColor: "transparent transparent white transparent" };
          case "Adjust map size by dragging here":
            return { ...baseStyle, bottom: "-10px", left: "50%", transform: "translateX(-50%)", borderWidth: "10px 10px 0 10px", borderColor: "white transparent transparent transparent" };
            default:
          return {};
      }
    } else {
      switch (stepText) {
        case "Choose any to proceed":
        case "Click these to see generated results":
          return { ...baseStyle, bottom: "-10px", left: "50%", transform: "translateX(-50%)", borderWidth: "10px 10px 0 10px", borderColor: "white transparent transparent transparent" };
        case "All generated results can be found here":
          return { ...baseStyle, top: "-10px", left: "50%", transform: "translateX(-50%)", borderWidth: "0 10px 10px 10px", borderColor: "transparent transparent white transparent" };
        case "Legend and Sources!":
          return { ...baseStyle, right: "-10px", top: "50%", transform: "translateY(-50%)", borderWidth: "10px 0 10px 10px", borderColor: "transparent transparent transparent white" };
        default:
          return {};
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-30 flex items-center justify-center">
      <div
        ref={tooltipRef}
        className={`absolute bg-white rounded-lg shadow-lg p-4 z-[10001] animate-bounce-gentle ${isMobile ? "max-w-[80%] text-sm" : "max-w-xs"}`}
        style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px`, maxWidth: '200px' }}
      >
        <div className="text-teal-600 font-medium mb-2">
          Tip {currentStep + 1} of {tutorialSteps.length}
        </div>
        <p className="text-gray-800">{currentStepConfig.text}</p>
        <div className="mt-3 flex justify-between gap-2">
          {currentStep > 0 && (
            <button className="px-4 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400 transition-colors" onClick={() => setCurrentStep(prev => prev - 1)}>Back</button>
          )}
          <button className="px-4 py-1 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition-colors" onClick={handleNext}>
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
        <div style={getArrowStyle(currentStepConfig)} />
      </div>
    </div>
  );
};

export default TutorialOverlay;
