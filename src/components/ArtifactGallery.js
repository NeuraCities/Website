import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

// Function to format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const ArtifactGallery = ({ artifacts, onSelectArtifact, onBack, showCreatedPrompt}) => {
  // Sort artifacts by timestamp, newest first
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // State to track hover
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div 
      className="h-full w-full flex flex-col overflow-hidden bg-white/40 border-2 rounded-md"
    >
      {/* Header */}
      <div className="p-2 sm:p-4 border-b border-coral flex items-center">
        <button
          onClick={onBack}
          className="p-1 sm:p-2 rounded-full flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors duration-200"
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base sm:text-lg font-semibold ml-2 sm:ml-4 text-teal-600">Artifacts</h2>
      </div>
      
      {/* Gallery content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 bg-transparent">
        {sortedArtifacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No artifacts available</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
            {sortedArtifacts.map(artifact => (
              <div
                key={artifact.id}
                className="w-full"
              >
                <button
                  onClick={() => onSelectArtifact(artifact.id)}
                  className={`w-full text-left py-2 px-3 sm:px-4 rounded-md flex flex-col items-center shadow transition-all duration-200 border border-coral ${
                    hoveredItem === artifact.id 
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white text-teal-600 shadow-sm'
                  }`}
                  onMouseEnter={() => setHoveredItem(artifact.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="font-medium text-center text-xs sm:text-sm">
                    {artifact.title || 'Untitled'}
                  </div>
                  <div className="flex items-center mt-1 text-center">
                    <span className="text-xs flex items-center opacity-80">
                      {formatDate(artifact.timestamp)}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show tip when we have exactly 2 artifacts */}
      {showCreatedPrompt && (
        <div className="bg-teal-50 border-t border-teal-200 p-2 text-xs text-center text-teal-700">
          Tip: Click on an artifact to view it
        </div>
      )}
    </div>
  );
};

export default ArtifactGallery;