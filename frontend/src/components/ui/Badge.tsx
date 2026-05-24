import type { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'violet' | 'gold' | 'emerald' | 'coral' | 'cyan';
  children: ReactNode;
  className?: string;
}

const toneMap = {
  violet: 'border-violet/40 bg-violet/10 text-glacier shadow-[0_0_24px_rgba(124,58,237,0.24)]',
  gold: 'border-gold/50 bg-gold/10 text-gold shadow-[0_0_24px_rgba(245,158,11,0.22)]',
  emerald: 'border-emerald/50 bg-emerald/10 text-emerald shadow-[0_0_24px_rgba(0,255,136,0.18)]',
  coral: 'border-coral/50 bg-coral/10 text-coral shadow-[0_0_24px_rgba(255,77,109,0.18)]',
  cyan: 'border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_24px_rgba(0,255,209,0.16)]'
};

export default function Badge({ tone = 'violet', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneMap[tone]} ${className}`}>
      {children}
    </span>
  );
}
