"use client";

import React, { useState } from "react";
import { DevVaultBrainTreasure } from "@/types/devvault";

interface DevVaultBrainTreasureCardProps {
  item: DevVaultBrainTreasure;
  defaultExpanded?: boolean;
}

export default function DevVaultBrainTreasureCard({
  item,
  defaultExpanded = false,
}: DevVaultBrainTreasureCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const formattedNumber = `#${String(item.questionNumber || 1).padStart(2, "0")}`;

  const difficultyColors: Record<string, string> = {
    beginner: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    intermediate: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    advanced: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  const diffClass =
    difficultyColors[item.difficulty || "intermediate"] ||
    "text-zinc-400 border-zinc-700 bg-zinc-800";

  return (
    <div className="group relative rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900/60 shadow-lg">
      {/* Top Metadata Row: #01 | Technical Background | Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
            {formattedNumber}
          </span>
          <span className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
            {item.technicalBackground}
          </span>
        </div>

        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider ${diffClass}`}
        >
          {item.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <div className="pt-4">
        <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed tracking-tight">
          {item.question}
        </h3>
      </div>

      {/* Answer Reveal Area */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/90 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-2">
              <span>💡</span>
              <span className="uppercase tracking-wider">Answer & Mental Model</span>
            </div>
            <div className="text-sm sm:text-base text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
              {item.answer}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: Reveal / Hide Toggle */}
      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-mono font-semibold transition-all ${
            isExpanded
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50"
          }`}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Hide Answer" : "Show Answer"}</span>
          <span className="text-xs transition-transform duration-200">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>
      </div>
    </div>
  );
}
