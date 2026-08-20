"use client";

import React from "react";

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Primary Blue Orb — top left */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full animate-float-slow
          bg-brand-blue/20 dark:bg-brand-blue/15
          blur-[120px]"
      />

      {/* Deep Purple Orb — center right */}
      <div
        className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full animate-float-slower
          bg-brand-purple/15 dark:bg-brand-purple/12
          blur-[120px]"
      />

      {/* Cyan accent — bottom left */}
      <div
        className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full animate-float-slowest
          bg-brand-cyan/10 dark:bg-brand-cyan/8
          blur-[100px]"
      />

      {/* Subtle purple — top right (smaller) */}
      <div
        className="absolute top-10 right-1/3 w-[300px] h-[300px] rounded-full animate-float-slower
          bg-purple-500/8 dark:bg-purple-500/6
          blur-[80px]"
      />
    </div>
  );
}
