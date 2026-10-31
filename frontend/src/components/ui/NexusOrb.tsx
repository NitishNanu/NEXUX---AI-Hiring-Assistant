// NexusOrb — pure CSS replacement for the previous Three.js / post-processing version.
// The old version ran a full WebGL canvas with Bloom + ChromaticAberration for a
// simple decorative element — extremely expensive. This version is visually equivalent
// using only CSS animations + transform, which run entirely on the compositor thread.

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
  className = '',
  ariaLabel = 'NEXUS animated orb',
}: NexusOrbProps) {
  const halfSize = size / 2;
  const innerSize = size * 0.75;
  const coreSize = size * 0.45;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
      aria-label={ariaLabel}
    >
      {/* Outer glow pulse */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
          animation: 'nexus-orb-pulse 3s ease-in-out infinite',
        }}
      />

      {/* Outer wireframe ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px solid ${glowColor}55`,
          animation: 'nexus-orb-spin-cw 8s linear infinite',
          boxShadow: `0 0 ${halfSize * 0.3}px ${glowColor}33`,
        }}
      />

      {/* Inner ring counter-rotating */}
      <div
        style={{
          position: 'absolute',
          inset: (size - innerSize) / 2,
          borderRadius: '50%',
          border: `1px dashed ${color}88`,
          animation: 'nexus-orb-spin-ccw 6s linear infinite',
        }}
      />

      {/* Core sphere */}
      <div
        style={{
          position: 'absolute',
          inset: (size - coreSize) / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88 50%, #050508 100%)`,
          boxShadow: `0 0 ${halfSize * 0.5}px ${color}66, inset 0 0 ${halfSize * 0.3}px ${glowColor}44`,
          animation: 'nexus-orb-breathe 2.5s ease-in-out infinite',
        }}
      />

      {/* Highlight spot */}
      <div
        style={{
          position: 'absolute',
          top: (size - coreSize) / 2 + coreSize * 0.12,
          left: (size - coreSize) / 2 + coreSize * 0.2,
          width: coreSize * 0.25,
          height: coreSize * 0.15,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
