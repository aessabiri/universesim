import React, { useState, useEffect } from 'react';
import Experience from './components/Experience';
import { useAudioEngine } from './hooks/useAudioEngine';

const PHASES = {
  BIG_BANG: {
    id: 'BIG_BANG',
    label: 'The Singularity',
    desc: 'T=0: Infinite density. A point of pure potential energy waiting to erupt.',
    color: 'text-white',
    duration: 5000 // 5s build up
  },
  QGP: {
    id: 'QGP',
    label: 'Quark-Gluon Plasma',
    desc: 'T+0s: The primordial soup. Hot, dense, and chaotic.',
    color: 'text-red-500',
    duration: 8000 // 8s
  },
  INFLATION: {
    id: 'INFLATION',
    label: 'Cosmic Inflation',
    desc: 'T+10⁻³²s: Space expands faster than light, cooling the universe.',
    color: 'text-cyan-400',
    duration: 6000 // 6s
  },
  GALAXY: {
    id: 'GALAXY',
    label: 'Galaxy Formation',
    desc: 'T+1 Billion Years: Gravity pulls matter into spiral structures.',
    color: 'text-purple-400',
    duration: 10000 // 10s
  },
  SOLAR_SYSTEM: {
    id: 'SOLAR_SYSTEM',
    label: 'Solar System',
    desc: 'T+9 Billion Years: A star is born from collapsing dust clouds.',
    color: 'text-yellow-400',
    duration: 10000 // 10s
  }
};

const PHASE_ORDER = ['BIG_BANG', 'QGP', 'INFLATION', 'GALAXY', 'SOLAR_SYSTEM'];

function App() {
  const [activePhase, setActivePhase] = useState('BIG_BANG');
  const [isTouring, setIsTouring] = useState(false);
  const [flash, setFlash] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const { toggleMute } = useAudioEngine(activePhase, muted);

  const handleMute = () => {
    setMuted(!muted);
    toggleMute();
  };

  // Handle Tour Mode
  useEffect(() => {
    let timeout;
    if (isTouring) {
      const currentPhaseConfig = PHASES[activePhase];
      timeout = setTimeout(() => {
        const currentIndex = PHASE_ORDER.indexOf(activePhase);
        const nextIndex = (currentIndex + 1) % PHASE_ORDER.length;
        const nextPhase = PHASE_ORDER[nextIndex];
        
        setActivePhase(nextPhase);
        
        // Loop or stop? Let's loop.
      }, currentPhaseConfig.duration);
    }
    return () => clearTimeout(timeout);
  }, [activePhase, isTouring]);

  // Handle Flash Effect on Phase Change
  useEffect(() => {
    // Trigger flash
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 500); // 500ms flash duration
    return () => clearTimeout(timer);
  }, [activePhase]);

  const toggleTour = () => {
    setIsTouring(!isTouring);
    if (!isTouring) {
        // Reset to beginning if starting tour
        setActivePhase('QGP');
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Experience phase={activePhase} />
      </div>

      {/* Visual Flash Overlay */}
      <div 
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-500 ease-out ${flash ? 'opacity-80' : 'opacity-0'}`} 
      />

      {/* Info Overlay (Top Left) */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border-l-4 border-white/20">
            <h1 className={`text-5xl font-black tracking-tighter mb-2 drop-shadow-lg ${PHASES[activePhase].color}`}>
            {PHASES[activePhase].label}
            </h1>
            <p className="text-gray-200 text-lg font-light tracking-wide max-w-lg drop-shadow-md">
            {PHASES[activePhase].desc}
            </p>
        </div>
      </div>

      {/* Tour Status Indicator */}
      {isTouring && (
          <div className="absolute top-8 right-20 z-10 pointer-events-none">
              <div className="flex items-center gap-2 bg-red-900/50 backdrop-blur border border-red-500/50 px-4 py-2 rounded-full text-red-100 font-mono text-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  AUTO-PILOT ENGAGED
              </div>
          </div>
      )}

      {/* Audio Control */}
      <div className="absolute top-8 right-8 z-20">
        <button 
          onClick={handleMute}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/10 transition-all"
          title={muted ? "Unmute Audio" : "Mute Audio"}
        >
          {muted ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Control Bar (Bottom) */}
      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4 z-20 pointer-events-none">
        
        {/* Phase Buttons */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl flex gap-2">
          {Object.keys(PHASES).map((phase) => (
            <button
              key={phase}
              onClick={() => {
                  setActivePhase(phase);
                  setIsTouring(false); // Manual override stops tour
              }}
              className={`px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${
                activePhase === phase
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {PHASES[phase].label}
            </button>
          ))}
        </div>

        {/* Tour Button */}
        <button
            onClick={toggleTour}
            className={`pointer-events-auto px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                isTouring 
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                : 'bg-transparent border-white/30 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
        >
            {isTouring ? 'Stop Tour' : 'Start Cinematic Tour'}
        </button>

      </div>
      
      {/* Watermark / Footer */}
      <div className="absolute bottom-4 right-4 z-10 text-[10px] text-gray-600 font-mono">
        RENDER: WEBGL 2.0 • PARTICLES: 4000 • QUANTUM LABS
      </div>
    </div>
  );
}

export default App;