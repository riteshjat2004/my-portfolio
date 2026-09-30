"use client";

import React, { useEffect, useCallback } from "react";

export interface LightboxImage {
  url: string;
  caption?: string;
  alt?: string;
}

interface DevVaultLightboxProps {
  isOpen: boolean;
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function DevVaultLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: DevVaultLightboxProps) {
  const currentImg = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation & Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImg) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image fullscreen viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-900/80 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300">
            {images.length > 1
              ? `${currentIndex + 1} / ${images.length}`
              : "Technical Diagram"}
          </span>
          {currentImg.caption && (
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline truncate max-w-md">
              {currentImg.caption}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close fullscreen image"
          className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center text-sm font-bold transition"
        >
          ✕
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-h-[85vh] max-w-6xl w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImg.url}
          alt={currentImg.alt || currentImg.caption || "Technical illustration"}
          className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-zinc-800/80 select-none"
        />

        {currentImg.caption && (
          <p className="mt-4 text-center text-xs sm:text-sm text-zinc-300 bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-xl max-w-xl">
            {currentImg.caption}
          </p>
        )}
      </div>

      {/* Previous / Next Navigation Arrows for Galleries */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-zinc-900/80 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center text-lg transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-zinc-900/80 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center text-lg transition"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
