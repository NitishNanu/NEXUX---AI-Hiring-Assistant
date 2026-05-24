const variants = {
  neutral: 'border-white/10 bg-white/[0.04] text-white/70',
  green: 'border-status-green/30 bg-status-green/10 text-status-green',
  amber: 'border-status-amber/30 bg-status-amber/10 text-status-amber',
  red: 'border-status-red/30 bg-status-red/10 text-status-red',
  indigo: 'border-brand-indigo/35 bg-brand-indigo/15 text-indigo-100',
  cyan: 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
