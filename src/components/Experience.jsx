import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import CosmicDust from './CosmicDust';
import StarField from './StarField';
import CameraController from './CameraController';

const Experience = ({ phase }) => {
  return (
    <Canvas
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000000']} />
      
      <CameraController phase={phase} />

      {/* Background Static Stars */}
      <StarField />

      {/* Main Simulation: Volumetric Dust/Gas */}
      <Suspense fallback={null}>
        <CosmicDust phase={phase} />
      </Suspense>

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        {/* Intense Bloom for the 'Gas Cloud' glow */}
        <Bloom 
            luminanceThreshold={0.15} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.7}
        />
        {/* Film Grain for realism */}
        <Noise opacity={0.05} />
        {/* Darken corners */}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.2}
        maxDistance={120}
        minDistance={5}
        enableDamping
      />
    </Canvas>
  );
};

export default Experience;
