// app/components/FileUploadButton.js
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function FileUploadButton({ onFileSelect, disabled = false, className = "" }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);

      // Call the callback with the selected file(s)
      onFileSelect(files);

      // Reset the input so the same file can be selected again
      e.target.value = null;

      // Reset uploading state after a short delay
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  // Trigger the file input click when the button is clicked
  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mouse event handlers for hover effect
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.geojson,.kml"
        className="hidden"
        disabled={disabled}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${className} flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
        disabled={disabled}
        title="Upload file"
      >
        <Upload
          size={20}
          className={isUploading ? "animate-pulse" : ""}
        />
      </button>
    </>
  );
}