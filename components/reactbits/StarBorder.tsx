"use client";

import React from "react";

interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
}

export default function StarBorder({
  children,
  as: Component = "button",
  className = "",
  color = "#ffffff",
  speed = "5s",
  ...props
}: StarBorderProps) {
  return (
    <Component
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl p-[1px] ${className}`}
      {...props}
    >
      <div
        className="absolute inset-0 z-0 animate-star-movement"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 70%, ${color} 85%, transparent 100%)`,
          animation: `spin ${speed} linear infinite`,
        }}
      />
      <div className="relative z-10 w-full h-full rounded-[15px] flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
}
