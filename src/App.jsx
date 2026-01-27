import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, CameraShake } from '@react-three/drei';
import TimelineCone from './components/TimelineCone';
import IntroExperience from './components/IntroSequence';
import CosmicDust from './components/CosmicDust';

const PHASES = {
  BIG_BANG: {
    id: 'BIG_BANG',
    label: 'The Singularity',
    desc: 'T=0: Infinite density. A point of pure potential energy waiting to erupt.',
    color: 'text-white',
  },
  INFLATION: {
    id: 'INFLATION',
    label: 'Cosmic Inflation',
    desc: 'T+10⁻³²s: Space expands faster than light. Exotic physics rule.',
    color: 'text-cyan-400',
  },
  QGP: {
    id: 'QGP',
    label: 'Quark-Gluon Plasma',
    desc: 'T+10⁻⁶s: A hot, dense soup of quarks and gluons (Color Charge).',
    color: 'text-red-500',
  },
  GALAXY: {
    id: 'GALAXY',
    label: 'Galaxy Formation',
    desc: 'T+1 Billion Years: Gravity pulls matter into spiral structures.',
    color: 'text-purple-400',
  },
  SOLAR_SYSTEM: {
    id: 'SOLAR_SYSTEM',
    label: 'Solar System',
    desc: 'T+9 Billion Years: A star is born from collapsing dust clouds.',
    color: 'text-yellow-400',
  }
};

const PHASE_ORDER = ['BIG_BANG', 'INFLATION', 'QGP', 'GALAXY', 'SOLAR_SYSTEM'];

function App() {
  const [activePhase, setActivePhase] = useState('BIG_BANG');
  const [hasStarted, setHasStarted] = useState(false);
  const [introMode, setIntroMode] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleInitiate = () => {
    setIntroMode(true);
  };

  const handleIntroComplete = () => {
    setIntroMode(false);
    setHasStarted(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

  const handleReset = () => {
    setHasStarted(false);
    setIntroMode(false);
    setActivePhase('BIG_BANG');
    setFlash(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* 1. LANDING SCREEN */}
      {!hasStarted && !introMode && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 tracking-tighter drop-shadow-2xl">
              ORIGIN
            </h1>
            <p className="text-blue-200/80 font-mono tracking-widest text-sm md:text-base">
              QUANTUM UNIVERSE SIMULATION
            </p>
            
            <button
              onClick={handleInitiate}
              className="group relative px-12 py-4 bg-white text-black font-bold text-xl rounded-full tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-shine" />
              INITIATE SEQUENCE
            </button>
          </div>
        </div>
      )}

      {/* 2. SHARED 3D CANVAS (Intro & Main Sim) */}
      {(hasStarted || introMode) && (
        <div className="absolute inset-0 z-0">
          <Canvas 
            gl={{ antialias: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 50], fov: 60 }}
          >
            {introMode ? (
              <IntroExperience onComplete={handleIntroComplete} />
            ) : (
              <>
                <CosmicDust phase={activePhase} />
                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.2} />
                <CameraShake 
                    maxYaw={activePhase === 'BIG_BANG' ? 0.5 : 0} 
                    maxPitch={activePhase === 'BIG_BANG' ? 0.5 : 0} 
                    maxRoll={activePhase === 'BIG_BANG' ? 0.5 : 0} 
                    yawFrequency={activePhase === 'BIG_BANG' ? 2 : 0} 
                    pitchFrequency={activePhase === 'BIG_BANG' ? 2 : 0} 
                    rollFrequency={activePhase === 'BIG_BANG' ? 2 : 0} 
                    intensity={activePhase === 'BIG_BANG' ? 1 : 0} 
                    decay={false} 
                />
              </>
            )}
          </Canvas>
          
          {/* Skip Intro Button */}
          {introMode && (
            <button 
              onClick={handleIntroComplete} 
              className="absolute bottom-4 right-4 text-white/20 hover:text-white/80 text-xs font-mono border border-white/10 px-2 py-1 rounded z-50 pointer-events-auto"
            >
              SKIP INTRO
            </button>
          )}
        </div>
      )}

      {/* 3. MAIN UI (After Intro) */}
      {hasStarted && (
        <>
          <TimelineCone 
            activePhase={activePhase} 
            phaseOrder={PHASE_ORDER} 
            phases={PHASES} 
          />

          <div className="absolute inset-0 bg-white pointer-events-none z-40 transition-opacity duration-1000 ease-out" style={{ opacity: flash ? 1 : 0 }} />

          {/* Reset Button */}
          <div className="absolute top-8 right-8 z-50">
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 bg-white/5 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
            >
              <span className="text-xs font-bold text-white tracking-widest">RESET</span>
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default App;