"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DevVaultCategory, DevVaultContent } from "@/types/devvault";
import DevVaultTopicCard from "./DevVaultTopicCard";

interface DevVaultCategoryClientProps {
  category: DevVaultCategory;
  initialTopics: DevVaultContent[];
}

export default function DevVaultCategoryClient({
  category,
  initialTopics,
}: DevVaultCategoryClientProps) {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const difficulties = [
    { label: "All Levels", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  // Derive unique content types present in this category
  const availableTypes = Array.from(
    new Set(initialTopics.map((t) => t.contentType || "article"))
  );

  // Filter topics
  const filteredTopics = initialTopics.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = t.shortDescription?.toLowerCase().includes(q);
      const inTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }

    if (selectedDifficulty !== "all" && t.difficulty !== selectedDifficulty) {
      return false;
    }

    if (selectedType !== "all" && t.contentType !== selectedType) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link href="/devvault" className="text-zinc-400 hover:text-cyan-400 transition">
          DevVault
        </Link>
        <span>/</span>
        <span className="text-cyan-400 font-semibold">{category.name}</span>
      </nav>

      {/* Category Header Hero */}
      <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 sm:p-10 backdrop-blur-md overflow-hidden">
        {category.coverImage && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.coverImage}
              alt={category.name}
              className="h-full w-full object-cover blur-sm"
            />
          </div>
        )}

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner">
              {category.icon || "🏛️"}
            </span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono text-cyan-400 font-semibold">
              {category.contentCount ?? initialTopics.length}{" "}
              {(category.contentCount ?? initialTopics.length) === 1 ? "Blueprint" : "Blueprints"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category-Specific Search Input */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search within ${category.name}...`}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`rounded-lg px-2.5 py-1.5 transition whitespace-nowrap ${
                  selectedDifficulty === diff.value
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* Content Type Filter (if multiple types) */}
          {availableTypes.length > 1 && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none capitalize"
            >
              <option value="all">All Formats</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-16 text-center text-zinc-500 space-y-3">
          <span className="text-3xl block">📚</span>
          <h3 className="text-base font-bold text-white">No matching topics</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {initialTopics.length === 0
              ? `No published blueprints currently in ${category.name}. Check back soon!`
              : `No topics match your current filter settings. Try clearing the search or difficulty.`}
          </p>
          {(search || selectedDifficulty !== "all" || selectedType !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedDifficulty("all");
                setSelectedType("all");
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <DevVaultTopicCard
              key={topic._id}
              topic={topic}
              showCategory={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
