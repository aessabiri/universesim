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
              <stop offset="0%" stopColor="#FFFFFF" />        {/* Big Bang */}
              <stop offset="5%" stopColor="#FFFFFF" />
              <stop offset="15%" stopColor="#8B0000" />       {/* QGP Start */}
              <stop offset="25%" stopColor="#4A0404" />       {/* QGP End */}
              <stop offset="35%" stopColor="#000033" />       {/* Inflation Start */}
              <stop offset="50%" stopColor="#0F0F3F" />       {/* Inflation End */}
              <stop offset="60%" stopColor="#2E0854" />       {/* Galaxy Start */}
              <stop offset="80%" stopColor="#000000" />       {/* Solar System */}
            </linearGradient>

            {/* Mask for the Bell Shape (WIDER) */}
            <mask id="coneMask">
              {/* 
                 New Shape (Wider): 
                 1. Start at 0,60 (Center)
                 2. Rapid expansion curve to x=150, y=5 (Top)
                 3. Horizontal line to end
              */}
              <path 
                d="M0,60 
                   C60,60 100,5 200,5
                   L1000,5
                   L1000,115
                   L200,115
                   C100,115 60,60 0,60
                   Z" 
                fill="white"
              />
            </mask>
            
            <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Fade Gradients for Details */}
            <linearGradient id="fade-qgp" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="20%" stopColor="white" stopOpacity="1" />
              <stop offset="80%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* BACKGROUND CONE CONTAINER */}
          <path 
            d="M0,60 
               C60,60 100,5 200,5
               L1000,5
               L1000,115
               L200,115
               C100,115 60,60 0,60
               Z" 
            fill="#050505" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"
          />

          {/* CONTENT INSIDE MASK */}
          <g mask="url(#coneMask)">
            
            {/* 1. MASTER BACKGROUND (Seamless) */}
            <rect x="0" y="0" width="1000" height="120" fill="url(#grad-master)" />
            
            {/* 2. DETAILS LAYERS (Faded in/out) */}

            {/* QGP Quarks (x: 100-300) */}
            <g opacity="0.8">
              {quarks.map((q, i) => (
                // Only render if within range to save perf, but conceptually they "fade"
                // Adding offset to place them in QGP zone
                <circle 
                  key={i} 
                  cx={100 + q.cx * 2} 
                  cy={10 + q.cy} 
                  r={q.r} 
                  fill={q.fill} 
                  opacity={0.6}
                />
              ))}
              {/* Soft overlay to blend edges */}
              <rect x="80" y="0" width="240" height="120" fill="url(#fade-qgp)" style={{ mixBlendMode: 'overlay' }} />
            </g>

            {/* Inflation Fog (x: 300-500) */}
            <rect x="280" y="0" width="240" height="120" fill="white" fillOpacity="0.03" />

            {/* Galaxies (x: 500-750) */}
            <g transform="translate(500, 10)">
               {galaxies.map((g, i) => (
                 <g key={i} transform={`translate(${g.cx * 2.5}, ${g.cy}) rotate(${g.rot})`} opacity="0.8">
                    <ellipse rx={g.r*2} ry={g.r} fill="rgba(200,200,255,0.3)" />
                    <circle r={g.r/2} fill="white" />
                 </g>
               ))}
            </g>

            {/* Solar Systems (x: 750-1000) */}
            <g transform="translate(750, 0)">
               {/* A few solar systems */}
               <circle cx="50" cy="60" r="4" fill="#FDB813" filter="url(#glow-white)" />
               <ellipse cx="50" cy="60" rx="15" ry="4" fill="none" stroke="white" strokeOpacity="0.3" />
               
               <circle cx="150" cy="40" r="3" fill="#FDB813" opacity="0.8" />
               <ellipse cx="150" cy="40" rx="10" ry="3" fill="none" stroke="white" strokeOpacity="0.2" />

               <circle cx="200" cy="80" r="5" fill="#FDB813" opacity="0.9" />
               <ellipse cx="200" cy="80" rx="20" ry="6" fill="none" stroke="white" strokeOpacity="0.2" />
            </g>

            {/* Active Highlight Overlay */}
            {activeIndex >= 0 && (
              <rect 
                x={activeIndex * (1000/totalPhases)} 
                y="0" 
                width={1000/totalPhases} 
                height="120" 
                fill="white" 
                fillOpacity="0.1" 
                className="transition-all duration-500"
                style={{ mixBlendMode: 'soft-light' }}
              />
            )}
          </g>

          {/* Phase Labels (Below) */}
          {phaseOrder.map((phaseId, index) => {
            const width = 1000 / totalPhases;
            const x = index * width + width / 2;
            const isActive = index === activeIndex;
            
            // Fixed Y position for flat bottom
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

          {/* Current Time Indicator Line */}
          <line 
            x1={activeIndex * (1000/totalPhases) + (1000/totalPhases)/2} 
            y1="0" 
            x2={activeIndex * (1000/totalPhases) + (1000/totalPhases)/2} 
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