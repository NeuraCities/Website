// MobileArtifactSheet.jsx
import { useEffect, useRef, useState } from "react";

export default function MobileArtifactSheet({
  isOpen,
  onClose,
  children
}) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [height, setHeight] = useState("50%");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - startY.current;
    setDragY(deltaY);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    } else if (dragY < -100 || isExpanded) {
      setHeight("100%");
      setIsExpanded(true);
    } else {
      setHeight("50%");
      setIsExpanded(false);
    }
    setDragY(0);
  };

  useEffect(() => {
    if (!isOpen) {
      setHeight("0");
    } else {
      setHeight("50%");
    }
  }, [isOpen]);

  return (
    <div
      ref={sheetRef}
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg transition-all duration-300 overflow-hidden ${isOpen ? "" : "pointer-events-none"}`}
      style={{ height, transform: `translateY(${dragY}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag handle */}
      <div className="flex justify-center py-2 cursor-pointer">
        <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
      </div>
      <div className="overflow-auto h-full px-4 pb-6">
        {children}
      </div>
    </div>
  );
}