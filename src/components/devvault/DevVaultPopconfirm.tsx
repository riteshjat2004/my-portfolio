"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DevVaultPopconfirmProps {
  title: string;
  onConfirm: () => void | Promise<void>;
  children: (openConfirm: () => void) => React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DevVaultPopconfirm({
  title,
  onConfirm,
  children,
  confirmLabel = "Yes",
  cancelLabel = "No",
}: DevVaultPopconfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  if (!isOpen) {
    return <>{children(() => setIsOpen(true))}</>;
  }

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/50 bg-zinc-950 px-2.5 py-1 text-xs shadow-xl shadow-black animate-in fade-in zoom-in-95 duration-100 z-30"
    >
      <span className="text-red-400 font-bold text-xs select-none">⚠️</span>
      <span className="text-[11px] font-semibold text-zinc-200 select-none whitespace-nowrap">
        {title}
      </span>
      <div className="flex items-center gap-1 ml-1">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing}
          className="rounded-md bg-red-600 hover:bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isProcessing ? "..." : confirmLabel}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isProcessing}
          className="rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300 hover:text-white transition cursor-pointer"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
