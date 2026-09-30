"use client";

import React, { useEffect, useState } from "react";

export default function DevVaultReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const scrollPercentage = Math.min(
        100,
        Math.max(0, (currentScroll / totalHeight) * 100)
      );
      setProgress(scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50 pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 shadow-sm shadow-cyan-400/50 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
