import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

function isUrl(source) {
  try {
    return Boolean(new URL(source));
  } catch {
    return false;
  }
}

export default function CitationChip({ source, index = 0 }) {
  function handleClick() {
    if (isUrl(source)) {
      window.open(source, '_blank', 'noopener,noreferrer');
      return;
    }
    navigator.clipboard?.writeText(source);
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={handleClick}
      className="inline-flex max-w-[180px] items-center gap-1 truncate rounded-full border border-brand-cyan/30 bg-transparent px-2 py-1 text-[11px] text-brand-cyan transition hover:bg-brand-cyan/10"
    >
      <ExternalLink className="h-3 w-3 shrink-0" />
      <span className="truncate">{source}</span>
    </motion.button>
  );
}
