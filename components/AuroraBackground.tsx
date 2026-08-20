"use client";

import React from "react";

/**
 * Aurora Background — A subtle, animated aurora borealis effect.
 * Automatically swaps palettes between dark mode (deep space) and light mode (pastel sky).
 * Sits behind all UI at z-0.
 */
export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* ── Aurora Blob 1: Primary sweep (top-left → center) ── */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vh] rounded-full
          bg-gradient-to-br from-teal-300/20 via-blue-300/15 to-purple-300/10
          dark:from-emerald-600/15 dark:via-blue-700/12 dark:to-purple-800/10
          blur-[100px] animate-aurora-1"
      />

      {/* ── Aurora Blob 2: Secondary sweep (right → center) ── */}
      <div
        className="absolute top-[15%] -right-[15%] w-[55vw] h-[55vh] rounded-full
          bg-gradient-to-bl from-sky-300/15 via-indigo-300/12 to-violet-300/8
          dark:from-cyan-700/12 dark:via-indigo-800/10 dark:to-emerald-900/8
          blur-[120px] animate-aurora-2"
      />

      {/* ── Aurora Blob 3: Deep accent (bottom) ── */}
      <div
        className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[45vh] rounded-full
          bg-gradient-to-tr from-emerald-200/15 via-teal-200/10 to-sky-200/8
          dark:from-green-800/10 dark:via-teal-900/8 dark:to-blue-900/6
          blur-[110px] animate-aurora-3"
      />

      {/* ── Aurora Blob 4: Subtle lavender haze (top-right corner) ── */}
      <div
        className="absolute top-[5%] right-[10%] w-[35vw] h-[30vh] rounded-full
          bg-gradient-to-b from-lavender-200/12 via-fuchsia-200/8 to-transparent
          dark:from-purple-900/8 dark:via-violet-900/6 dark:to-transparent
          blur-[90px] animate-aurora-4"
      />
    </div>
  );
}
