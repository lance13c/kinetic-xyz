'use client';
import type { Rect } from '@/context/AnimatePositionRef';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

interface AnimateWatchlistItemProps {
  imageSrc: string;
  startRect: Rect;
  targetRect: Rect;
  duration?: number;
  onAnimationComplete: () => void;
}

const AnimateWatchlistItem: React.FC<AnimateWatchlistItemProps> = ({
  imageSrc,
  startRect,
  targetRect,
  duration = 0.5,
  onAnimationComplete,
}) => {
  return (
    <motion.div
      initial={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: startRect.width,
        height: startRect.height,
        scale: 1,
        opacity: 1,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: `translate(${startRect.left}px, ${startRect.top}px)`,
      }}
      animate={{
        transform: [
          `translate(${startRect.left}px, ${startRect.top}px) scale(1)`,
          `translate(${(startRect.left + targetRect.left) / 2}px, ${Math.min(startRect.top, targetRect.top) - 50}px) scale(0.9)`,
          `translate(${targetRect.left}px, ${targetRect.top}px) scale(0.8)`
        ],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        ease: "easeOut",
        opacity: {
          times: [0, 0.7, 1],
        },
        transform: {
          times: [0, 0.5, 1],
          ease: "easeInOut",
        }
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <Image src={imageSrc} alt="Animated icon" fill style={{ objectFit: 'cover' }} />
    </motion.div>
  );
};

export default AnimateWatchlistItem;
