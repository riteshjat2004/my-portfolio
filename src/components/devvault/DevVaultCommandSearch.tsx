"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDevVaultContent } from "@/api/devvaultApi";
import { DevVaultContent, DevVaultCategory } from "@/types/devvault";

export default function DevVaultCommandSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DevVaultContent[]>([]);
  const [suggestions, setSuggestions] = useState<DevVaultContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Ctrl + K / Cmd + K) and custom open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("devvault:open-search", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("devvault:open-search", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input & lock body scroll on open
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => inputRef.current?.focus(), 50);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Load initial suggestions if empty
    if (suggestions.length === 0) {
      getDevVaultContent({ limit: 5 })
        .then((res) => setSuggestions(res.content || []))
        .catch(() => {});
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, suggestions.length]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) return;

    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await getDevVaultContent({ search: query.trim(), limit: 6 });
        if (isCurrent) {
          setResults(res.content || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Command search error:", err);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  const displayList = query.trim() ? results : suggestions;

  const navigateToTopic = (topic: DevVaultContent) => {
    const catSlug =
      typeof topic.category === "object"
        ? (topic.category as DevVaultCategory).slug
        : "general";
    handleClose();
    router.push(`/devvault/${catSlug}/${topic.slug}`);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < displayList.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : displayList.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (displayList[selectedIndex]) {
        navigateToTopic(displayList[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* Floating Trigger button at bottom-right or triggerable via shortcut */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search DevVault (Ctrl + K)"
        className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-950/90 px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 shadow-2xl backdrop-blur-md hover:border-cyan-500/50 hover:text-white transition group"
      >
        <span className="text-sm">🔍</span>
        <span>Quick Search</span>
        <kbd className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400 group-hover:text-cyan-400">
          ⌘K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search DevVault"
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Search Input Bar */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-3.5 text-zinc-500 text-sm">
                {loading ? "⏳" : "🔍"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDownInInput}
                placeholder="Search concepts, guides, commands, technologies..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-11 pr-12 text-sm sm:text-base text-white placeholder-zinc-500 focus:border-cyan-500/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3.5 top-3.5 rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Results or Suggested Topics */}
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              <div className="px-2 py-1 text-[11px] font-mono uppercase text-zinc-500 flex justify-between">
                <span>
                  {query.trim()
                    ? `Results (${results.length})`
                    : "Suggested / Recent Blueprints"}
                </span>
                <span className="hidden sm:inline">Use ↑ ↓ and Enter to select</span>
              </div>

              {displayList.length === 0 && !loading ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No matching topics found for &quot;{query}&quot;.
                </div>
              ) : (
                displayList.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const catName =
                    typeof item.category === "object"
                      ? (item.category as DevVaultCategory).name
                      : "General";
                  const catIcon =
                    typeof item.category === "object"
                      ? (item.category as DevVaultCategory).icon || "🏛️"
                      : "🏛️";

                  return (
                    <div
                      key={item._id}
                      onClick={() => navigateToTopic(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-start justify-between gap-3 p-3 rounded-2xl transition cursor-pointer ${
                        isSelected
                          ? "bg-cyan-950/40 border border-cyan-500/40"
                          : "hover:bg-zinc-900/60 border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{catIcon}</span>
                          <span className="text-sm font-bold text-white truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.shortDescription && (
                          <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                            {item.shortDescription}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <span className="text-cyan-400/80">{catName}</span>
                          {item.difficulty && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{item.difficulty}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize">{item.contentType || "article"}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-mono transition ${
                          isSelected ? "text-cyan-400 translate-x-1" : "text-zinc-600"
                        }`}
                      >
                        →
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
