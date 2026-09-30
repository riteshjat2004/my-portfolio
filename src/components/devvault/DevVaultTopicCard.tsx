"use client";

import React from "react";
import Link from "next/link";
import { DevVaultContent, DevVaultCategory } from "@/types/devvault";
import { formatDate } from "@/utils/readingTime";

interface DevVaultTopicCardProps {
  topic: DevVaultContent;
  showCategory?: boolean;
}

export default function DevVaultTopicCard({
  topic,
  showCategory = true,
}: DevVaultTopicCardProps) {
  const catSlug =
    typeof topic.category === "object"
      ? (topic.category as DevVaultCategory).slug
      : "general";

  const catName =
    typeof topic.category === "object"
      ? (topic.category as DevVaultCategory).name
      : "General";

  const catIcon =
    typeof topic.category === "object"
      ? (topic.category as DevVaultCategory).icon || "🏛️"
      : "🏛️";

  const readingTimeMinutes =
    topic.readingTime && topic.readingTime >= 1 ? topic.readingTime : 5;
  const readingTime = `${readingTimeMinutes} min read`;
  const formattedDate = formatDate(topic.createdAt);

  const difficultyColors: Record<string, string> = {
    beginner: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    intermediate: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    advanced: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  const diffClass =
    difficultyColors[topic.difficulty || "intermediate"] ||
    "text-zinc-400 border-zinc-700 bg-zinc-800";

  return (
    <Link
      href={`/devvault/${catSlug}/${topic.slug}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-cyan-950/20"
    >
      <div>
        {/* Cover Image or Technical Header Graphic */}
        {topic.coverImage ? (
          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={topic.coverImage}
              alt={topic.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {topic.featured && (
              <span className="absolute top-2.5 right-2.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                <span>★</span>
                <span>Featured</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            {showCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 font-mono">
                <span>{catIcon}</span>
                <span className="truncate max-w-[140px]">{catName}</span>
              </span>
            )}
            {topic.featured && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-400 font-bold ml-auto">
                ★ Featured
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
          {topic.title}
        </h3>

        {/* Short Description */}
        {topic.shortDescription && (
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {topic.shortDescription}
          </p>
        )}
      </div>

      {/* Footer Metadata */}
      <div className="mt-6 pt-4 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          {topic.difficulty && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${diffClass}`}
            >
              {topic.difficulty}
            </span>
          )}

          <span className="text-[11px] text-zinc-500">
            {topic.contentType ? topic.contentType.replace("_", " ") : "article"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
          <span>{readingTime}</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
