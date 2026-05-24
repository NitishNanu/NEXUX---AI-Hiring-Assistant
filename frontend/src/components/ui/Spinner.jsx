export default function Spinner({ className = 'h-4 w-4' }) {
  return (
    <span
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-white ${className}`}
    />
  );
}
