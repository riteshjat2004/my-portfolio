"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDevVaultContent } from "@/api/devvaultApi";
import { DevVaultContent, DevVaultCategory } from "@/types/devvault";

interface DevVaultSearchBarProps {
  placeholder?: string;
  categoryFilter?: string;
  onSearchChange?: (query: string) => void;
  fullWidth?: boolean;
}

export default function DevVaultSearchBar({
  placeholder = "Search technologies, concepts, tools, commands...",
  categoryFilter,
  onSearchChange,
  fullWidth = true,
}: DevVaultSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DevVaultContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }

    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await getDevVaultContent({
          search: query.trim(),
          category: categoryFilter,
          limit: 6,
        });
        setResults(res.content || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, categoryFilter, onSearchChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      const top = results[0];
      const catSlug =
        typeof top.category === "object"
          ? (top.category as DevVaultCategory).slug
          : "general";
      router.push(`/devvault/${catSlug}/${top.slug}`);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "max-w-2xl"}`}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
          {loading ? (
            <span className="animate-spin text-sm">⏳</span>
          ) : (
            <span className="text-sm">🔍</span>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 py-3.5 pl-11 pr-12 text-sm sm:text-base text-white placeholder-zinc-500 backdrop-blur-md transition-all duration-200 focus:border-cyan-500/70 focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-xl"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("devvault:open-search"));
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 group cursor-pointer"
            title="Open Command Palette (Ctrl+K / ⌘K)"
          >
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
        )}
      </form>

      {/* Instant Results Popover */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono uppercase text-zinc-500 border-b border-zinc-800/80 mb-2">
            <span>Search Results ({results.length})</span>
            <span>Press Enter for top hit</span>
          </div>

          {results.length === 0 && !loading ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              <span className="text-xl block mb-1">🔍</span>
              No matching knowledge found for &quot;{query}&quot;.
              <div className="mt-1 text-[11px] text-zinc-500">
                Try searching for concepts like &quot;Docker&quot;, &quot;ESP32&quot;, &quot;REST API&quot;, or &quot;Linux&quot;.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => {
                const catSlug =
                  typeof item.category === "object"
                    ? (item.category as DevVaultCategory).slug
                    : "general";

                const catName =
                  typeof item.category === "object"
                    ? (item.category as DevVaultCategory).name
                    : "General";

                return (
                  <Link
                    key={item._id}
                    href={`/devvault/${catSlug}/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start justify-between gap-3 rounded-xl p-2.5 hover:bg-zinc-900 transition group"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition">
                        {item.title}
                      </div>
                      {item.shortDescription && (
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {item.shortDescription}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <span className="text-cyan-400/80">{catName}</span>
                        {item.difficulty && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{item.difficulty}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
