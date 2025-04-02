import { useState } from "react";
import { X } from "lucide-react";

export default function SaveMapDialog({ isOpen, onClose, onSave, defaultName = "" }) {
  const [mapName, setMapName] = useState(defaultName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mapName.trim()) {
      setError("Please enter a name for the map");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSave(mapName);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to save map");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-coral px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-medium">Save Map</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="mapName" className="block text-sm font-medium text-gray-700 mb-1">
              Map Name
            </label>
            <input
              type="text"
              id="mapName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter a name for your map"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral/50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-coral border border-transparent rounded-md hover:bg-coral/90 focus:outline-none focus:ring-2 focus:ring-coral/50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Map"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}