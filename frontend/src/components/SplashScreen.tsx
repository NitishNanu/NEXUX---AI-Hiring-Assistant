import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function SplashParticles() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i += 1) {
      const t = i / 800;
      const angle = t * Math.PI * 18;
      const radius = 0.24 + Math.sin(t * Math.PI * 8) * 0.1;
      data[i * 3] = Math.cos(angle) * radius;
      data[i * 3 + 1] = (t - 0.5) * 3.2;
      data[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const elapsed = clock.getElapsedTime();
    points.current.rotation.y = elapsed * 0.5;
    points.current.rotation.z = Math.sin(elapsed) * 0.08;
    const scale = Math.min(1, 0.18 + elapsed * 0.8);
    points.current.scale.setScalar(scale);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={800} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} transparent opacity={0.92} color="#00FFD1" blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function SplashScreen() {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-void"
      initial={{ clipPath: 'circle(150% at 50% 50%)' }}
      animate={{ clipPath: 'circle(0% at 50% 50%)' }}
      transition={{ delay: 2.8, duration: 0.45, ease: [0.87, 0, 0.13, 1] }}
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
          <SplashParticles />
        </Canvas>
      </div>
      <motion.div className="relative z-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
        <div className="font-display text-6xl font-bold tracking-[0.22em] text-glacier md:text-8xl">
          {'NEXUS'.split('').map((letter, index) => (
            <motion.span
              key={letter}
              className="inline-block"
              initial={{ y: 80, opacity: 0, filter: 'blur(20px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 1.5 + index * 0.07, type: 'spring', stiffness: 140, damping: 16 }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <motion.div className="mt-5 font-mono text-xs uppercase tracking-[0.42em] text-cyan" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 2, duration: 0.5 }}>
          AI HIRING INTELLIGENCE<span className="ml-1 animate-cursorBlink">|</span>
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-1/2 h-px bg-violet shadow-[0_0_30px_#7C3AED]" initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: [0, 1, 0] }} transition={{ delay: 2.5, duration: 0.5 }} />
    </motion.div>
  );
}
