import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Float } from '@react-three/drei';

// --- SHADERS ---

// 1. MYSTERY BACKGROUND (Fractal Noise)
const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  uniform float time;
  varying vec2 vUv;

  // Simple pseudo-random
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  // Noise function
  float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Slow drift
    float t = time * 0.1;
    
    // Domain warping for "Mystery"
    float q = fbm(uv + t * 0.5);
    float r = fbm(uv + q + t * 0.2);
    
    vec3 color = vec3(0.0);
    
    // Deep purple/blue gradient
    color = mix(vec3(0.0, 0.0, 0.1), vec3(0.1, 0.0, 0.2), r);
    
    // Add "Mandelbrot-ish" detailed edges via noise ridges
    float ridges = 1.0 - abs(r - 0.5) * 2.0;
    color += vec3(0.2, 0.1, 0.4) * pow(ridges, 3.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// 2. UNIVERSE BUBBLE SHADER (Swirling Galaxy Inside)
const bubbleVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bubbleFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // 1. Fresnel Rim Light (Bubble surface)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); 
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 1.5);
    
    // 2. Galaxy Swirl (Interior)
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Multi-layered spiral arms for density
    float spiral1 = sin(dist * 30.0 - angle * 3.0 + time * 3.0);
    float spiral2 = sin(dist * 15.0 - angle * 5.0 - time * 1.5);
    float core = exp(-dist * 8.0);
    
    vec3 galaxyColor = vec3(0.6, 0.4, 1.0) * (spiral1 * 0.5 + 0.5);
    galaxyColor += vec3(0.2, 0.7, 1.0) * (spiral2 * 0.5 + 0.5);
    galaxyColor += vec3(1.0, 1.0, 1.0) * core * 3.0; // Intense white core
    
    // Mask circle with soft edge
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    
    vec3 finalColor = galaxyColor + fresnel * vec3(0.5, 0.8, 1.0);
    // Boost brightness
    finalColor *= 1.5;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ... (Background remains similar but ensure it's at the back)

const Background = () => {
  const mesh = useRef();
  const uniforms = useRef({ time: { value: 0 } });
  
  useFrame((state) => {
    uniforms.current.time.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={mesh} position={[0, 0, -50]} frustumCulled={false}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={uniforms.current}
        depthWrite={false}
      />
    </mesh>
  );
};

const MultiverseField = ({ count = 150 }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const universes = useMemo(() => {
    return new Array(count).fill().map(() => ({
      position: [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 100 - 20
      ],
      scale: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.1
    }));
  }, [count]);

  const uniforms = useRef({ time: { value: 0 } });

  useFrame((state) => {
    uniforms.current.time.value = state.clock.getElapsedTime();
    
    universes.forEach((data, i) => {
        const t = state.clock.getElapsedTime();
        dummy.position.set(
            data.position[0] + Math.sin(t * data.speed + i) * 5,
            data.position[1] + Math.cos(t * data.speed + i) * 3,
            data.position[2]
        );
        dummy.scale.setScalar(data.scale);
        dummy.rotation.set(0, t * 0.2, 0);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={bubbleVertexShader}
        fragmentShader={bubbleFragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

const Singularity = ({ opacity }) => {
    return (
        <mesh position={[0, 0, -5]}> 
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshBasicMaterial 
                color={new THREE.Color(10, 10, 10)} 
                transparent 
                opacity={opacity} 
            />
        </mesh>
    );
};

// --- MAIN CINEMATIC CONTROLLER ---

const IntroExperience = ({ onComplete }) => {
  const { camera } = useThree();
  const [singularityOpacity, setSingularityOpacity] = useState(0);
  const [flash, setFlash] = useState(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (t < 12) {
        // High speed through multiverse
        camera.position.z = 80 - t * 8; 
        camera.position.x = Math.sin(t * 0.3) * 10;
        camera.position.y = Math.cos(t * 0.2) * 5;
        camera.lookAt(0, 0, -20);
    } else if (t < 18) {
        // Entering the void
        const p = (t - 12) / 6;
        camera.position.lerp(new THREE.Vector3(0, 0, 5), 0.1);
        camera.lookAt(0, 0, -5);
        if (t > 14) {
            setSingularityOpacity((t - 14) * 0.5);
        }
    } else if (t < 20) {
        // Extreme focus on singularity
        setSingularityOpacity(1.0 + Math.sin(t * 50.0) * 0.5); // Pulsate
        camera.position.z -= 0.1;
    } else {
        setFlash(1);
        onComplete();
    }
  });

  return (
    <>
      <Background />
      <MultiverseField count={150} />
      <Sparkles count={500} scale={100} size={4} speed={1} opacity={0.3} color="#ffffff" />
      <Singularity opacity={singularityOpacity} />
      {flash > 0 && (
          <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[10, 32, 32]} />
              <meshBasicMaterial color="white" side={THREE.BackSide} />
          </mesh>
      )}
    </>
  );
};

export default IntroExperience;