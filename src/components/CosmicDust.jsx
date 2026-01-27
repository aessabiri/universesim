import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.4); // Reduced alpha for Additive blending
  }
`;

const CosmicDust = ({ phase }) => {
  const count = 12000; // Optimized
  const points = useRef();
  
  const prevPhase = useRef(phase);
  const phaseStart = useRef(0);

  const particles = useMemo(() => {
    const temp = [];
    for(let i=0; i<count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.random() * 0.05; 
        
        // Randomize speed for "depth" in explosion
        const speed = 0.5 + Math.random() * 2.5;
        
        temp.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            vx: Math.sin(phi) * Math.cos(theta) * speed,
            vy: Math.sin(phi) * Math.sin(theta) * speed,
            vz: Math.cos(phi) * speed,
            id: i,
            age: Math.random()
        });
    }
    return temp;
  }, []);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    
    if (phase !== prevPhase.current) {
        phaseStart.current = time;
        prevPhase.current = phase;
        
        if (phase === 'BIG_BANG') {
             for(let i=0; i<count; i++) {
                 const p = particles[i];
                 p.x = (Math.random()-0.5) * 0.1;
                 p.y = (Math.random()-0.5) * 0.1;
                 p.z = (Math.random()-0.5) * 0.1;
             }
        }
    }

    const phaseTime = time - phaseStart.current;
    const pos = points.current.geometry.attributes.position.array;
    const col = points.current.geometry.attributes.color.array;
    const siz = points.current.geometry.attributes.size.array;

    for(let i=0; i<count; i++) {
        const p = particles[i];
        let r, g, b, s;

        if (phase === 'BIG_BANG') {
            // SHOCKWAVE PHYSICS
            const drag = 0.96;
            const force = 100.0 * Math.exp(-phaseTime * 2.5);
            
            p.x += p.vx * force * 0.2;
            p.y += p.vy * force * 0.2;
            p.z += p.vz * force * 0.2;
            
            p.x += p.vx * 0.1;
            p.y += p.vy * 0.1;
            p.z += p.vz * 0.1;

            // Intense color progression
            if (phaseTime < 0.2) {
                // Initial flash: White/Yellow
                r = 1.0; g = 1.0; b = 0.8; 
                s = 10.0 + Math.random() * 10.0; // Reasonable size
            } else {
                // Cool down
                const t = Math.min(1.0, (phaseTime - 0.2) * 0.5);
                const colorA = new THREE.Color('#ffaa00'); // Hot Orange
                const colorB = new THREE.Color('#aa00ff'); // Cosmic Purple
                const finalColor = colorA.lerp(colorB, t);
                
                r = finalColor.r; g = finalColor.g; b = finalColor.b;
                s = 5.0 * (1.0 - t * 0.5);
            }
        }
        
        else if (phase === 'INFLATION') {
            // Space stretches
            p.x *= 1.05; p.y *= 1.05; p.z *= 1.05;
            r = 0.2; g = 0.4; b = 1.0; 
            s = 8.0;
        }
        // ... (rest of phases remain logic-consistent)
        else if (phase === 'QGP') {
            p.x += (Math.random()-0.5) * 1.5;
            p.y += (Math.random()-0.5) * 1.5;
            p.z += (Math.random()-0.5) * 1.5;
            p.x *= 0.95; p.y *= 0.95; p.z *= 0.95;
            const type = p.id % 4;
            if (type === 0) { r=1; g=0.1; b=0.1; }
            else if (type === 1) { r=0.1; g=1; b=0.1; }
            else if (type === 2) { r=0.1; g=0.1; b=1; }
            else { r=1; g=1; b=1; }
            s = 20.0;
        }
        else if (phase === 'GALAXY') {
            p.y *= 0.98;
            const radius = 5 + (p.id % 40);
            const angle = time * 0.2 + radius * 0.05 + (p.id % 3) * 2.1;
            p.x += (Math.cos(angle) * radius - p.x) * 0.05;
            p.z += (Math.sin(angle) * radius - p.z) * 0.05;
            r=0.4; g=0.6; b=1.0; s=5.0;
        }
        else if (phase === 'SOLAR_SYSTEM') {
            if (i < 500) {
                p.x *= 0.95; p.y *= 0.95; p.z *= 0.95;
                r=1.0; g=0.9; b=0.5; s=30.0;
            } else {
                p.y *= 0.99;
                const radius = 10 + (p.id % 50);
                const angle = time * (5.0 / radius) + p.id;
                p.x = Math.cos(angle) * radius;
                p.z = Math.sin(angle) * radius;
                r=0.7; g=0.7; b=0.8; s=2.0;
            }
        }

        pos[i*3] = p.x;
        pos[i*3+1] = p.y;
        pos[i*3+2] = p.z;
        col[i*3] = r;
        col[i*3+1] = g;
        col[i*3+2] = b;
        siz[i] = s;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.geometry.attributes.color.needsUpdate = true;
    points.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default CosmicDust;