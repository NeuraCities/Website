// app/components/ShareDialog.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Mail, Copy, Check, X } from 'lucide-react';

export default function ShareDialog({
  isOpen,
  onClose,
  onShare,
  conversationName
}) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  // Validate email input
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(email));
  }, [email]);

  // Auto-focus the input field when the dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };

    // Handle escape key
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [handleClose, isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isValid) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onShare(email);
        onClose();
      }, 200);
    }
  };

  // Handle copy link functionality
  const handleCopyLink = () => {
    // In a real app, you'd generate a sharing link here
    const shareLink = `https://your-app.com/shared-chat/${Date.now()}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="fixed inset-0 transition-opacity"
        style={{
          animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.3s ease-out forwards'
        }}
        onClick={handleClose}
      ></div>

      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg overflow-hidden shadow-xl transform transition-all"
        style={{
          animation: isClosing
            ? 'dialogZoomOut 0.2s ease-out forwards'
            : 'dialogZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200" style={{ backgroundColor: '#2C3E50' }}>
          <div className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" style={{ color: 'white' }} />
            <h3 className="text-lg font-medium" style={{ color: 'white' }}>Share Chat</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-700/30 transition-colors"
          >
            <X size={18} style={{ color: 'white' }} />
          </button>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Chat name display */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <p className="text-sm text-gray-500">Sharing:</p>
            <p className="text-sm font-medium truncate" style={{ color: '#2C3E50' }} title={conversationName}>
              {conversationName.length > 40 ? `${conversationName.substring(0, 40)}...` : conversationName}
            </p>
          </div>

          {/* Email input form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <label htmlFor="email-input" className="block text-sm font-medium mb-1" style={{ color: '#34495E' }}>
              Share via email:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-input"
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border rounded-md"
                style={{
                  borderColor: isValid ? 'rgba(0, 128, 128, 0.4)' : 'rgba(209, 213, 219, 1)',
                  boxShadow: isValid ? '0 0 0 1px rgba(0, 128, 128, 0.1)' : 'none',
                }}
                placeholder="Enter recipient's email"
              />
              {isValid && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Check className="h-5 w-5" style={{ color: '#008080' }} />
                </div>
              )}
            </div>
          </form>

          {/* Or divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Copy link button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              {isCopied ? (
                <>
                  <Check className="h-5 w-5 mr-2" style={{ color: '#008080' }} />
                  <span style={{ color: '#008080' }}>Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2 text-gray-400" />
                  <span style={{ color: '#2C3E50' }}>Copy share link</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Footer with action buttons */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
            style={{ color: '#2C3E50' }}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{
              backgroundColor: isValid ? '#008080' : 'rgba(0, 128, 128, 0.4)',
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
            onClick={() => isValid && handleSubmit()}
            disabled={!isValid}
          >
            Share
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes dialogZoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes dialogZoomOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}