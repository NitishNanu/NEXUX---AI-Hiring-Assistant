import { useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CollapsibleSection({ title, children, defaultOpen = false, meta }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="border-t border-surface-border py-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="flex items-center gap-2 text-xs text-white/45">
          {meta}
          <ChevronRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-6 text-white/62">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
