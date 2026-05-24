import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

interface OrbMeshProps {
  color: string;
  glowColor: string;
  speed: number;
  wireframe?: boolean;
}

function OrbMesh({ color, glowColor, speed, wireframe = true }: OrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * speed;
      meshRef.current.rotation.x = elapsed * speed * 0.33;
      meshRef.current.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.025);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + Math.sin(elapsed * 2.4) * 0.6;
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} color={glowColor} intensity={2} distance={4} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} emissive={glowColor} emissiveIntensity={0.35} />
      </mesh>
      {wireframe && (
        <mesh scale={1.08}>
          <icosahedronGeometry args={[1, 3]} />
          <meshBasicMaterial color={glowColor} wireframe transparent opacity={0.24} />
        </mesh>
      )}
    </group>
  );
}

interface NexusOrbProps {
  size?: number;
  color?: string;
  glowColor?: string;
  speed?: number;
  wireframe?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function NexusOrb({
  size = 96,
  color = '#7C3AED',
  glowColor = '#00FFD1',
  speed = 0.32,
  wireframe = true,
  className = '',
  ariaLabel = 'NEXUS animated orb'
}: NexusOrbProps) {
  return (
    <div className={className} style={{ width: size, height: size }} aria-label={ariaLabel}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3.2], fov: 42 }}>
        <ambientLight intensity={0.45} />
        <OrbMesh color={color} glowColor={glowColor} speed={speed} wireframe={wireframe} />
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.35} intensity={0.85} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0015, 0.0015)} radialModulation={false} modulationOffset={0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
