import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ArtifactNavigation = ({ 
  artifacts,
  currentArtifactId,

  onShowGallery,

  isMobile
}) => {
  // Find the current artifact
  const currentArtifact = artifacts.find(a => a.id === currentArtifactId);
  
  // If no artifacts or no current artifact, don't render navigation
  if (!artifacts.length || !currentArtifact) {
    return null;
  }

  return (
    <div className={`p-2 bg-white border-b flex items-center justify-between relative ${isMobile ? 'mt-0' : ''}`}
         style={{ zIndex: 20 }}>
      <div className="flex flex-col items-start gap-1 relative">
        <button
          onClick={onShowGallery}
          className="p-2 rounded-full flex items-center justify-center h-10 w-10 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors duration-200"
          aria-label="Back to Artifacts"
          title="Back to Artifacts"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative">
        



</div>


      </div>
  
      <div className="text-sm font-medium text-gray-800 truncate max-w-[50%]">
        {currentArtifact.title || 'Untitled Artifact'}
      </div>
  
      <div className="w-10" />
    </div>
  );
};

export default ArtifactNavigation;