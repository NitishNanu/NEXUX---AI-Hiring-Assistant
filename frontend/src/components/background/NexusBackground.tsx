import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function StarField() {
  const ref = useRef<THREE.Points>(null);
  // Drastically reduced particle counts: 800 desktop / 200 mobile (was 3000 / 500)
  const positions = useMemo(() => {
    const count = window.innerWidth < 768 ? 200 : 800;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3]     = (Math.random() - 0.5) * 14;
      data[i * 3 + 1] = (Math.random() - 0.5) * 9;
      data[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return data;
  }, []);

  // Removed pointer tracking — just a slow constant rotation saves significant CPU
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.014} color="#F0F4FF" transparent opacity={0.68} />
    </points>
  );
}

// Reduced from 6 nebulae to 3 — still atmospheric but 50% less GPU work
function Nebula({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = position[0] + Math.sin(t) * 0.45;
    ref.current.position.y = position[1] + Math.cos(t * 0.75) * 0.35;
  });
  return (
    <mesh ref={ref} position={position}>
      {/* Reduced sphere segments from 32,32 to 16,16 — still round, much cheaper */}
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.055} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function NexusBackground() {
  return (
    <div className="nexus-bg" aria-hidden="true">
      <div className="nexus-bg-base" />
      {/* dpr capped at 1 for background — no need for retina quality on decorative bg */}
      <Canvas className="nexus-bg-canvas" dpr={1} camera={{ position: [0, 0, 6], fov: 60 }}>
        <StarField />
        <Nebula position={[-3.8, 1.6, -2]} color="#7C3AED" speed={0.35} />
        <Nebula position={[3.6, -1.2, -3]} color="#00FFD1" speed={0.28} />
        <Nebula position={[0.4, 2.7, -4]} color="#F59E0B" speed={0.22} />
      </Canvas>
      {/* Replaced animated SVG grid (59 lines + CSS animation) with a static CSS grid overlay */}
      <div className="nexus-grid-static" />
      <div className="nexus-noise" />
    </div>
  );
}
