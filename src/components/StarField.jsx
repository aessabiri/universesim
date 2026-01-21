import React, { useMemo } from 'react';
import * as THREE from 'three';

const StarField = () => {
  const count = 3000;
  
  // Simple sprite texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16,16,0,16,16,16);
    grad.addColorStop(0, 'white');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const r = 200 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const brightness = Math.random();
      col[i * 3] = 0.8 + brightness * 0.2;
      col[i * 3 + 1] = 0.8 + brightness * 0.2;
      col[i * 3 + 2] = 1.0;
    }
    return [pos, col];
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={1.5}
        sizeAttenuation={true}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default StarField;