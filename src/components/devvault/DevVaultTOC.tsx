"use client";

import React, { useEffect, useState } from "react";
import { DevVaultBlock, HeadingBlockData } from "@/types/devvault";

interface DevVaultTOCProps {
  blocks: DevVaultBlock[] | string | Record<string, unknown> | null | undefined;
  variant?: "all" | "mobile" | "desktop";
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function DevVaultTOC({ blocks, variant = "all" }: DevVaultTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Extract heading items from blocks
  const items: TOCItem[] = React.useMemo(() => {
    if (!Array.isArray(blocks)) return [];

    const toc: TOCItem[] = [];
    for (const b of blocks) {
      if (b.type === "heading") {
        const d = (b.data || {}) as HeadingBlockData;
        const text = (d.text || "").trim();
        if (!text) continue;
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const numLevel = Number(d.level);
        const level = numLevel === 3 ? 3 : numLevel === 4 ? 4 : 2;

        toc.push({
          id: slug,
          text,
          level,
        });
      }
    }
    return toc;
  }, [blocks]);

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elPosition = el.getBoundingClientRect().top;
      const offsetPosition = elPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
      setIsOpenMobile(false);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <>
      {/* Mobile Accordion */}
      {variant !== "desktop" && (
        <div className="lg:hidden my-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <span>📑</span>
              <span>Table of Contents ({items.length})</span>
            </span>
            <span>{isOpenMobile ? "▲" : "▼"}</span>
          </button>

          {isOpenMobile && (
            <nav className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5 text-xs">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`block py-1 transition-colors ${
                    item.level === 4
                      ? "pl-7 text-zinc-500 text-[11px]"
                      : item.level === 3
                      ? "pl-4 text-zinc-400"
                      : "font-semibold text-zinc-200"
                  } ${
                    activeId === item.id
                      ? "text-cyan-400 font-bold"
                      : "hover:text-cyan-300"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      {variant !== "mobile" && (
        <aside className="hidden lg:block sticky top-28 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold pb-2 border-b border-zinc-800/80">
            <span>📑</span>
            <span>Table of Contents</span>
          </div>

          <nav className="space-y-1 text-xs max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const indentClass =
                item.level === 4
                  ? "pl-8 text-[11px] text-zinc-500"
                  : item.level === 3
                  ? "pl-5 text-xs text-zinc-400"
                  : "pl-2 font-medium text-zinc-300";

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  title={item.text}
                  className={`group flex items-start py-1.5 transition-all duration-200 ${indentClass} ${
                    isActive
                      ? "text-cyan-400 font-bold border-l-2 border-cyan-400 pl-3 bg-cyan-950/20 rounded-r-lg"
                      : "hover:text-zinc-200 hover:translate-x-0.5"
                  }`}
                >
                  <span className="leading-snug break-words">{item.text}</span>
                </a>
              );
            })}
          </nav>
        </aside>
      )}
    </>
  );
}
