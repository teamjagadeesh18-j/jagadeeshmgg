"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  springOptions?: any;
  format?: (val: number) => string;
}

export function AnimatedNumber({
  value,
  className,
  duration = 2,
  format,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  const formattedText = format
    ? format(displayValue)
    : displayValue.toLocaleString("en-US");

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {formattedText}
    </span>
  );
}

export default AnimatedNumber;

