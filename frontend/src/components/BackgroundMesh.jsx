import React from 'react';

// BackgroundMesh — replaced heavy Framer Motion blur-animated orbs with static
// CSS gradients. The previous version ran 3 motion.div elements with
// filter:blur(100-120px) animating x/y/scale indefinitely — CSS blur on large
// elements forces full GPU rasterization every frame, causing severe jank.
// Static gradients achieve the same visual result at virtually zero runtime cost.
const BackgroundMesh = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
      {/* Dark noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Static ambient glows — same colors, no animation, no blur repaint */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          transform: 'translate3d(0,0,0)', // promote to own compositor layer
        }}
      />

      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(100px)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      <div
        className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full mix-blend-screen opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(70px)',
          transform: 'translate3d(0,0,0)',
        }}
      />
    </div>
  );
};

export default BackgroundMesh;
