// components/FullscreenWrapper.jsx
export default function FullscreenWrapper({ isFullscreen, toggleFullscreen, children }) {
    return (
      <div className="relative w-full h-full">
        {isFullscreen ? (
          <div className="absolute inset-0 z-50 bg-white overflow-auto rounded-xl p-4 shadow-xl">
            <button className="absolute top-2 right-2 z-50" onClick={toggleFullscreen}>
              <FullscreenExit />
            </button>
            {children}
          </div>
        ) : (
          <div className="p-4">
            <button className="absolute top-2 right-2 z-50" onClick={toggleFullscreen}>
              <Fullscreen />
            </button>
            {children}
          </div>
        )}
      </div>
    );xa
  }
  