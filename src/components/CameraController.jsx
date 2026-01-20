import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CameraController = ({ phase }) => {
  const vec = new THREE.Vector3();

  useFrame((state) => {
    let targetPos = new THREE.Vector3(0, 0, 0);

    // Define camera targets for each phase
    switch (phase) {
      case 'BIG_BANG':
        // Focus on the singularity in the void
        targetPos.set(0, 0, 15);
        break;
      case 'QGP':
        // Close up, intimate chaos
        targetPos.set(0, 0, 20); 
        break;
      case 'INFLATION':
        // Pull back rapidly to show expansion
        targetPos.set(0, 0, 80);
        break;
      case 'GALAXY':
        // High angle to see the spiral structure
        targetPos.set(0, 50, 40);
        break;
      case 'SOLAR_SYSTEM':
        // Mid-range, angled to see the disk and sun
        targetPos.set(0, 20, 45);
        break;
      default:
        targetPos.set(0, 20, 40);
    }

    // Smoothly interpolate current position to target
    // The 0.05 factor controls the speed/smoothness (lower = slower/smoother)
    state.camera.position.lerp(targetPos, 0.02);
    
    // Always look at the center of the universe
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraController;
