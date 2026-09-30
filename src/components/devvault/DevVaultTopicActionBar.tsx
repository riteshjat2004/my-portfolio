"use client";

import React, { useState } from "react";
import { DevVaultContent } from "@/types/devvault";
import { exportTopicToPdf } from "@/utils/devvaultPdfExporter";

interface DevVaultTopicActionBarProps {
  topic: DevVaultContent;
  relatedTopics?: DevVaultContent[];
}

export default function DevVaultTopicActionBar({
  topic,
  relatedTopics = [],
}: DevVaultTopicActionBarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleExportPdf = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      await exportTopicToPdf(topic, relatedTopics);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2600);
    } catch (err: unknown) {
      console.error("PDF export failed:", err);
      setExportError("PDF export failed. Please try again.");
      setTimeout(() => setExportError(null), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;

    try {
      navigator.clipboard.writeText(window.location.href);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {/* Export PDF Button */}
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={isExporting}
        aria-label="Export topic as PDF"
        title="Download printable technical PDF guide"
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-medium transition cursor-pointer disabled:cursor-not-allowed select-none ${
          exportSuccess
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/20"
            : exportError
            ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
            : isExporting
            ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-300"
            : "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-cyan-500/50 hover:bg-zinc-800 hover:text-white"
        }`}
      >
        {isExporting ? (
          <>
            <span className="inline-block animate-spin text-cyan-400">⏳</span>
            <span>Generating PDF...</span>
          </>
        ) : exportSuccess ? (
          <>
            <span className="text-emerald-400">✓</span>
            <span>PDF Downloaded</span>
          </>
        ) : exportError ? (
          <>
            <span>⚠️</span>
            <span>{exportError}</span>
          </>
        ) : (
          <>
            <span className="text-cyan-400">📄</span>
            <span>Export PDF</span>
          </>
        )}
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copy topic link to clipboard"
        title="Copy direct link to this blueprint"
        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition cursor-pointer select-none"
      >
        {isLinkCopied ? (
          <>
            <span className="text-cyan-400">✓</span>
            <span className="text-cyan-300">Link Copied</span>
          </>
        ) : (
          <>
            <span className="text-zinc-400">🔗</span>
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
