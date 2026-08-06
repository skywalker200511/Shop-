import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className, children, hover = true, ...props }) => {
  return (
    <motion.div
      className={cn('glass-card', className)}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};
