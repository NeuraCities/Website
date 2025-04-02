import React, { useState } from 'react';
import { ArrowLeft, Clock, X } from 'lucide-react';

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

// Fullscreen Artifact Navigation component
const FullscreenArtifactNavigation = ({ 
  artifacts, 
  currentArtifactId, 
  onShowGallery
}) => {
  // Find the current artifact
  const currentArtifact = artifacts.find(a => a.id === currentArtifactId);
  
  // If no artifacts or no current artifact, don't render navigation
  if (!artifacts.length || !currentArtifact) {
    return null;
  }

  return (
    <div className="fullscreen-artifact-navigation p-3 bg-white border-b flex items-center justify-between fixed top-0 left-0 right-0 z-40">
      <button
        onClick={onShowGallery}
        className="p-2 rounded-full flex items-center justify-center"
        aria-label="Back to Artifacts"
        title="Back to Artifacts"
        style={{
          height: '2.5rem',
          width: '2.5rem',
          color: '#008080',
          backgroundColor: 'white',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#008080';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.color = '#008080';
        }}
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className="text-sm font-medium text-gray-800">
        {currentArtifact.title || 'Untitled Artifact'}
      </div>
      
      <div className="w-10"></div> {/* Spacer for alignment */}
    </div>
  );
};

// Fullscreen Artifact Gallery component
const FullscreenArtifactGallery = ({ artifacts, onSelectArtifact, onBack }) => {
  // Sort artifacts by timestamp, newest first
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // State to track hover
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 rounded-full flex items-center justify-center"
            aria-label="Back"
            title="Back"
            style={{
              height: '2.5rem',
              width: '2.5rem',
              color: '#008080',
              backgroundColor: 'white',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#008080';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#008080';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 ml-4">Artifacts</h2>
        </div>
        
        <button 
          onClick={onBack}
          className="p-2 rounded-full flex items-center justify-center"
          aria-label="Close"
          title="Close"
          style={{
            height: '2.5rem',
            width: '2.5rem',
            color: '#008080',
            backgroundColor: 'white',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#008080';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#008080';
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Gallery content */}
      <div className="flex-1 overflow-auto p-6">
        {sortedArtifacts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No artifacts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sortedArtifacts.map(artifact => (
              <div
                key={artifact.id}
                className="w-full"
              >
                <button
                  onClick={() => onSelectArtifact(artifact.id)}
                  className="w-full text-left py-3 px-5 rounded-lg flex flex-col items-center"
                  style={{
                    backgroundColor: hoveredItem === artifact.id ? '#008080' : 'white',
                    color: hoveredItem === artifact.id ? 'white' : '#4a5568',
                    border: 'none',
                    boxShadow: hoveredItem === artifact.id 
                      ? '0 4px 8px rgba(0, 0, 0, 0.15)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={() => setHoveredItem(artifact.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="font-medium text-center">
                    {artifact.title || 'Untitled'}
                  </div>
                  <div className="flex items-center mt-2 text-center">
                    <span className="text-xs flex items-center opacity-80">
                      <Clock size={12} className="inline mr-1" />
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

export { FullscreenArtifactNavigation, FullscreenArtifactGallery };