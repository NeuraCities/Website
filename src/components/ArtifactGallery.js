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

const ArtifactGallery = ({ artifacts, onSelectArtifact, onBack }) => {
  // Sort artifacts by timestamp, newest first
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // State to track hover
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white/40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 rounded-full flex items-center justify-center h-10 w-10 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors duration-200"
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold ml-4 text-teal-600">Artifacts</h2>
      </div>
      
      {/* Gallery content */}
      <div className="flex-1 overflow-auto p-4 bg-transparent">
        {sortedArtifacts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No artifacts available</p>
          </div>
        ) : (
          <div className="space-y-6 px-4">
            
            {sortedArtifacts.map(artifact => (
              <div
                key={artifact.id}
                className="w-full"
              >
                <button
                  onClick={() => onSelectArtifact(artifact.id)}
                  className={`w-full text-left py-2 px-4 rounded-md flex flex-col items-center shadow transition-all duration-200 ${
                    hoveredItem === artifact.id 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white text-teal-600 shadow-sm'
                  }`}
                  onMouseEnter={() => setHoveredItem(artifact.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="font-medium text-center text-sm">
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
    </div>
  );
};

export default ArtifactGallery;