import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- CUSTOM SHADERS ---

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float angle; // Random rotation for each particle
  
  varying vec3 vColor;
  varying float vAngle;
  
  void main() {
    vColor = color;
    vAngle = angle;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Size attenuation (particles shrink further away)
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAngle;
  
  void main() {
    // Rotate UV coordinates based on vAngle
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 rotatedUV = vec2(
      c * (gl_PointCoord.x - 0.5) - s * (gl_PointCoord.y - 0.5) + 0.5,
      s * (gl_PointCoord.x - 0.5) + c * (gl_PointCoord.y - 0.5) + 0.5
    );

    // Create a soft, smoky glow
    // Distance from center of particle (0.5, 0.5)
    float dist = distance(rotatedUV, vec2(0.5));
    
    // Smooth circle edge
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Add some noise/irregularity (simulated by non-linear falloff)
    alpha = pow(alpha, 1.5); // Soften

    // Discard outer pixels for performance
    if (alpha < 0.01) discard;

    // Output final color
    gl_FragColor = vec4(vColor, alpha * 0.6); // 0.6 is base opacity
  }
`;

const CosmicDust = ({ phase }) => {
  const count = 4000; // Optimized for performance
  const points = useRef();
  
  // Initialize particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      // Pre-calculate random offsets to avoid Math.random in loop
      const rand1 = Math.random() - 0.5;
      const rand2 = Math.random() - 0.5;
      const rand3 = Math.random() - 0.5;
      
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;

      temp.push({ t, factor, x, y, z, mx: 0, my: 0, mz: 0, rand1, rand2, rand3 });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const angles = useMemo(() => {
    const arr = new Float32Array(count);
    for(let i=0; i<count; i++) arr[i] = Math.random() * Math.PI * 2;
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsArray = points.current.geometry.attributes.position.array;
    const colorsArray = points.current.geometry.attributes.color.array;
    const sizesArray = points.current.geometry.attributes.size.array;
    
    // Pre-calculate phase-global values
    const sinTime20 = Math.sin(time * 20);
    const time08 = time * 0.8;
    const sinTime02 = Math.sin(time * 0.2);
    const spinGalaxy = time * 0.1;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      let targetX = p.x, targetY = p.y, targetZ = p.z;
      let r = 1, g = 1, b = 1;
      let size = 1;

      if (phase === 'BIG_BANG') {
        targetX = p.rand1 * 0.5;
        targetY = p.rand2 * 0.5;
        targetZ = p.rand3 * 0.5;
        size = 15.0 + sinTime20 * 5;

      } else if (phase === 'QGP') {
        const t = time08;
        targetX = Math.sin(p.t + t) * 8 + p.rand1;
        targetY = Math.cos(p.t + t * 0.9) * 8 + p.rand2;
        targetZ = Math.sin(p.t + t * 0.5) * 8 + p.rand3;
        
        size = 25.0; // Larger to fill gaps
        const heat = Math.sin(p.t + time) * 0.5 + 0.5;
        r = 1.0; g = 0.1 + heat * 0.5; b = 0.05;

      } else if (phase === 'INFLATION') {
        const radius = 30 + sinTime02 * 2;
        targetX = radius * Math.sin(p.factor) * Math.cos(p.t);
        targetY = radius * Math.sin(p.factor) * Math.sin(p.t);
        targetZ = radius * Math.cos(p.factor);
        
        size = 30.0;
        r = 0.05; g = 0.3; b = 0.8;

      } else if (phase === 'GALAXY') {
        const arms = 5;
        const dist = (i / count) * 45;
        const angle = dist * 0.5 + spinGalaxy + (p.factor % arms) * ((Math.PI * 2) / arms);
        
        targetX = Math.cos(angle) * dist;
        targetY = p.rand1 * (50 / (dist + 1));
        targetZ = Math.sin(angle) * dist;

        size = 18.0 + (p.factor % 10);
        
        if (dist < 5) { r=1; g=0.9; b=0.8; }
        else if (p.rand2 > 0.2) { r=0.4; g=0.2; b=0.4; }
        else { r=0.3; g=0.5; b=0.9; }

      } else if (phase === 'SOLAR_SYSTEM') {
        if (i < count * 0.05) {
            targetX=0; targetY=0; targetZ=0;
            size=80; r=1; g=0.6; b=0.1;
        } else {
            const angle = p.t + time * (5 / p.factor);
            const rad = 10 + (p.factor % 30);
            targetX = Math.cos(angle) * rad;
            targetY = p.rand1;
            targetZ = Math.sin(angle) * rad;
            size = 8.0;
            r=0.6; g=0.5; b=0.4;
        }
      }

      // Physics (Inline optimized)
      p.mx += (targetX - p.x) * 0.02;
      p.my += (targetY - p.y) * 0.02;
      p.mz += (targetZ - p.z) * 0.02;
      p.mx *= 0.9; p.my *= 0.9; p.mz *= 0.9;
      p.x += p.mx; p.y += p.my; p.z += p.mz;

      const i3 = i * 3;
      positionsArray[i3] = p.x;
      positionsArray[i3+1] = p.y;
      positionsArray[i3+2] = p.z;
      colorsArray[i3] = r;
      colorsArray[i3+1] = g;
      colorsArray[i3+2] = b;
      sizesArray[i] = size;
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
        <bufferAttribute attach="attributes-angle" count={count} array={angles} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default CosmicDust;