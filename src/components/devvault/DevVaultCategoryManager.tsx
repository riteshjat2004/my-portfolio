"use client";

import React, { useState } from "react";
import { DevVaultCategory } from "@/types/devvault";
import {
  createDevVaultCategory,
  updateDevVaultCategory,
  deleteDevVaultCategory,
} from "@/api/devvaultApi";
import { slugify } from "@/utils/slugify";
import DevVaultImageUploader from "./DevVaultImageUploader";
import DevVaultPopconfirm from "./DevVaultPopconfirm";

interface DevVaultCategoryManagerProps {
  categories: DevVaultCategory[];
  onRefresh: () => void;
}

export default function DevVaultCategoryManager({
  categories,
  onRefresh,
}: DevVaultCategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<DevVaultCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const startCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setAutoSlug(true);
    setDescription("");
    setIcon("🏛️");
    setCoverImage("");
    setDisplayOrder(categories.length);
    setVisibility("visible");
    setIsCreating(true);
    setFeedback(null);
  };

  const startEdit = (cat: DevVaultCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setAutoSlug(false);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setCoverImage(cat.coverImage || "");
    setDisplayOrder(cat.displayOrder || 0);
    setVisibility(cat.visibility || "visible");
    setIsCreating(true);
    setFeedback(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Category name is required." });
      return;
    }

    const payload: Partial<DevVaultCategory> = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      icon: icon.trim(),
      coverImage: coverImage.trim(),
      displayOrder: Number(displayOrder) || 0,
      visibility,
    };

    try {
      setLoading(true);
      setFeedback(null);

      if (editingCategory) {
        await updateDevVaultCategory(editingCategory._id, payload);
        setFeedback({ type: "success", message: `Category "${name}" updated!` });
      } else {
        await createDevVaultCategory(payload);
        setFeedback({ type: "success", message: `Category "${name}" created!` });
      }

      setIsCreating(false);
      setEditingCategory(null);
      onRefresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : "Failed to save category.");
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (cat: DevVaultCategory) => {
    const newVis = cat.visibility === "visible" ? "hidden" : "visible";
    try {
      await updateDevVaultCategory(cat._id, { visibility: newVis });
      onRefresh();
    } catch (err: unknown) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Dynamic Category Taxonomy</span>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
              {categories.length} total
            </span>
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Define open technical domains (AI/ML, Systems, Firmware, Cloud, DevOps, DSA, etc.) with zero hardcoded constraints.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-cyan-300"
        >
          <span>+</span>
          <span>New Category</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Category Creation / Editing Modal or Card */}
      {isCreating && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-cyan-500/40 bg-zinc-950 p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="text-base font-bold text-white">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                CATEGORY NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Firmware & Embedded Systems"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                ICON / EMOJI
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. ⚡ or 🧠 or 🐳"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-zinc-400">
                  SLUG (URL KEY)
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[10px] font-mono text-cyan-400"
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
                }}
                placeholder="firmware-embedded"
                className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-cyan-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                DISPLAY ORDER
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              DESCRIPTION
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of topics belong in this category?"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <DevVaultImageUploader
            currentUrl={coverImage}
            onUploadSuccess={(url) => setCoverImage(url)}
            onRemove={() => setCoverImage("")}
            label="Category Banner / Cover Image (Optional)"
          />

          <div className="flex items-center gap-4 text-xs pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visibility === "visible"}
                onChange={(e) => setVisibility(e.target.checked ? "visible" : "hidden")}
                className="rounded border-zinc-700 bg-zinc-800 text-cyan-400 focus:ring-0"
              />
              <span className="font-semibold text-zinc-300">
                Visible to Public
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-black hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Topics</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-center">Visibility</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                    No categories created yet. Click &quot;New Category&quot; above to establish taxonomy.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-zinc-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base">
                          {cat.icon || "📁"}
                        </span>
                        <div>
                          <div className="font-bold text-white">{cat.name}</div>
                          {cat.description && (
                            <div className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md">
                              {cat.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-cyan-300">
                      {cat.slug}
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {cat.contentCount ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono text-zinc-400">
                      {cat.displayOrder ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(cat)}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono transition ${
                          cat.visibility === "visible"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {cat.visibility === "visible" ? "Visible" : "Hidden"}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-cyan-400 hover:text-white transition"
                        >
                          Edit
                        </button>
                        <DevVaultPopconfirm
                          title={cat.contentCount && cat.contentCount > 0 ? "Force delete category?" : "Delete category?"}
                          onConfirm={async () => {
                            const force = Boolean(cat.contentCount && cat.contentCount > 0);
                            try {
                              setLoading(true);
                              await deleteDevVaultCategory(cat._id, force);
                              setFeedback({ type: "success", message: `Category "${cat.name}" deleted.` });
                              onRefresh();
                            } catch (err: unknown) {
                              const msg =
                                (err as { response?: { data?: { message?: string } } })?.response?.data
                                  ?.message ||
                                (err instanceof Error ? err.message : "Failed to delete category.");
                              setFeedback({ type: "error", message: msg });
                            } finally {
                              setLoading(false);
                            }
                          }}
                          confirmLabel="Delete"
                        >
                          {(openConfirm) => (
                            <button
                              type="button"
                              onClick={openConfirm}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </DevVaultPopconfirm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
