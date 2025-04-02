import React, { useState, useEffect, useRef } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";

export default function FileViewerModal({
  isOpen,
  onClose,
  file,
  fileUrl,
  fileType
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fileContent, setFileContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle clicks outside modal to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling of body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Read file content
  useEffect(() => {
    if (!isOpen || !file) return;

    setIsLoading(true);
    setError(null);
    setFileContent(null);

    const readFile = async () => {
      try {
        // For images, we already have the URL
        if (fileType === 'image') {
          setFileContent(fileUrl);
          setIsLoading(false);
          return;
        }

        // For PDFs, we can show it in an iframe
        if (fileType === 'pdf') {
          setFileContent(fileUrl);
          setIsLoading(false);
          return;
        }

        // For text-based files, read the content
        if (fileType === 'csv' || fileType === 'json' || fileType === 'txt' ||
          file.type.includes('text') || file.name.endsWith('.csv') ||
          file.name.endsWith('.json') || file.name.endsWith('.geojson') ||
          file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;

            // Try to format JSON if it looks like JSON
            if (fileType === 'json' || file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
              try {
                const parsedData = JSON.parse(content);
                setFileContent({
                  type: 'json',
                  data: JSON.stringify(parsedData, null, 2)  // Pretty print
                });
              } catch {
                setFileContent({
                  type: 'text',
                  data: content
                });
              }
            } else {
              // For CSV or plain text, just show the content
              setFileContent({
                type: 'text',
                data: content
              });
            }
            setIsLoading(false);
          };

          reader.onerror = () => {
            setError('Error reading file');
            setIsLoading(false);
          };

          reader.readAsText(file);
          return;
        }

        // For Excel files
        if (fileType === 'excel' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          setFileContent({
            type: 'unsupported',
            message: 'Excel file preview not available. Please download the file to view it.'
          });
          setIsLoading(false);
          return;
        }

        // For Word documents
        if (fileType === 'word' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
          setFileContent({
            type: 'unsupported',
            message: 'Word document preview is not available. Please download the file to view it.'
          });
          setIsLoading(false);
          return;
        }

        // Default fallback - show file info
        setFileContent({
          type: 'unknown',
          message: 'This file type cannot be previewed'
        });
        setIsLoading(false);
      } catch (error) {
        setError(`Error processing file: ${error.message}`);
        setIsLoading(false);
      }
    };

    readFile();
  }, [isOpen, file, fileType, fileUrl]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Handle download
  const handleDownload = () => {
    if (!file || !fileUrl) return;

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Determine content based on file type
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="ml-4 text-lg">Loading file content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleDownload}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            Download file instead
          </button>
        </div>
      );
    }

    if (!fileContent) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">No preview available</p>
        </div>
      );
    }

    // Image content
    if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={fileContent}
            alt={file?.name || 'Image preview'}
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
      );
    }

    // PDF content
    if (fileType === 'pdf') {
      return (
        <iframe
          src={fileContent}
          className="w-full h-full border-0"
          title={file?.name || 'PDF preview'}
        />
      );
    }

    // JSON content
    if (fileContent.type === 'json') {
      return (
        <div className="bg-gray-900 text-white p-4 rounded-md overflow-auto max-h-[70vh]">
          <pre className="text-sm">{fileContent.data}</pre>
        </div>
      );
    }

    // Text content (including CSV)
    if (fileContent.type === 'text') {
      return (
        <div className="bg-white p-4 rounded-md overflow-auto max-h-[70vh] border border-gray-200">
          <pre className="text-sm whitespace-pre-wrap">{fileContent.data}</pre>
        </div>
      );
    }

    // Unsupported content
    if (fileContent.type === 'unsupported' || fileContent.type === 'unknown') {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-medium mb-2">{file?.name}</h3>
          <p className="text-gray-600 mb-4">{fileContent.message}</p>
          <button
            onClick={handleDownload}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            Download
          </button>
        </div>
      );
    }

    // Fallback
    return (
      <div className="text-center p-6">
        <p>Preview not available</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative bg-gray-100 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-200 rounded-t-lg">
          <h3 className="text-lg font-medium truncate max-w-md">
            {file?.name || 'File preview'}
          </h3>
          <div className="flex items-center space-x-2">
            {(fileType === 'image') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-full hover:bg-gray-300 text-gray-700"
                  title="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-full hover:bg-gray-300 text-gray-700"
                  title="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full hover:bg-gray-300 text-gray-700"
              title="Download file"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-300 text-gray-700"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}