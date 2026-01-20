import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem = ({ phase }) => {
  const count = 4000;
  const mesh = useRef();
  const dummy = new THREE.Object3D();
  const tempColor = new THREE.Color();

  // Initialize random starting parameters (position is handled in animation loop via physics)
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      
      // Initial spread
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      
      temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0, mz: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      let { x, y, z } = particle;
      let targetX = x; 
      let targetY = y;
      let targetZ = z;

      // --- PHASE LOGIC ---

      if (phase === 'BIG_BANG') {
        // Singularity: Infinite density, pulsing point
        // Force everything to center
        targetX = (Math.random() - 0.5) * 0.1;
        targetY = (Math.random() - 0.5) * 0.1;
        targetZ = (Math.random() - 0.5) * 0.1;
        
        // Pulsing intensity
        const pulse = Math.sin(time * 20) * 0.5 + 1.5; // Fast pulse
        
        // Pure White Energy
        tempColor.set('#ffffff'); 
        
        // Override scale logic later for this specific phase
      } else if (phase === 'QGP') {
        // Quark-Gluon Plasma
        const t = time * 2;
        targetX = Math.sin(particle.t + t) * 5 + (Math.random()-0.5) * 0.5;
        targetY = Math.cos(particle.t + t * 0.9) * 5 + (Math.random()-0.5) * 0.5;
        targetZ = Math.sin(particle.t + t * 0.5) * 5 + (Math.random()-0.5) * 0.5;
        
        // Colors
        const heat = Math.random();
        if (heat > 0.9) tempColor.set('#ffffff');
        else if (heat > 0.6) tempColor.set('#ffaa00');
        else tempColor.set('#ff0000');

      } else if (phase === 'INFLATION') {
        // Cosmic Inflation
        const r = 15 + Math.sin(time * 0.5) * 2;
        const theta = particle.t;
        const phi = particle.factor;
        
        targetX = r * Math.sin(phi) * Math.cos(theta);
        targetY = r * Math.sin(phi) * Math.sin(theta);
        targetZ = r * Math.cos(phi);

        tempColor.setHSL(0.6, 0.8, 0.5 + Math.random() * 0.5);

      } else if (phase === 'GALAXY') {
        // Galaxy
        const arms = 3;
        const distance = (i / count) * 25;
        const angle = distance + time * 0.2 + (particle.factor % arms) * ((Math.PI * 2) / arms);
        
        targetX = Math.cos(angle) * distance;
        targetY = (Math.random() - 0.5) * (20 / (distance + 1));
        targetZ = Math.sin(angle) * distance;
        
        const hue = 0.7 + (distance / 40) * 0.2;
        tempColor.setHSL(hue, 0.8, 0.6);

      } else if (phase === 'SOLAR_SYSTEM') {
        // Solar System
        if (i < count * 0.1) {
          targetX = (Math.random() - 0.5) * 2;
          targetY = (Math.random() - 0.5) * 2;
          targetZ = (Math.random() - 0.5) * 2;
          tempColor.set('#FDB813');
        } else {
          const angle = particle.t + time * (10 / particle.factor);
          const r = 5 + (particle.factor % 25);
          targetX = Math.cos(angle) * r;
          targetY = (Math.random() - 0.5) * 0.5;
          targetZ = Math.sin(angle) * r;

          if (r < 10) tempColor.set('#8B4513');
          else if (r < 20) tempColor.set('#cd853f');
          else tempColor.set('#ADD8E6');
        }
      }

      // --- PHYSICS LERP ---
      particle.mx += (targetX - particle.x) * 0.02;
      particle.my += (targetY - particle.y) * 0.02;
      particle.mz += (targetZ - particle.z) * 0.02;
      
      particle.mx *= 0.92;
      particle.my *= 0.92;
      particle.mz *= 0.92;

      particle.x += particle.mx;
      particle.y += particle.my;
      particle.z += particle.mz;

      // Update Matrix
      dummy.position.set(particle.x, particle.y, particle.z);
      
      // Scale particles based on phase
      let s = 1;
      if (phase === 'BIG_BANG') {
         // Violent vibration in scale
         s = 0.1 + Math.random() * 0.5 * Math.sin(time * 50); 
      } else if (phase === 'QGP') s = 0.5;
      else if (phase === 'SOLAR_SYSTEM' && i < count * 0.1) s = 2;
      else s = 0.8;
      
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
      
      // Update Color
      mesh.current.setColorAt(i, tempColor);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

export default ParticleSystem;
