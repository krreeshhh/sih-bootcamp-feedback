"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedContentProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  distance = 20,
  direction = "vertical",
  reverse = false,
  duration = 0.5,
  delay = 0,
  className = "",
  ...props
}: AnimatedContentProps) {
  const initialOffset = reverse ? -distance : distance;
  const initial =
    direction === "vertical"
      ? { opacity: 0, y: initialOffset }
      : { opacity: 0, x: initialOffset };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
