import React, { useMemo } from 'react';

const TimelineCone = ({ activePhase, phaseOrder }) => {
  const activeIndex = phaseOrder.indexOf(activePhase);
  const totalPhases = phaseOrder.length;
  
  // Generate random positions for "Quark" dots once
  const quarks = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 1.5 + 0.5,
      fill: Math.random() > 0.5 ? '#ff0000' : '#ffff00'
    }));
  }, []);

  // Generate random positions for "Galaxy" blobs once
  const galaxies = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 3 + 1,
      rot: Math.random() * 360
    }));
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full flex justify-center pt-8 z-30 pointer-events-none">
      <div className="relative w-[95%] max-w-5xl h-32">
        
        {/* Main SVG Diagram */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1000 120" 
          preserveAspectRatio="none" 
          className="overflow-visible"
        >
          <defs>
            {/* Master Gradient for Seamless Background */}
            <linearGradient id="grad-master" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000000" />        {/* Previous Universe End */}
              <stop offset="10%" stopColor="#FFFFFF" />       {/* Singularity / Big Bang */}
              <stop offset="20%" stopColor="#8B0000" />       {/* QGP */}
              <stop offset="35%" stopColor="#000033" />       {/* Inflation */}
              <stop offset="60%" stopColor="#2E0854" />       {/* Galaxy Start */}
              <stop offset="85%" stopColor="#000000" />       {/* Solar System */}
            </linearGradient>

            {/* Mask for the Bow-Tie Shape (}{) */}
            <mask id="coneMask">
              {/* 
                 Shape:
                 1. Starts wide at x=0 (y=5 to 115)
                 2. Closes to x=100, y=60
                 3. Opens to x=250, y=5 to 115
                 4. Stays parallel to x=1000
              */}
              <path 
                d="M0,5 
                   C40,5 70,60 100,60
                   C130,60 160,5 250,5
                   L1000,5
                   L1000,115
                   L250,115
                   C160,115 130,60 100,60
                   C70,60 40,115 0,115
                   Z" 
                fill="white"
              />
            </mask>
            
            <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND CONE CONTAINER */}
          <path 
            d="M0,5 
               C40,5 70,60 100,60
               C130,60 160,5 250,5
               L1000,5
               L1000,115
               L250,115
               C160,115 130,60 100,60
               C70,60 40,115 0,115
               Z" 
            fill="#050505" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"
          />

          {/* CONTENT INSIDE MASK */}
          <g mask="url(#coneMask)">
            
            {/* 1. MASTER BACKGROUND */}
            <rect x="0" y="0" width="1000" height="120" fill="url(#grad-master)" />
            
            {/* 2. PRE-EXISTENCE GHOSTS (x: 0-100) */}
            <g opacity="0.3">
               {Array.from({length: 15}).map((_, i) => (
                 <circle key={i} cx={Math.random() * 80} cy={20 + Math.random() * 80} r={1} fill="white" />
               ))}
            </g>

            {/* 3. CURRENT UNIVERSE DETAILS (Shifted x+100) */}
            
            {/* QGP Quarks (x: 150-350) */}
            <g opacity="0.8">
              {quarks.map((q, i) => (
                <circle 
                  key={i} 
                  cx={150 + q.cx * 2} 
                  cy={10 + q.cy} 
                  r={q.r} 
                  fill={q.fill} 
                  opacity={0.6}
                />
              ))}
            </g>

            {/* Galaxies (x: 550-800) */}
            <g transform="translate(550, 10)">
               {galaxies.map((g, i) => (
                 <g key={i} transform={`translate(${g.cx * 2.5}, ${g.cy}) rotate(${g.rot})`} opacity="0.8">
                    <ellipse rx={g.r*2} ry={g.r} fill="rgba(200,200,255,0.3)" />
                    <circle r={g.r/2} fill="white" />
                 </g>
               ))}
            </g>

            {/* Solar Systems (x: 800-1000) */}
            <g transform="translate(800, 0)">
               <circle cx={50} cy={60} r={4} fill="#FDB813" filter="url(#glow-white)" />
               <ellipse cx={50} cy={60} rx={15} ry={4} fill="none" stroke="white" strokeOpacity="0.3" />
            </g>

            {/* Active Highlight Overlay (Shifted) */}
            {activeIndex >= 0 && (
              <rect 
                x={100 + activeIndex * (900/totalPhases)} 
                y="0" 
                width={900/totalPhases} 
                height="120" 
                fill="white" 
                fillOpacity="0.1" 
                className="transition-all duration-500"
                style={{ mixBlendMode: 'soft-light' }}
              />
            )}
          </g>

          {/* Phase Labels (Shifted) */}
          {phaseOrder.map((phaseId, index) => {
            const width = 900 / totalPhases;
            const x = 100 + index * width + width / 2;
            const isActive = index === activeIndex;
            const yPos = 110; 

            return (
              <text 
                key={phaseId}
                x={x} 
                y={yPos} 
                textAnchor="middle" 
                fill={isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                fontSize={isActive ? "12" : "9"}
                fontWeight={isActive ? "bold" : "normal"}
                className="uppercase font-mono tracking-widest transition-all"
                style={{ textShadow: isActive ? '0 0 10px white' : 'none', pointerEvents: 'none' }}
                dominantBaseline="middle"
              >
                {phaseId === 'BIG_BANG' ? 'BANG' : phaseId.split('_')[0]}
              </text>
            );
          })}

          {/* Current Time Indicator Line (Shifted) */}
          <line 
            x1={100 + activeIndex * (900/totalPhases) + (900/totalPhases)/2} 
            y1="0" 
            x2={100 + activeIndex * (900/totalPhases) + (900/totalPhases)/2} 
            y2="120" 
            stroke="white" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            opacity="0.5"
            className="transition-all duration-1000 ease-in-out"
          />

        </svg>
      </div>
    </div>
  );
};

export default TimelineCone;