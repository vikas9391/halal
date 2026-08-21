import { motion, type Variants } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article";
  id?: string;
  role?: string;
  "aria-label"?: string;
  style?: CSSProperties;
};

const baseVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

// Fades + slides content up into view the first time it crosses the viewport.
// Respects prefers-reduced-motion automatically via framer-motion's defaults
// combined with the global CSS override in index.css.
export default function Reveal({ children, className, delay = 0, y = 28, as = "div", id, role, style, ...rest }: RevealProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      id={id}
      role={role}
      aria-label={rest["aria-label"]}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={baseVariants}
    >
      {children}
    </Component>
  );
}

// Small helper for staggering a group of direct children (e.g. grid cards).
export function RevealGroup({ children, className, as = "div" }: Omit<RevealProps, "delay" | "y">) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, className, as = "div" }: Omit<RevealProps, "delay" | "y">) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      variants={baseVariants}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
