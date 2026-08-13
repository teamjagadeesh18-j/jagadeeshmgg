"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextShimmerWaveProps {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
  zDistance?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  as?: React.ElementType;
}

export function TextShimmerWave({
  children,
  className,
  duration = 1.5,
  spread = 1,
  zDistance = 1,
  scaleDistance = 1.1,
  rotateYDistance = 20,
  as: Component = "span",
}: TextShimmerWaveProps) {
  const characters = useMemo(() => {
    return children.split("");
  }, [children]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: (duration * 0.4) / Math.max(1, characters.length * (spread || 1)),
        repeat: Infinity,
        repeatDelay: 0.8,
      },
    },
  };

  const charVariants: Variants = {
    hidden: {
      opacity: 0.7,
      scale: 1,
      rotateY: 0,
      z: 0,
    },
    visible: {
      opacity: [0.7, 1, 0.7],
      scale: [1, scaleDistance, 1],
      rotateY: [0, rotateYDistance, 0],
      z: [0, zDistance * 8, 0],
      transition: {
        duration: duration * 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.span
      className={cn(
        "inline-wrap font-normal text-white/80",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: "inline",
        perspective: "600px",
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={charVariants}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
            transformStyle: "preserve-3d",
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default TextShimmerWave;
