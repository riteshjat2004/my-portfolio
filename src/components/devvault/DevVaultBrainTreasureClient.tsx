"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DevVaultBrainTreasure } from "@/types/devvault";
import DevVaultBrainTreasureCard from "./DevVaultBrainTreasureCard";

interface DevVaultBrainTreasureClientProps {
  initialItems: DevVaultBrainTreasure[];
  technicalBackgrounds: string[];
  total: number;
}

export default function DevVaultBrainTreasureClient({
  initialItems,
  technicalBackgrounds,
  total,
}: DevVaultBrainTreasureClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const difficulties = [
    { label: "All Levels", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  // Client filtering
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (
        selectedBackground !== "all" &&
        item.technicalBackground.toLowerCase() !== selectedBackground.toLowerCase()
      ) {
        return false;
      }

      if (selectedDifficulty !== "all" && item.difficulty !== selectedDifficulty) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inQ = item.question.toLowerCase().includes(q);
        const inA = item.answer.toLowerCase().includes(q);
        const inT = item.technicalBackground.toLowerCase().includes(q);
        const inNum = `#${String(item.questionNumber).padStart(2, "0")}`.includes(q);
        if (!inQ && !inA && !inT && !inNum) return false;
      }

      return true;
    });
  }, [initialItems, selectedBackground, selectedDifficulty, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <Link
          href="/devvault"
          className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <span>←</span>
          <span>Back to DevVault Home</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-400 mb-2">
              <span>🧠</span>
              <span>TECHNICAL CHALLENGES & MENTAL MODELS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Brain Treasure
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
              Test your engineering intuition. Formulate your solution first, then reveal the technical explanation and mental model.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-zinc-500 block">Total Challenges</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {total}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, keywords, mental models, or #number..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 backdrop-blur-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty and Domain Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Difficulty Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-950 p-1 text-xs">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`rounded-xl px-3 py-1 font-semibold transition ${
                  selectedDifficulty === diff.value
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-zinc-500">
            Showing {filteredItems.length} of {total} {total === 1 ? "question" : "questions"}
          </span>
        </div>

        {/* Dynamic Technical Background Pills */}
        {technicalBackgrounds.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedBackground("all")}
              className={`rounded-full px-3 py-1 transition border ${
                selectedBackground === "all"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              All Topics
            </button>
            {technicalBackgrounds.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedBackground(bg)}
                className={`rounded-full px-3 py-1 transition border whitespace-nowrap ${
                  selectedBackground.toLowerCase() === bg.toLowerCase()
                    ? "bg-zinc-800 border-zinc-700 text-cyan-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions Feed */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center text-zinc-500 space-y-3">
          <span className="text-3xl block">🔍</span>
          <p className="text-base text-zinc-300 font-semibold">No Brain Treasure questions match your criteria</p>
          <p className="text-xs text-zinc-500">
            Try adjusting your search query, difficulty level, or technical background filter.
          </p>
          {(searchQuery || selectedBackground !== "all" || selectedDifficulty !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedBackground("all");
                setSelectedDifficulty("all");
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredItems.map((item) => (
            <DevVaultBrainTreasureCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
