"use client";

import React, { useState } from "react";
import {
  DevVaultContent,
  DevVaultCategory,
  DevVaultStatus,
  DevVaultVisibility,
} from "@/types/devvault";
import {
  patchDevVaultContentStatus,
  deleteDevVaultContent,
} from "@/api/devvaultApi";
import DevVaultBlockRenderer from "./DevVaultBlockRenderer";
import DevVaultPopconfirm from "./DevVaultPopconfirm";

interface DevVaultContentTableProps {
  content: DevVaultContent[];
  categories: DevVaultCategory[];
  loading: boolean;
  onEdit: (item: DevVaultContent) => void;
  onRefresh: () => void;
}

export default function DevVaultContentTable({
  content,
  categories,
  loading,
  onEdit,
  onRefresh,
}: DevVaultContentTableProps) {
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "order" | "title">("newest");

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<DevVaultContent | null>(null);

  // Quick Action Handlers
  const handleToggleStatus = async (item: DevVaultContent) => {
    const nextStatus: DevVaultStatus =
      item.status === "published" ? "draft" : "published";
    try {
      await patchDevVaultContentStatus(item._id, { status: nextStatus });
      onRefresh();
    } catch (err: unknown) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleToggleVisibility = async (item: DevVaultContent) => {
    const nextVis: DevVaultVisibility =
      item.visibility === "visible" ? "hidden" : "visible";
    try {
      await patchDevVaultContentStatus(item._id, { visibility: nextVis });
      onRefresh();
    } catch (err: unknown) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  const handleToggleFeatured = async (item: DevVaultContent) => {
    try {
      await patchDevVaultContentStatus(item._id, { featured: !item.featured });
      onRefresh();
    } catch (err: unknown) {
      console.error("Failed to toggle featured:", err);
    }
  };

  // Client-side filtering & sorting
  const filtered = content.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.shortDescription.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }

    // Category
    if (selectedCategory !== "all") {
      const catId =
        typeof item.category === "object"
          ? (item.category as DevVaultCategory)._id
          : item.category;
      if (catId !== selectedCategory) return false;
    }

    // Status
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }

    // Visibility
    if (selectedVisibility !== "all" && item.visibility !== selectedVisibility) {
      return false;
    }

    // Type
    if (selectedType !== "all" && item.contentType !== selectedType) {
      return false;
    }

    // Difficulty
    if (
      selectedDifficulty !== "all" &&
      item.difficulty !== selectedDifficulty
    ) {
      return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "order") {
      return (a.ordering || 0) - (b.ordering || 0);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics by title, tag, or description..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "order" | "title")}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="order">Display Order</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="article">Article</option>
            <option value="guide">Guide</option>
            <option value="system_design">System Design</option>
            <option value="hardware_guide">Hardware Guide</option>
            <option value="cheatsheet">Cheatsheet</option>
            <option value="snippet">Snippet</option>
            <option value="tool">Tool</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="col-span-2 sm:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-5 py-3">Topic Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type & Level</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Visibility</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Loading DevVault topics...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                    {content.length === 0
                      ? "No DevVault topics created yet. Click '+ New Topic' above to begin."
                      : "No topics matched the selected filters."}
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const catName =
                    typeof item.category === "object"
                      ? (item.category as DevVaultCategory)?.name || "Uncategorized"
                      : categories.find((c) => c._id === item.category)?.name ||
                        "General";

                  const catIcon =
                    typeof item.category === "object"
                      ? (item.category as DevVaultCategory)?.icon
                      : categories.find((c) => c._id === item.category)?.icon || "🏛️";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-zinc-900/40 transition group"
                    >
                      {/* Title & Description */}
                      <td className="px-5 py-3.5 max-w-xs sm:max-w-md">
                        <div className="font-bold text-white group-hover:text-cyan-400 transition truncate">
                          {item.title}
                        </div>
                        {item.shortDescription && (
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="font-mono text-[10px] text-zinc-500">
                            /{item.slug}
                          </span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="text-[10px] text-cyan-400/70 font-mono">
                              • {item.tags.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                          <span>{catIcon}</span>
                          <span className="truncate max-w-[120px]">{catName}</span>
                        </span>
                      </td>

                      {/* Type & Difficulty */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 capitalize">
                            {item.contentType.replace("_", " ")}
                          </span>
                          {item.difficulty && (
                            <span
                              className={`block text-[10px] font-mono capitalize ${
                                item.difficulty === "beginner"
                                  ? "text-emerald-400"
                                  : item.difficulty === "intermediate"
                                  ? "text-amber-400"
                                  : "text-purple-400"
                              }`}
                            >
                              • {item.difficulty}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono transition ${
                            item.status === "published"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {item.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Visibility */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(item)}
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-mono transition ${
                            item.visibility === "visible"
                              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-500"
                          }`}
                        >
                          {item.visibility === "visible" ? "Visible" : "Hidden"}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          className={`text-base transition ${
                            item.featured
                              ? "text-amber-400 scale-110"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                          title={item.featured ? "Unfeature" : "Feature"}
                        >
                          ★
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                            title="Preview topic"
                          >
                            👁
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-cyan-400 hover:text-white transition"
                          >
                            Edit
                          </button>
                          <DevVaultPopconfirm
                            title="Delete topic?"
                            onConfirm={async () => {
                              try {
                                await deleteDevVaultContent(item._id);
                                onRefresh();
                              } catch (err: unknown) {
                                console.error("Failed to delete content:", err);
                              }
                            }}
                            confirmLabel="Delete"
                          >
                            {(openConfirm) => (
                              <button
                                type="button"
                                onClick={openConfirm}
                                className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                                title="Delete topic"
                              >
                                ✕
                              </button>
                            )}
                          </DevVaultPopconfirm>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono text-cyan-400">
                    👁 Live Public View Preview
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    /{previewItem.slug}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="rounded-xl border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  ✕ Close Preview
                </button>
              </div>

              {/* Title & Cover */}
              <div className="space-y-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {previewItem.title}
                </h1>
                {previewItem.shortDescription && (
                  <p className="text-base text-zinc-400 leading-relaxed">
                    {previewItem.shortDescription}
                  </p>
                )}
                {previewItem.coverImage && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 max-h-72 flex items-center justify-center bg-black/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewItem.coverImage}
                      alt={previewItem.title}
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Block Contents */}
              <DevVaultBlockRenderer
                blocks={previewItem.content}
                interactive={true}
              />
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-xs text-zinc-500 font-mono">
                Status: {previewItem.status} | Visibility: {previewItem.visibility}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = previewItem;
                    setPreviewItem(null);
                    onEdit(toEdit);
                  }}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300"
                >
                  Open in Editor
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
