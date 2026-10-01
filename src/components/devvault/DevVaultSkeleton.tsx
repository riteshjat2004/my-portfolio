import React from "react";

export default function DevVaultSkeleton() {
  return (
    <div className="space-y-20 animate-pulse">
      {/* 1. HERO SECTION SKELETON */}
      <section className="relative pt-6 pb-4 text-center max-w-4xl mx-auto space-y-6">
        {/* Eyebrow Badge Skeleton */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-4 py-1.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400/60" />
          <div className="h-3 w-48 sm:w-64 bg-zinc-800 rounded-md" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="h-9 sm:h-12 w-3/4 max-w-lg bg-zinc-800 rounded-2xl" />
          <div className="h-9 sm:h-12 w-1/2 max-w-md bg-gradient-to-r from-zinc-800 via-cyan-950/40 to-zinc-800 rounded-2xl" />
        </div>

        {/* Subtitle Skeleton */}
        <div className="space-y-2 max-w-2xl mx-auto flex flex-col items-center">
          <div className="h-4 w-full sm:w-5/6 bg-zinc-800/80 rounded-md" />
          <div className="h-4 w-3/4 sm:w-2/3 bg-zinc-800/60 rounded-md" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="pt-2 max-w-2xl mx-auto">
          <div className="h-13 sm:h-14 w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <div className="h-5 w-5 rounded-full bg-zinc-800 ml-2" />
              <div className="h-4 w-48 sm:w-72 bg-zinc-800/70 rounded-md" />
            </div>
            <div className="hidden sm:block h-6 w-12 rounded-lg bg-zinc-800/80 mr-2" />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY EXPLORER SKELETON */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-zinc-800 rounded-lg" />
            <div className="h-3.5 w-64 bg-zinc-800/60 rounded-md" />
          </div>
          <div className="h-4 w-28 bg-zinc-800/50 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 sm:p-7 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-800/90" />
                <div className="h-5 w-20 rounded-full bg-zinc-800/70" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-5 w-3/5 bg-zinc-800 rounded-md" />
                <div className="h-3.5 w-full bg-zinc-800/60 rounded-md" />
                <div className="h-3.5 w-4/5 bg-zinc-800/50 rounded-md" />
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
                <div className="h-4 w-24 bg-zinc-800/40 rounded-md" />
                <div className="h-4 w-4 rounded-full bg-zinc-800/40" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BRAIN TREASURE SECTION SKELETON */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-amber-500/20" />
              <div className="h-7 w-44 bg-zinc-800 rounded-lg" />
            </div>
            <div className="h-3.5 w-72 bg-zinc-800/60 rounded-md" />
          </div>
          <div className="h-4 w-36 bg-zinc-800/60 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-10 rounded-md bg-zinc-800" />
                  <div className="h-5 w-20 rounded-full bg-zinc-800/80" />
                </div>
                <div className="h-5 w-16 rounded-full bg-zinc-800/70" />
              </div>
              <div className="space-y-2 py-1">
                <div className="h-4 w-full bg-zinc-800/90 rounded-md" />
                <div className="h-4 w-5/6 bg-zinc-800/70 rounded-md" />
              </div>
              <div className="pt-2 border-t border-zinc-900 flex justify-end">
                <div className="h-7 w-28 rounded-lg bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RECENTLY PUBLISHED TOPICS SKELETON */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-zinc-800 rounded-lg" />
            <div className="h-3.5 w-64 bg-zinc-800/60 rounded-md" />
          </div>

          {/* Difficulty filter tabs skeleton */}
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="h-7 w-16 sm:w-20 rounded-xl bg-zinc-800/60" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 rounded-full bg-zinc-800/80" />
                  <div className="h-5 w-16 rounded-full bg-zinc-800/70" />
                </div>
                <div className="h-4 w-16 bg-zinc-800/50 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-4/5 bg-zinc-800 rounded-md" />
                <div className="h-3.5 w-full bg-zinc-800/60 rounded-md" />
                <div className="h-3.5 w-3/4 bg-zinc-800/50 rounded-md" />
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
                <div className="h-3.5 w-20 bg-zinc-800/40 rounded-md" />
                <div className="h-3.5 w-24 bg-zinc-800/50 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
