import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: 'violet' | 'gold' | 'cyan' | 'emerald' | 'coral';
}

export default function GlassCard({ children, className = '', glow = 'violet', ...props }: GlassCardProps) {
  return (
    <div className={`nexus-glass nexus-glow-${glow} ${className}`} {...props}>
      {children}
    </div>
  );
}
