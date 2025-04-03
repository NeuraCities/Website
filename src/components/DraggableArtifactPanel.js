import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const DraggableArtifactPanel = ({ 
  isOpen, 
  onClose, 
  children,
  title = "",
  initialHeight = 32 // Initial height in percentage (0-100)
}) => {
  const [panelHeight, setPanelHeight] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(initialHeight);
  const panelRef = useRef(null);

  // Reset height when panel opens
  useEffect(() => {
    if (isOpen) {
      setPanelHeight(initialHeight);
      
      // Resize map when panel first opens
      setTimeout(() => {
        if (window.resizeActiveMap) {
          window.resizeActiveMap();
        }
      }, 300); // Wait for animation to complete
    }
  }, [isOpen, initialHeight]);

  // Trigger map resize when panel height changes
  useEffect(() => {
    if (isOpen && !isDragging) {
      // Only trigger resize after dragging stops to avoid constant resizing
      setTimeout(() => {
        if (window.resizeActiveMap) {
          window.resizeActiveMap();
        }
      }, 100);
    }
  }, [panelHeight, isDragging, isOpen]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(panelHeight);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = e.touches[0].clientY - startY;
    const windowHeight = window.innerHeight;
    
    // Calculate new height (inverse of drag direction)
    const newHeightPercentage = startHeight - (deltaY / windowHeight * 100);
    
    // Constrain between 15% (handle only) and MAX_HEIGHT_VH (to leave space for nav)
    const MAX_HEIGHT_VH = 85; // Maximum height to avoid overlapping with nav bar
    const constrainedHeight = Math.max(15, Math.min(MAX_HEIGHT_VH, newHeightPercentage));
    setPanelHeight(constrainedHeight);
    
    // If user drags below 20%, we'll consider it a "close" gesture
    if (constrainedHeight <= 20 && deltaY > 50) {
      onClose();
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to common positions
    if (panelHeight < 25) {
      setPanelHeight(15); // Minimized
    } else if (panelHeight > 75) {
      setPanelHeight(79); // Expanded
    } else {
      setPanelHeight(50); // Default
    }
    
    // Trigger map resize after snapping is complete
    setTimeout(() => {
      if (window.resizeActiveMap) {
        window.resizeActiveMap();
      }
    }, 350); // Wait for the snap animation to complete
  };

  // Style for the panel container
  const panelStyle = {
    height: `${panelHeight}vh`,
    transition: isDragging ? 'none' : 'height 0.3s ease-out'
  };

  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-lg flex flex-col"
      style={panelStyle}
      ref={panelRef}
    >
      {/* Drag handle */}
      <div 
        className="w-full h-10 flex items-center justify-center cursor-grab active:cursor-grabbing relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        id="draggable-panel-header"
      >
        <div className="w-8 h-1 bg-gray-300 rounded-full my-1"></div>
        {title && <div className="absolute left-0 right-0 text-center font-medium text-sm px-10 truncate">{title}</div>}
        <button
          onClick={onClose}
          className="absolute right-2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Content container with scrolling */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default DraggableArtifactPanel;