"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DevVaultCategory,
  DevVaultContent,
  DevVaultBlock,
  DevVaultDifficulty,
  DevVaultStatus,
  DevVaultVisibility,
} from "@/types/devvault";
import { createDevVaultContent, updateDevVaultContent } from "@/api/devvaultApi";
import { slugify } from "@/utils/slugify";
import DevVaultBlockList from "./DevVaultBlockList";
import DevVaultBlockRenderer from "./DevVaultBlockRenderer";
import DevVaultImageUploader from "./DevVaultImageUploader";

interface DevVaultEditorProps {
  initialContent?: DevVaultContent | null;
  categories: DevVaultCategory[];
  onSaveSuccess: (content: DevVaultContent) => void;
  onCancel: () => void;
}

const CONTENT_TYPES = [
  { value: "article", label: "Article / Deep Dive" },
  { value: "guide", label: "Step-by-Step Guide" },
  { value: "system_design", label: "System Design & Architecture" },
  { value: "hardware_guide", label: "Hardware & Firmware Guide" },
  { value: "cheatsheet", label: "Cheatsheet & Quick Ref" },
  { value: "snippet", label: "Code Snippet / Pattern" },
  { value: "tool", label: "Tooling & Workflow" },
];

const DIFFICULTIES: Array<{ value: DevVaultDifficulty; label: string; color: string }> = [
  { value: "beginner", label: "Beginner", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { value: "intermediate", label: "Intermediate", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { value: "advanced", label: "Advanced", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
];

export default function DevVaultEditor({
  initialContent,
  categories,
  onSaveSuccess,
  onCancel,
}: DevVaultEditorProps) {
  // Mode: "edit" | "preview" | "split"
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [autoSlug, setAutoSlug] = useState(!initialContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form states
  const [title, setTitle] = useState(initialContent?.title || "");
  const [slug, setSlug] = useState(initialContent?.slug || "");
  const [shortDescription, setShortDescription] = useState(initialContent?.shortDescription || "");
  const [category, setCategory] = useState<string>(() => {
    if (!initialContent?.category) {
      return categories[0]?._id || "";
    }
    return typeof initialContent.category === "object"
      ? (initialContent.category as DevVaultCategory)._id
      : initialContent.category;
  });
  const [contentType, setContentType] = useState(initialContent?.contentType || "article");
  const [difficulty, setDifficulty] = useState<DevVaultDifficulty>(initialContent?.difficulty || "intermediate");
  const [tagsInput, setTagsInput] = useState((initialContent?.tags || []).join(", "));
  const [status, setStatus] = useState<DevVaultStatus>(initialContent?.status || "draft");
  const [visibility, setVisibility] = useState<DevVaultVisibility>(initialContent?.visibility || "visible");
  const [featured, setFeatured] = useState<boolean>(Boolean(initialContent?.featured));
  const [ordering, setOrdering] = useState<number>(initialContent?.ordering || 0);
  const [readingTime, setReadingTime] = useState<number>(initialContent?.readingTime || 5);
  const [coverImage, setCoverImage] = useState<string>(initialContent?.coverImage || "");

  // Content blocks
  const [blocks, setBlocks] = useState<DevVaultBlock[]>(() => {
    if (!initialContent?.content) return [];
    if (Array.isArray(initialContent.content)) return initialContent.content;
    if (typeof initialContent.content === "string") {
      return [
        {
          id: "legacy-1",
          type: "markdown",
          data: { markdown: initialContent.content },
        },
      ];
    }
    return [];
  });

  // Track changes
  const markDirty = () => setHasUnsavedChanges(true);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (autoSlug) {
      setSlug(slugify(newTitle));
    }
    markDirty();
  };

  const toggleAutoSlug = () => {
    const next = !autoSlug;
    setAutoSlug(next);
    if (next && title) {
      setSlug(slugify(title));
      markDirty();
    }
  };

  // Handle Save
  const handleSave = useCallback(
    async (explicitStatus?: DevVaultStatus) => {
      if (!title.trim()) {
        setFeedback({ type: "error", message: "Topic title is required." });
        return;
      }
      if (!category) {
        setFeedback({ type: "error", message: "Please select a category." });
        return;
      }

      const finalStatus = explicitStatus || status;
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload: Partial<DevVaultContent> = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        shortDescription: shortDescription.trim(),
        category,
        contentType,
        difficulty,
        tags: parsedTags,
        status: finalStatus,
        visibility,
        featured,
        ordering: Number(ordering) || 0,
        readingTime: Math.max(1, Number(readingTime) || 5),
        coverImage: coverImage.trim(),
        content: blocks,
      };

      try {
        setIsSubmitting(true);
        setFeedback(null);

        let savedContent: DevVaultContent;
        if (initialContent?._id) {
          savedContent = await updateDevVaultContent(initialContent._id, payload);
          setFeedback({ type: "success", message: "Topic updated successfully!" });
        } else {
          savedContent = await createDevVaultContent(payload);
          setFeedback({ type: "success", message: "Topic created successfully!" });
        }

        setHasUnsavedChanges(false);
        setTimeout(() => {
          onSaveSuccess(savedContent);
        }, 600);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err instanceof Error ? err.message : "Failed to save topic.");
        setFeedback({ type: "error", message: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      slug,
      shortDescription,
      category,
      contentType,
      difficulty,
      tagsInput,
      status,
      visibility,
      featured,
      ordering,
      readingTime,
      coverImage,
      blocks,
      initialContent,
      onSaveSuccess,
    ]
  );

  // Keyboard shortcut: Ctrl + S / Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Native browser guard for unsaved changes when closing / reloading tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Discard and exit?")) {
        return;
      }
    }
    onCancel();
  };

  const selectedCategoryObj = categories.find((c) => c._id === category);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 font-mono"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-black text-white">
              {initialContent ? "Edit DevVault Topic" : "New DevVault Topic"}
            </h2>
            {hasUnsavedChanges && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-mono text-amber-400">
                Unsaved Edits
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Author modular technical knowledge with live block rendering and Cloudinary media.
          </p>
        </div>

        {/* View Mode Switcher and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-1 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                viewMode === "edit"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                viewMode === "preview"
                  ? "bg-cyan-500 text-black shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Live Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:block rounded-lg px-3 py-1 font-semibold transition ${
                viewMode === "split"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Split View
            </button>
          </div>

          {/* Quick Save Draft */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition disabled:opacity-50"
          >
            Save Draft
          </button>

          {/* Publish Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : status === "published"
              ? "Update Published"
              : "🚀 Publish"}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 text-sm font-medium flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div
        className={`grid gap-8 ${
          viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* LEFT / EDIT CONTAINER */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md space-y-5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold border-b border-zinc-800/80 pb-3">
                Topic Metadata
              </h3>

              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Topic Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Docker Deep Dive or ESP32 Hardware & Pinout"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-base font-bold text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-zinc-400 font-semibold">
                        URL SLUG
                      </label>
                      <button
                        type="button"
                        onClick={toggleAutoSlug}
                        className={`text-[10px] font-mono transition ${
                          autoSlug ? "text-cyan-400" : "text-zinc-500"
                        }`}
                      >
                        {autoSlug ? "⚡ Auto-sync" : "Manual"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setAutoSlug(false);
                        markDirty();
                      }}
                      placeholder="topic-url-slug"
                      className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-cyan-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 font-semibold mb-1">
                      CATEGORY *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.icon ? `${c.icon} ` : ""}
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Short Description / Executive Summary
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    markDirty();
                  }}
                  placeholder="A concise 1-2 sentence overview of what this topic teaches..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Content Type, Difficulty, Ordering, Reading Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    CONTENT TYPE
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => {
                      setContentType(e.target.value);
                      markDirty();
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    DIFFICULTY
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value as DevVaultDifficulty);
                      markDirty();
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    DISPLAY ORDER #
                  </label>
                  <input
                    type="number"
                    value={ordering}
                    onChange={(e) => {
                      setOrdering(Number(e.target.value) || 0);
                      markDirty();
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    READING TIME (MINUTES)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => {
                      setReadingTime(Math.max(1, Number(e.target.value) || 1));
                      markDirty();
                    }}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 font-semibold mb-1">
                  TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => {
                    setTagsInput(e.target.value);
                    markDirty();
                  }}
                  placeholder="docker, containers, virtualization, linux, devops"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Cover Image Upload (Cloudinary) */}
              <DevVaultImageUploader
                currentUrl={coverImage}
                onUploadSuccess={(url) => {
                  setCoverImage(url);
                  markDirty();
                }}
                onRemove={() => {
                  setCoverImage("");
                  markDirty();
                }}
                label="Topic Header / Cover Image"
                helperText="Upload schematic or topic banner to Cloudinary"
              />

              {/* Status & Visibility Flags */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={status === "published"}
                    onChange={(e) => {
                      setStatus(e.target.checked ? "published" : "draft");
                      markDirty();
                    }}
                    className="rounded border-zinc-700 bg-zinc-800 text-cyan-400 focus:ring-0"
                  />
                  <span className="font-semibold text-zinc-200">
                    Published Live
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={visibility === "visible"}
                    onChange={(e) => {
                      setVisibility(e.target.checked ? "visible" : "hidden");
                      markDirty();
                    }}
                    className="rounded border-zinc-700 bg-zinc-800 text-cyan-400 focus:ring-0"
                  />
                  <span className="font-semibold text-zinc-200">
                    Visible in Portal
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      markDirty();
                    }}
                    className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0"
                  />
                  <span className="font-semibold text-amber-400">
                    ★ Featured Topic
                  </span>
                </label>
              </div>
            </div>

            {/* Block List Editor */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
              <DevVaultBlockList
                blocks={blocks}
                onChange={(updated) => {
                  setBlocks(updated);
                  markDirty();
                }}
              />
            </div>
          </div>
        )}

        {/* RIGHT / PREVIEW CONTAINER */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-8 backdrop-blur-md space-y-6 overflow-y-auto max-h-[85vh] sticky top-4">
            {/* Realistic Article Header Preview */}
            <div className="border-b border-zinc-800 pb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategoryObj && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-medium text-cyan-400">
                    <span>{selectedCategoryObj.icon || "🏛️"}</span>
                    <span>{selectedCategoryObj.name}</span>
                  </span>
                )}

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono capitalize ${
                    DIFFICULTIES.find((d) => d.value === difficulty)?.color ||
                    "text-zinc-400 border-zinc-800"
                  }`}
                >
                  {difficulty}
                </span>

                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400 capitalize">
                  {contentType.replace("_", " ")}
                </span>

                {featured && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-mono text-amber-400">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {title || "Untitled Topic Preview"}
              </h1>

              {shortDescription && (
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
                  {shortDescription}
                </p>
              )}

              {coverImage && (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 max-h-72 flex items-center justify-center bg-black/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={title}
                    className="max-h-72 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Block Body Preview */}
            <div className="pt-2">
              <DevVaultBlockRenderer blocks={blocks} interactive={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
