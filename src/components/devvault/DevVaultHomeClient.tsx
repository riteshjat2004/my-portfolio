"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DevVaultCategory, DevVaultContent, DevVaultBrainTreasure } from "@/types/devvault";
import DevVaultSearchBar from "./DevVaultSearchBar";
import DevVaultTopicCard from "./DevVaultTopicCard";
import DevVaultBrainTreasureCard from "./DevVaultBrainTreasureCard";

interface DevVaultHomeClientProps {
  categories: DevVaultCategory[];
  featuredTopics: DevVaultContent[];
  recentTopics: DevVaultContent[];
  brainTreasure?: DevVaultBrainTreasure[];
  totalBrainTreasure?: number;
}

export default function DevVaultHomeClient({
  categories,
  featuredTopics,
  recentTopics,
  brainTreasure = [],
  totalBrainTreasure = 0,
}: DevVaultHomeClientProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const difficulties = [
    { label: "All Levels", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  // Filter recent topics
  const filteredTopics = recentTopics.filter((t) => {
    if (selectedDifficulty !== "all" && t.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedCategory !== "all") {
      const catSlug =
        typeof t.category === "object"
          ? (t.category as DevVaultCategory).slug
          : t.category;
      if (catSlug !== selectedCategory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-4 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-mono text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>TECHNICAL KNOWLEDGE BASE & SYSTEM BLUEPRINTS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Understand the technology.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Don&apos;t just copy it.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          In-depth technical guides, architecture notes, firmware protocols, and mental models built for engineers and curious builders.
        </p>

        {/* Global Search Bar */}
        <div className="pt-2 max-w-2xl mx-auto">
          <DevVaultSearchBar placeholder="Search technologies, concepts, tools, commands..." />
        </div>
      </section>

      {/* 2. DYNAMIC CATEGORY EXPLORER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Explore Categories</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Browse technical domains organized into focused learning tracks.
            </p>
          </div>

          <span className="text-xs font-mono text-zinc-500">
            {categories.length} {categories.length === 1 ? "Domain" : "Domains"} Available
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500">
            No categories available yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/devvault/${cat.slug}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-cyan-950/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-cyan-500/40 transition-transform">
                      {cat.icon || "🏛️"}
                    </span>
                    <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
                      {cat.contentCount ?? 0} {cat.contentCount === 1 ? "topic" : "topics"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {cat.description || "Technical knowledge and documentation."}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Topics</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED KNOWLEDGE SHOWCASE */}
      {featuredTopics.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">★</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Featured Blueprints
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Foundational architecture breakdowns and comprehensive systems guides.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredTopics.map((topic) => (
              <DevVaultTopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {/* 4. DISCOVER / ALL TOPICS FEED */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recently Published Topics
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Fresh insights, tutorials, debugging checklists, and technical notes.
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
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
        </div>

        {/* Category Filter Pills (if multiple categories) */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3 py-1 transition border ${
                selectedCategory === "all"
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              All Domains
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setSelectedCategory(c.slug)}
                className={`rounded-full px-3 py-1 transition border whitespace-nowrap ${
                  selectedCategory === c.slug
                    ? "bg-zinc-800 border-zinc-700 text-cyan-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </button>
            ))}
          </div>
        )}

        {filteredTopics.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center text-zinc-500">
            <span className="text-2xl block mb-2">📚</span>
            {recentTopics.length === 0
              ? "No topics published yet. Check back soon as new blueprints are being curated."
              : "No topics match the selected difficulty and domain filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <DevVaultTopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </section>

      {/* 5. BRAIN TREASURE SECTION (MAX 5) */}
      {brainTreasure.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🧠 Brain Treasure</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Test your understanding. Think first, then reveal the answer.
              </p>
            </div>

            {totalBrainTreasure > 5 && (
              <Link
                href="/devvault/brain-treasure"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>View All ({totalBrainTreasure})</span>
                <span>→</span>
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {brainTreasure.slice(0, 5).map((item) => (
              <DevVaultBrainTreasureCard key={item._id} item={item} />
            ))}
          </div>

          {totalBrainTreasure > 5 && (
            <div className="pt-4 text-center">
              <Link
                href="/devvault/brain-treasure"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition shadow-lg shadow-cyan-950/20"
              >
                <span>Show All Questions</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
