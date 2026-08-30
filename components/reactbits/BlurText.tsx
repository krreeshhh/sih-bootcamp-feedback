"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface BlurTextProps extends HTMLMotionProps<"h1"> {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
}

export default function BlurText({
  text,
  delay = 50,
  className = "",
  animateBy = "words",
  direction = "top",
  ...props
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <motion.h1 className={`inline-flex flex-wrap ${className}`} {...props}>
      {elements.map((segment, i) => (
        <motion.span
          key={i}
          initial={{
            filter: "blur(10px)",
            opacity: 0,
            y: direction === "top" ? -12 : 12,
          }}
          animate={{
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: (i * delay) / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {segment === " " ? "\u00A0" : segment}
        </motion.span>
      ))}
    </motion.h1>
  );
}
