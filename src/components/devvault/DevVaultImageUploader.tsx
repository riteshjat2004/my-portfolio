"use client";

import React, { useState, useRef } from "react";
import { uploadDevVaultImage } from "@/api/devvaultApi";

interface DevVaultImageUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string, publicId?: string) => void;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
}

export default function DevVaultImageUploader({
  currentUrl,
  onUploadSuccess,
  onRemove,
  label = "Upload Image to Cloudinary",
  helperText = "PNG, JPG, WebP, SVG or GIF up to 10MB",
}: DevVaultImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB maximum limit.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await uploadDevVaultImage(file);
      onUploadSuccess(res.url, res.public_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleManualApply = () => {
    if (!manualUrl.trim()) return;
    onUploadSuccess(manualUrl.trim());
    setManualUrl("");
    setShowManualInput(false);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          {label}
        </label>
      )}

      {currentUrl ? (
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-28 w-36 shrink-0 rounded-xl overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Uploaded visual asset"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex-1 w-full space-y-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Cloudinary Asset
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 truncate select-all">
              {currentUrl}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 hover:border-cyan-400 hover:text-white transition"
              >
                {uploading ? "Uploading..." : "Replace Image"}
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition"
                title="Copy URL"
              >
                Copy URL
              </button>

              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition ml-auto"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/30 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 text-xl font-bold mb-3">
              {uploading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>☁️</span>
              )}
            </div>

            <p className="text-sm font-semibold text-white">
              {uploading
                ? "Uploading to Cloudinary..."
                : "Click to upload image or drag & drop"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-cyan-400 hover:underline"
            >
              {showManualInput ? "Hide manual URL" : "Or enter external/Cloudinary URL manually"}
            </button>
          </div>

          {showManualInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleManualApply}
                className="rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-cyan-300"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
