"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
  as?: React.ElementType;
}

export function TextShimmer({
  children,
  className,
  duration = 2,
  spread = 2,
  as: Component = "span",
}: TextShimmerProps) {
  return (
    <motion.span
      className={cn("inline-block text-gradient", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.4) 100%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      initial={{ backgroundPosition: "-100% 0" }}
      animate={{ backgroundPosition: "100% 0" }}
      transition={{
        repeat: Infinity,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}

export default TextShimmer;
