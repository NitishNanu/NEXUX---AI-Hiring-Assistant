import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = window.innerWidth < 768 ? 500 : 3000;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 14;
      data[i * 3 + 1] = (Math.random() - 0.5) * 9;
      data[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return data;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    ref.current.rotation.y = pointer.x * 0.06 + clock.getElapsedTime() * 0.012;
    ref.current.rotation.x = -pointer.y * 0.035;
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
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.055} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function NexusBackground() {
  return (
    <div className="nexus-bg" aria-hidden="true">
      <div className="nexus-bg-base" />
      <Canvas className="nexus-bg-canvas" dpr={[1, 1.4]} camera={{ position: [0, 0, 6], fov: 60 }}>
        <StarField />
        <Nebula position={[-3.8, 1.6, -2]} color="#7C3AED" speed={0.35} />
        <Nebula position={[3.6, -1.2, -3]} color="#00FFD1" speed={0.28} />
        <Nebula position={[0.4, 2.7, -4]} color="#F59E0B" speed={0.22} />
        <Nebula position={[-1.6, -2.4, -2.5]} color="#FF4D6D" speed={0.31} />
        <Nebula position={[4.6, 2.2, -4.5]} color="#7C3AED" speed={0.18} />
        <Nebula position={[-4.8, -0.4, -4]} color="#00FF88" speed={0.2} />
      </Canvas>
      <svg className="nexus-grid" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <g className="animate-gridFly">
          {Array.from({ length: 34 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" x2="1200" y1={i * 32} y2={i * 32} />
          ))}
          {Array.from({ length: 25 }).map((_, i) => {
            const x = i * 50;
            return <line key={`v-${i}`} x1={x} y1="800" x2="600" y2="0" />;
          })}
        </g>
      </svg>
      <div className="nexus-noise" />
    </div>
  );
}
