import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', as: Component = motion.div, ...props }) {
  return (
    <Component
      className={`glass-panel rounded-lg ${className}`}
      initial={props.initial}
      animate={props.animate}
      transition={props.transition}
      {...props}
    >
      {children}
    </Component>
  );
}
