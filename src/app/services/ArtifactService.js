/**
 * Service for managing artifacts in localStorage
 */
const ArtifactService = {
    /**
     * Save an artifact to localStorage
     * 
     * @param {string} conversationId - ID of the current conversation
     * @param {Object} artifact - Artifact to save
     * @param {string} artifact.id - Unique ID of the artifact
     * @param {string} artifact.type - Type of artifact (map, report, extract, chart)
     * @param {string} artifact.title - Display title for the artifact
     * @param {string} artifact.content - HTML content of the artifact
     * @param {string} artifact.timestamp - Creation timestamp
     * @returns {Object} The saved artifact
     */
    saveArtifact: (conversationId, artifact) => {
      if (!conversationId) {
        console.error("No conversation ID provided");
        return null;
      }
  
      try {
        // Create artifact with required fields
        const artifactToSave = {
          id: artifact.id || `artifact-${Date.now()}`,
          type: artifact.type || 'unknown',
          title: artifact.title || `${artifact.type} ${new Date().toLocaleTimeString()}`,
          content: artifact.content || '',
          timestamp: artifact.timestamp || new Date().toISOString(),
          conversationId
        };
  
        // Get existing artifacts for this conversation
        const existingArtifacts = ArtifactService.getArtifactsForConversation(conversationId);
        
        // Add new artifact (or replace if ID already exists)
        const artifactIndex = existingArtifacts.findIndex(a => a.id === artifactToSave.id);
        if (artifactIndex !== -1) {
          existingArtifacts[artifactIndex] = artifactToSave;
        } else {
          existingArtifacts.push(artifactToSave);
        }
        
        // Get all artifacts
        const allArtifacts = ArtifactService.getAllArtifacts();
        
        // Update artifacts for this conversation
        allArtifacts[conversationId] = existingArtifacts;
        
        // Save back to localStorage
        localStorage.setItem('chatArtifacts', JSON.stringify(allArtifacts));
        
        // Save current artifact ID for this conversation
        localStorage.setItem(`currentArtifact_${conversationId}`, artifactToSave.id);
        
        return artifactToSave;
      } catch (error) {
        console.error("Error saving artifact to localStorage:", error);
        return null;
      }
    },
  
    /**
     * Get all artifacts from localStorage
     * 
     * @returns {Object} Map of conversation IDs to arrays of artifacts
     */
    getAllArtifacts: () => {
      try {
        const storedArtifacts = localStorage.getItem('chatArtifacts');
        return storedArtifacts ? JSON.parse(storedArtifacts) : {};
      } catch (error) {
        console.error("Error getting artifacts from localStorage:", error);
        return {};
      }
    },
  
    /**
     * Get artifacts for a specific conversation
     * 
     * @param {string} conversationId - ID of the conversation
     * @returns {Array} Array of artifacts for this conversation
     */
    getArtifactsForConversation: (conversationId) => {
      if (!conversationId) return [];
      
      try {
        const allArtifacts = ArtifactService.getAllArtifacts();
        return allArtifacts[conversationId] || [];
      } catch (error) {
        console.error("Error getting artifacts for conversation:", error);
        return [];
      }
    },
  
    /**
     * Get the current artifact ID for a conversation
     * 
     * @param {string} conversationId - ID of the conversation
     * @returns {string|null} ID of the current artifact or null if none
     */
    getCurrentArtifactId: (conversationId) => {
      if (!conversationId) return null;
      
      try {
        return localStorage.getItem(`currentArtifact_${conversationId}`);
      } catch (error) {
        console.error("Error getting current artifact ID:", error);
        return null;
      }
    },
  
    /**
     * Set the current artifact ID for a conversation
     * 
     * @param {string} conversationId - ID of the conversation
     * @param {string} artifactId - ID of the artifact to set as current
     */
    setCurrentArtifactId: (conversationId, artifactId) => {
      if (!conversationId) return;
      
      try {
        localStorage.setItem(`currentArtifact_${conversationId}`, artifactId);
      } catch (error) {
        console.error("Error setting current artifact ID:", error);
      }
    },
  
    /**
     * Get an artifact by ID
     * 
     * @param {string} conversationId - ID of the conversation
     * @param {string} artifactId - ID of the artifact to get
     * @returns {Object|null} The artifact or null if not found
     */
    getArtifactById: (conversationId, artifactId) => {
      if (!conversationId || !artifactId) return null;
      
      try {
        const artifacts = ArtifactService.getArtifactsForConversation(conversationId);
        return artifacts.find(a => a.id === artifactId) || null;
      } catch (error) {
        console.error("Error getting artifact by ID:", error);
        return null;
      }
    },
  
    /**
     * Delete an artifact
     * 
     * @param {string} conversationId - ID of the conversation
     * @param {string} artifactId - ID of the artifact to delete
     * @returns {boolean} True if deleted successfully
     */
    deleteArtifact: (conversationId, artifactId) => {
      if (!conversationId || !artifactId) return false;
      
      try {
        const allArtifacts = ArtifactService.getAllArtifacts();
        const conversationArtifacts = allArtifacts[conversationId] || [];
        
        // Filter out the artifact to delete
        const updatedArtifacts = conversationArtifacts.filter(a => a.id !== artifactId);
        
        // Update localStorage
        allArtifacts[conversationId] = updatedArtifacts;
        localStorage.setItem('chatArtifacts', JSON.stringify(allArtifacts));
        
        // If this was the current artifact, set a new current artifact
        const currentArtifactId = ArtifactService.getCurrentArtifactId(conversationId);
        if (currentArtifactId === artifactId && updatedArtifacts.length > 0) {
          ArtifactService.setCurrentArtifactId(conversationId, updatedArtifacts[0].id);
        }
        
        return true;
      } catch (error) {
        console.error("Error deleting artifact:", error);
        return false;
      }
    }
  };
  
  export default ArtifactService;