import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Map, Database, Cloud,
  Command, Layers, Palette, Settings,
  BrainCircuit, CheckCircle, Share2, Users, ArrowRight,
  Zap, Globe,
  MapIcon,
  GitMerge,
  BarChart2,
  CheckCircle2
} from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as LeafletMap } from 'leaflet';

const useSteppedAnimationWithResetDelay = (
  totalSteps: number,
  normalDelay: number = 2000,
  resetDelay: number = 100
) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const delay = step === totalSteps - 1 ? resetDelay : normalDelay;
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, delay);
    return () => clearTimeout(timer);
  }, [step, totalSteps, normalDelay, resetDelay]);
  return step;
};

const Typewriter = ({
  text,
  speed = 50,
  className = '',
}: {
  text: string;
  speed?: number;
  className?: string;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span className={className}>
      {displayedText}
      <span className="border-r border-gray-500 ml-1 animate-pulse" />
    </span>
  );
};

const AnimatedMapping = () => {
  const step = useSteppedAnimationWithResetDelay(6, 2000, 100);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<LeafletMap | null>(null);
  const randomPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const mapVisibleRef = useRef<boolean>(false);

  // Generate a fixed set of random points (once)
  useEffect(() => {
    if (randomPointsRef.current.length === 0) {
      randomPointsRef.current = Array.from({ length: 10 }, () => ({
        lat: 30.2672 + (Math.random() - 0.5) * 0.04,
        lng: -97.7431 + (Math.random() - 0.5) * 0.04,
      }));
    }
  }, []);
  // Check if the map visibility state has changed
  useEffect(() => {
    const isMapVisible = step >= 2 && step < 5;
    
    if (isMapVisible !== mapVisibleRef.current) {
      mapVisibleRef.current = isMapVisible;
      
      // Only update key when map is about to become visible
      if (isMapVisible) {
        setMapKey(prev => prev + 1);
      }
    }
  }, [step]);

  return (
    <div className="w-full h-72 relative bg-gradient-to-br from-white to-gray-100 rounded-xl p-6 overflow-hidden shadow-xl">
      {/* Command Input */}
      <div
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 transition-all duration-200 ${
          step > 0 && step < 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 border border-blue-200 hover:shadow-2xl transition-shadow">
          <Command className="w-5 h-5 text-blue-500 animate-pulse" />
          <div className="w-60 h-7 bg-gray-100 rounded-full relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-100 to-blue-50 transition-all duration-1000 ease-in-out"
              style={{ width: '100%' }}
            />
            <div className="absolute inset-y-0 left-3 flex items-center text-xs text-gray-500">
              {step === 1 ? (
                <Typewriter
                  text="Show recent accidents in Austin"
                  speed={50}
                  className="whitespace-nowrap"
                />
              ) : step >= 2 && step < 5 ? (
                "Show recent accidents in Austin"
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Conditionally render the Map Wrapper only when visible */}
      {step >= 2 && step < 5 && (
        <div
          key={`map-wrapper-${mapKey}`}
          className="absolute left-1/2 transition-all duration-700 top-20 opacity-100 scale-100"
          style={{ transform: 'translateX(-50%)', width: '90%', height: '160px' }}
        >
          <MapContainer
            key={`map-${mapKey}`}
            center={[30.2672, -97.7431]}
            zoom={13}
            scrollWheelZoom={false}
            style={{
              height: '100%',
              width: '100%',
              borderRadius: '0.75rem',
              position: 'relative'
            }}
            ref={mapRef}
          > 
            <TileLayer
              attribution='&copy; <a href="https://cartocdn.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {randomPointsRef.current.map((point, i) => (
              <CircleMarker
                key={i}
                center={[point.lat, point.lng]}
                radius={4}
                pathOptions={{ color: '#FF5733', fillColor: '#FF5733', fillOpacity: 0.8 }}
                className="animate-pulse"
              />
            ))}
          </MapContainer>
        </div>
      )}

      {/* Tools Panel */}
      <div
        className={`absolute transition-all duration-700 ${
          step >= 2 && step < 5 ? 'bottom-6 opacity-100 translate-y-0' : 'bottom-0 opacity-0 translate-y-10'
        }`}
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-4 border border-gray-200">
          {[
            { Icon: Layers, color: 'text-blue-500' },
            { Icon: Palette, color: 'text-purple-500' },
            { Icon: MapIcon, color: 'text-orange-500' },
            { Icon: Settings, color: 'text-green-500' },
          ].map(({ Icon, color }, i) => (
            <div
              key={i}
              className="transition-transform duration-200 hover:scale-125 cursor-pointer"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const useAnimationController = (totalSteps = 4, duration = 2000, autoPlay = true) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, duration);
    
    return () => clearInterval(interval);
  }, [totalSteps, duration, isPlaying]);
  
  const playPause = () => setIsPlaying(!isPlaying);
  const reset = () => setStep(0);
  const goToStep = (newStep: number) => setStep(newStep % totalSteps);
  
  return { step, isPlaying, playPause, reset, goToStep };
};

type Particle = {
  x: number;       // initial horizontal position (%)
  y: number;       // initial vertical position (%)
  size: number;    // particle diameter (px)
  speed: number;   // speed factor for movement
  angle: number;   // initial movement angle (degrees)
  opacity: number; // opacity (0 to 1)
  color: string;   // particle color (hex)
};

const AnimatedDataRetrieval = () => {
  // Generate particles once
  const particlesRef = useRef<Particle[]>([]);
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 25 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * 360,
        opacity: 0.2 + Math.random() * 0.5,
        color: ['#60A5FA', '#A78BFA', '#22D3EE', '#5EEAD4'][Math.floor(Math.random() * 4)]
      }));
    }
  }, []);

  // Continuous animation loop
  const [animationTime, setAnimationTime] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      setAnimationTime(progress);
      requestAnimationFrame(animate);
    };
    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Data sources with 6 types (including Database)
  const dataSources = [
    { Icon: Map, label: 'GIS Data', color: 'text-green-500', bg: 'bg-green-100', angle: 0 },
    { Icon: FileText, label: 'PDFs', color: 'text-red-500', bg: 'bg-red-100', angle: 60 },
    { Icon: FileText, label: 'Word', color: 'text-blue-500', bg: 'bg-blue-100', angle: 120 },
    { Icon: Database, label: 'Database', color: 'text-yellow-500', bg: 'bg-yellow-100', angle: 180 },
    { Icon: Cloud, label: 'Cloud', color: 'text-indigo-500', bg: 'bg-indigo-100', angle: 240 },
    { Icon: Globe, label: 'Websites', color: 'text-purple-500', bg: 'bg-purple-100', angle: 300 },
  ];

  // Orbit configuration: complete a full rotation every 20 seconds.
  const rotationSpeed = (2 * Math.PI) / 20; // radians per second
  const orbitRadius = 80; // pixels

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Particle Background */}
      {particlesRef.current.map((p, i) => {
        const t = animationTime / 1000; // convert ms to seconds
        const radius = 10 * Math.sin(t * p.speed);
        const rad = (p.angle * Math.PI) / 180 + t * p.speed;
        const dx = radius * Math.cos(rad);
        const dy = radius * Math.sin(rad);
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `calc(${p.x}% + ${dx}px)`,
              top: `calc(${p.y}% + ${dy}px)`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.opacity,
            }}
          />
        );
      })}

      {/* Central Data Hub (BrainCircuit Icon) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-blue-400 opacity-20 animate-ping"></div>
          </div>
          <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse" />
        </div>
      </div>

      {/* Orbiting Data Source Icons */}
      {dataSources.map((source, index) => {
        const initialAngleRad = (source.angle * Math.PI) / 180;
        const dynamicAngle = initialAngleRad + (animationTime / 1000) * rotationSpeed;
        const xOffset = orbitRadius * Math.cos(dynamicAngle);
        const yOffset = orbitRadius * Math.sin(dynamicAngle);

        return (
          <div
            key={index}
            className="absolute flex flex-col items-center"
            style={{
              left: `calc(50% + ${xOffset}px)`,
              top: `calc(50% + ${yOffset}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`p-2 rounded-full ${source.bg} shadow-lg`}>
              <source.Icon className={`w-8 h-8 ${source.color}`} />
            </div>
            <span className="mt-2 text-sm font-medium text-secondary">{source.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const AnimatedWorkflow = () => {
  // Using a 6-step cycle so the final state stays visible a bit longer.
  const { step } = useAnimationController(6);

  // Define three workflow steps (Input, Process, Optimize).
  const workflowSteps = [
    { Icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Input' },
    { Icon: BrainCircuit, color: 'text-green-500', bg: 'bg-green-100', label: 'Process' },
    { Icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Optimize' },
  ];

  return (
    <div className="w-full h-64 relative bg-gradient-to-br from-white to-gray-100 rounded-xl p-4 overflow-hidden shadow-xl">
      {/* Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute w-full h-12 left-0 bottom-0 opacity-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,50 350,0 500,30 C650,60 750,10 900,20 C1050,30 1200,0 1200,0 V120 H0 V0 Z"
            className="fill-cyan-400 opacity-20 animate-wave"
          />
          <path
            d="M0,10 C150,60 350,10 500,40 C650,70 750,20 900,30 C1050,40 1200,10 1200,10 V120 H0 V10 Z"
            className="fill-blue-400 opacity-20 animate-wave-slow"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500">
        <div className="text-blue-500 text-lg font-bold tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            {step < 1 ? (
              <span className="animate-cursor-blink">_</span>
            ) : (
              <span className="animate-typing overflow-hidden whitespace-nowrap">
                Workflow Engine
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Workflow Steps with Centered Arrows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
        {workflowSteps.map(({ Icon, color, bg, label }, i) => (
          <React.Fragment key={i}>
            <div
              className={`transition-all duration-500 flex flex-col items-center ${
                step > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className={`relative w-14 h-14 rounded-xl ${bg} flex items-center justify-center shadow-lg border border-gray-300 ${
                  step === i + 1 ? 'ring-2 ring-cyan-400 animate-pulse scale-105' : step > i + 1 ? 'opacity-90' : ''
                } hover:scale-105 transition-transform duration-300`}
              >
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-white to-transparent opacity-10"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0% 70%)' }}
                />
                <Icon className={`w-7 h-7 ${color} ${step === i + 1 ? 'animate-pulse' : ''}`} />
                {step > i + 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-gray-300">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-700 font-medium">{label}</div>
              <div className="w-14 h-1 bg-gray-300 rounded mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded transition-all duration-800 ease-out"
                  style={{
                    width:
                      step > i + 1
                        ? '100%'
                        : step === i + 1
                        ? `${(Math.sin(Date.now() / 500) * 0.3 + 0.7) * 100}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
            {i < workflowSteps.length - 1 && (
              // Render arrow only when the next step is active
              <>
                {step > i + 1 && (
                  <div className="flex items-center mx-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 transition-all duration-300" />
                  </div>
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Process Complete Indicator */}
      <div
        className={`absolute bottom-4 right-4 transition-all duration-500 ${
          step >= workflowSteps.length + 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <div className="bg-gradient-to-r from-green-400 to-blue-400 px-3 py-1 rounded-full text-xs text-white shadow-lg flex items-center gap-2">
          <div className="relative">
            <CheckCircle className="w-4 h-4" />
            <div className="absolute inset-0 rounded-full opacity-50 animate-ping">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          Process Complete
        </div>
      </div>

      {/* Timeline Indicator */}
      <div className="absolute bottom-4 left-4 transition-all duration-500">
        <div className="text-xs text-gray-500 font-mono">
          Time elapsed: <span className="text-cyan-400">{step * 2.5}s</span>
        </div>
      </div>
    </div>
  );
};

const AnimatedCollaboration = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null); // Updated line
  const orbitRef = useRef(null);
  
  // Auto-advance animation steps
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 8);
    }, 2500); // Slightly longer to let users see the full animations
    
    return () => clearInterval(timer);
  }, []);
  
  // Update active feature based on animation step
  useEffect(() => {
    if (animationStep >= 3 && animationStep <= 6) {
      setActiveFeature(animationStep - 3);
    } else {
      setActiveFeature(null);
    }
  }, [animationStep]);
  
  // Team colors and positions - Modified lineCoords to point to center of user icons
  const teams = [
    { id: 0, color: "from-indigo-400 to-blue-600", position: "top-4 left-8", lineCoords: { x1: 14, y1: 10, x2: 50, y2: 50 } }, // Adjusted to center of icon
    { id: 1, color: "from-purple-400 to-purple-600", position: "top-4 right-8", lineCoords: { x1: 86, y1: 10, x2: 50, y2: 50 } }, // Adjusted to center of icon
    { id: 2, color: "from-amber-400 to-amber-600", position: "bottom-4 left-8", lineCoords: { x1: 14, y1: 90, x2: 50, y2: 50 } }, // Adjusted to center of icon
    { id: 3, color: "from-emerald-400 to-emerald-600", position: "bottom-4 right-8", lineCoords: { x1: 86, y1: 90, x2: 50, y2: 50 } } // Adjusted to center of icon
  ];
  
  const features = [
    { 
      id: 0,
      name: "Workflows", 
      icon: GitMerge, 
      color: "text-indigo-500", 
      bgColor: "bg-indigo-100",
      teamColor: "bg-indigo-400",
      position: "rotate-0"
    },
    { 
      id: 1,
      name: "Maps", 
      icon: Map, 
      color: "text-purple-500", 
      bgColor: "bg-purple-100",
      teamColor: "bg-purple-400",
      position: "rotate-90"
    },
    { 
      id: 2,
      name: "Documents", 
      icon: FileText, 
      color: "text-amber-500", 
      bgColor: "bg-amber-100",
      teamColor: "bg-amber-400",
      position: "rotate-180"
    },
    { 
      id: 3,
      name: "Analysis", 
      icon: BarChart2, 
      color: "text-emerald-500", 
      bgColor: "bg-emerald-100",
      teamColor: "bg-emerald-400",
      position: "rotate-270"
    }
  ];
  
  return (
    <div className="w-full h-64 relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 overflow-hidden">
      {/* Base layer for connection lines (gray background lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {teams.map((team, index) => (
          <g key={`connection-${index}`} className={`transition-all duration-1000 ${animationStep >= 2 ? 'opacity-80' : 'opacity-0'}`}>
            {/* Gray background line */}
            <line 
              x1={`${team.lineCoords.x1}%`} 
              y1={`${team.lineCoords.y1}%`} 
              x2={`${team.lineCoords.x2}%`} 
              y2={`${team.lineCoords.y2}%`} 
              stroke="#e5e7eb" 
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
      
      {/* Moving elements and endpoints */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {teams.map((team, index) => (
          <g key={`animation-${index}`} className={`transition-all duration-1000 ${animationStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            {/* Glowing endpoint near team */}
            <circle 
              cx={`${team.lineCoords.x1}%`} 
              cy={`${team.lineCoords.y1}%`} 
              r="4" 
              fill="white" 
              className="filter drop-shadow-md animate-pulse"
            />
            
            {/* Glowing endpoint near center */}
            <circle 
              cx={`${team.lineCoords.x2}%`} 
              cy={`${team.lineCoords.y2}%`} 
              r="4" 
              fill="white" 
              className="filter drop-shadow-md animate-pulse"
            />
            
            {/* Moving blue segment - MODIFIED for oscillation */}
            <line 
              strokeWidth="3" 
              stroke={index === 0 ? "#3b82f6" : index === 1 ? "#8b5cf6" : index === 2 ? "#f59e0b" : "#10b981"}
              strokeLinecap="round" 
              className="filter drop-shadow-md"
              style={{
                animation: `oscillate${index} 5s infinite ${index * 0.2}s`, // Changed from 3s to 5s to slow down
              }}
            />
            
            {/* Small dot that oscillates on the line */}
            <circle 
              r="3"
              fill={index === 0 ? "#3b82f6" : index === 1 ? "#8b5cf6" : index === 2 ? "#f59e0b" : "#10b981"}
              className="filter drop-shadow-md"
              style={{
                animation: `oscillateDot${index} 5s infinite ${index * 0.2}s`, // Changed from 3s to 5s to slow down
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Central hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className={`transition-all duration-700 bg-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center ${animationStep > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse" />
          <Share2 className="w-8 h-8 text-indigo-600 relative z-10" />
        </div>
      </div>
      
      {/* Orbital ring */}
      <div 
        ref={orbitRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-slate-200 transition-all duration-1000 ${animationStep >= 2 ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate(-50%, -50%) rotate(${animationStep * 45}deg)`,
          transformOrigin: 'center'
        }}
      />
      
      {/* Feature icons in orbit */}
      {features.map((feature, index) => (
        <div
          key={index}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${animationStep >= 3 ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translate(-50%, -50%) rotate(${90 * index}deg) translateX(80px) rotate(-${90 * index}deg)`,
            transition: `all 0.7s ease-in-out ${index * 0.1}s`,
            zIndex: activeFeature === index ? 20 : 10
          }}
        >
          <div className={`${feature.bgColor} p-2 rounded-lg shadow-md transition-all duration-500 ${activeFeature === index ? 'scale-125 ring-2 ring-indigo-300' : ''}`}>
            <feature.icon className={`w-6 h-6 ${feature.color}`} />
          </div>
          
          {/* Label that appears on highlight */}
          <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium ${feature.color} whitespace-nowrap transition-all ${activeFeature === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
            {feature.name}
          </div>
        </div>
      ))}
      
      {/* Team pods at corners */}
      {teams.map((team, index) => (
        <div 
          key={index}
          className={`absolute ${team.position} transition-all duration-500 ${animationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{ transitionDelay: `${index * 0.1}s` }}
        >
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${team.color} flex items-center justify-center shadow-md`}>
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      ))}
      
      {/* Success indicator */}
      <div 
        className={`absolute bottom-3 right-3 bg-green-100 text-green-600 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 transition-all duration-700 ${animationStep === 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Sharing Enabled</span>
      </div>
      
      {/* CSS for custom animations */}
      <style jsx>{`
        /* Oscillating line animations that go back and forth - SLOWED DOWN by changing keyframe percentages */
        @keyframes oscillate0 {
          0% {
            x1: ${teams[0].lineCoords.x1}%;
            y1: ${teams[0].lineCoords.y1}%;
            x2: ${teams[0].lineCoords.x1 + 5}%;
            y2: ${teams[0].lineCoords.y1 + 5}%;
          }
          25% {
            x1: ${teams[0].lineCoords.x1 + 10}%;
            y1: ${teams[0].lineCoords.y1 + 10}%;
            x2: ${teams[0].lineCoords.x2 - 10}%;
            y2: ${teams[0].lineCoords.y2 - 10}%;
          }
          50% {
            x1: ${teams[0].lineCoords.x2 - 5}%;
            y1: ${teams[0].lineCoords.y2 - 5}%;
            x2: ${teams[0].lineCoords.x2}%;
            y2: ${teams[0].lineCoords.y2}%;
          }
          75% {
            x1: ${teams[0].lineCoords.x2 - 10}%;
            y1: ${teams[0].lineCoords.y2 - 10}%;
            x2: ${teams[0].lineCoords.x1 + 10}%;
            y2: ${teams[0].lineCoords.y1 + 10}%;
          }
          100% {
            x1: ${teams[0].lineCoords.x1}%;
            y1: ${teams[0].lineCoords.y1}%;
            x2: ${teams[0].lineCoords.x1 + 5}%;
            y2: ${teams[0].lineCoords.y1 + 5}%;
          }
        }
        
        @keyframes oscillate1 {
          0% {
            x1: ${teams[1].lineCoords.x1}%;
            y1: ${teams[1].lineCoords.y1}%;
            x2: ${teams[1].lineCoords.x1 - 5}%;
            y2: ${teams[1].lineCoords.y1 + 5}%;
          }
          25% {
            x1: ${teams[1].lineCoords.x1 - 10}%;
            y1: ${teams[1].lineCoords.y1 + 10}%;
            x2: ${teams[1].lineCoords.x2 + 10}%;
            y2: ${teams[1].lineCoords.y2 - 10}%;
          }
          50% {
            x1: ${teams[1].lineCoords.x2 + 5}%;
            y1: ${teams[1].lineCoords.y2 - 5}%;
            x2: ${teams[1].lineCoords.x2}%;
            y2: ${teams[1].lineCoords.y2}%;
          }
          75% {
            x1: ${teams[1].lineCoords.x2 + 10}%;
            y1: ${teams[1].lineCoords.y2 - 10}%;
            x2: ${teams[1].lineCoords.x1 - 10}%;
            y2: ${teams[1].lineCoords.y1 + 10}%;
          }
          100% {
            x1: ${teams[1].lineCoords.x1}%;
            y1: ${teams[1].lineCoords.y1}%;
            x2: ${teams[1].lineCoords.x1 - 5}%;
            y2: ${teams[1].lineCoords.y1 + 5}%;
          }
        }
        
        @keyframes oscillate2 {
          0% {
            x1: ${teams[2].lineCoords.x1}%;
            y1: ${teams[2].lineCoords.y1}%;
            x2: ${teams[2].lineCoords.x1 + 5}%;
            y2: ${teams[2].lineCoords.y1 - 5}%;
          }
          25% {
            x1: ${teams[2].lineCoords.x1 + 10}%;
            y1: ${teams[2].lineCoords.y1 - 10}%;
            x2: ${teams[2].lineCoords.x2 - 10}%;
            y2: ${teams[2].lineCoords.y2 + 10}%;
          }
          50% {
            x1: ${teams[2].lineCoords.x2 - 5}%;
            y1: ${teams[2].lineCoords.y2 + 5}%;
            x2: ${teams[2].lineCoords.x2}%;
            y2: ${teams[2].lineCoords.y2}%;
          }
          75% {
            x1: ${teams[2].lineCoords.x2 - 10}%;
            y1: ${teams[2].lineCoords.y2 + 10}%;
            x2: ${teams[2].lineCoords.x1 + 10}%;
            y2: ${teams[2].lineCoords.y1 - 10}%;
          }
          100% {
            x1: ${teams[2].lineCoords.x1}%;
            y1: ${teams[2].lineCoords.y1}%;
            x2: ${teams[2].lineCoords.x1 + 5}%;
            y2: ${teams[2].lineCoords.y1 - 5}%;
          }
        }
        
        @keyframes oscillate3 {
          0% {
            x1: ${teams[3].lineCoords.x1}%;
            y1: ${teams[3].lineCoords.y1}%;
            x2: ${teams[3].lineCoords.x1 - 5}%;
            y2: ${teams[3].lineCoords.y1 - 5}%;
          }
          25% {
            x1: ${teams[3].lineCoords.x1 - 10}%;
            y1: ${teams[3].lineCoords.y1 - 10}%;
            x2: ${teams[3].lineCoords.x2 + 10}%;
            y2: ${teams[3].lineCoords.y2 + 10}%;
          }
          50% {
            x1: ${teams[3].lineCoords.x2 + 5}%;
            y1: ${teams[3].lineCoords.y2 + 5}%;
            x2: ${teams[3].lineCoords.x2}%;
            y2: ${teams[3].lineCoords.y2}%;
          }
          75% {
            x1: ${teams[3].lineCoords.x2 + 10}%;
            y1: ${teams[3].lineCoords.y2 + 10}%;
            x2: ${teams[3].lineCoords.x1 - 10}%;
            y2: ${teams[3].lineCoords.y1 - 10}%;
          }
          100% {
            x1: ${teams[3].lineCoords.x1}%;
            y1: ${teams[3].lineCoords.y1}%;
            x2: ${teams[3].lineCoords.x1 - 5}%;
            y2: ${teams[3].lineCoords.y1 - 5}%;
          }
        }
        
        /* Oscillating dot animations that travel along the line - SLOWED DOWN */
        @keyframes oscillateDot0 {
          0% {
            cx: ${teams[0].lineCoords.x1}%;
            cy: ${teams[0].lineCoords.y1}%;
          }
          50% {
            cx: ${teams[0].lineCoords.x2}%;
            cy: ${teams[0].lineCoords.y2}%;
          }
          100% {
            cx: ${teams[0].lineCoords.x1}%;
            cy: ${teams[0].lineCoords.y1}%;
          }
        }
        
        @keyframes oscillateDot1 {
          0% {
            cx: ${teams[1].lineCoords.x1}%;
            cy: ${teams[1].lineCoords.y1}%;
          }
          50% {
            cx: ${teams[1].lineCoords.x2}%;
            cy: ${teams[1].lineCoords.y2}%;
          }
          100% {
            cx: ${teams[1].lineCoords.x1}%;
            cy: ${teams[1].lineCoords.y1}%;
          }
        }
        
        @keyframes oscillateDot2 {
          0% {
            cx: ${teams[2].lineCoords.x1}%;
            cy: ${teams[2].lineCoords.y1}%;
          }
          50% {
            cx: ${teams[2].lineCoords.x2}%;
            cy: ${teams[2].lineCoords.y2}%;
          }
          100% {
            cx: ${teams[2].lineCoords.x1}%;
            cy: ${teams[2].lineCoords.y1}%;
          }
        }
        
        @keyframes oscillateDot3 {
          0% {
            cx: ${teams[3].lineCoords.x1}%;
            cy: ${teams[3].lineCoords.y1}%;
          }
          50% {
            cx: ${teams[3].lineCoords.x2}%;
            cy: ${teams[3].lineCoords.y2}%;
          }
          100% {
            cx: ${teams[3].lineCoords.x1}%;
            cy: ${teams[3].lineCoords.y1}%;
          }
        }
      `}</style>
    </div>
  );
};

export { AnimatedDataRetrieval, AnimatedMapping, AnimatedWorkflow, AnimatedCollaboration };