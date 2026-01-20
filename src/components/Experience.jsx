import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import ParticleSystem from './ParticleSystem';
import CameraController from './CameraController';

const Experience = ({ phase }) => {
  return (
    <Canvas
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 2]} // Support high DPI screens
    >
      <color attach="background" args={['#000000']} />
      
      {/* Cinematic Camera Logic */}
      <CameraController phase={phase} />

      {/* Ambient Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={500} scale={50} size={4} speed={0.4} opacity={0.5} />

      <Suspense fallback={null}>
        <ParticleSystem phase={phase} />
      </Suspense>

      {/* Post Processing for Glow/Cinematic Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        maxDistance={100}
        minDistance={10}
        enableDamping
      />
    </Canvas>
  );
};

export default Experience;
