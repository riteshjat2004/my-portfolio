"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DevVaultBrainTreasure,
  DevVaultDifficulty,
  DevVaultStatus,
  DevVaultVisibility,
} from "@/types/devvault";
import {
  getAdminDevVaultBrainTreasure,
  createDevVaultBrainTreasure,
  updateDevVaultBrainTreasure,
  deleteDevVaultBrainTreasure,
  patchDevVaultBrainTreasureStatus,
} from "@/api/devvaultApi";

interface DevVaultBrainTreasureManagerProps {
  onRefreshParent?: () => void;
}

export default function DevVaultBrainTreasureManager({
  onRefreshParent,
}: DevVaultBrainTreasureManagerProps) {
  const [items, setItems] = useState<DevVaultBrainTreasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [availableBackgrounds, setAvailableBackgrounds] = useState<string[]>([]);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DevVaultBrainTreasure | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [technicalBackground, setTechnicalBackground] = useState("");
  const [difficulty, setDifficulty] = useState<DevVaultDifficulty>("intermediate");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [status, setStatus] = useState<DevVaultStatus>("published");
  const [visibility, setVisibility] = useState<DevVaultVisibility>("visible");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminDevVaultBrainTreasure();
      setItems(res.items || []);
      setAvailableBackgrounds(res.technicalBackgrounds || []);
    } catch (err) {
      console.error("Failed to load Brain Treasure questions:", err);
      setFeedback({ type: "error", message: "Failed to load Brain Treasure questions." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartCreate = () => {
    setEditingItem(null);
    const nextNum = items.length > 0
      ? Math.max(...items.map((i) => i.questionNumber || 0)) + 1
      : 1;
    setQuestionNumber(nextNum);
    setTechnicalBackground("");
    setDifficulty("intermediate");
    setQuestion("");
    setAnswer("");
    setDisplayOrder(items.length);
    setStatus("published");
    setVisibility("visible");
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleStartEdit = (item: DevVaultBrainTreasure) => {
    setEditingItem(item);
    setQuestionNumber(item.questionNumber);
    setTechnicalBackground(item.technicalBackground);
    setDifficulty(item.difficulty || "intermediate");
    setQuestion(item.question);
    setAnswer(item.answer);
    setDisplayOrder(item.displayOrder || 0);
    setStatus(item.status);
    setVisibility(item.visibility);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setFeedback({ type: "error", message: "Question text is required." });
      return;
    }
    if (!answer.trim()) {
      setFeedback({ type: "error", message: "Answer text is required." });
      return;
    }
    if (!technicalBackground.trim()) {
      setFeedback({ type: "error", message: "Technical background is required." });
      return;
    }
    if (questionNumber < 1) {
      setFeedback({ type: "error", message: "Question number must be at least 1." });
      return;
    }

    const payload: Partial<DevVaultBrainTreasure> = {
      questionNumber: Number(questionNumber),
      question: question.trim(),
      answer: answer.trim(),
      technicalBackground: technicalBackground.trim(),
      difficulty,
      status,
      visibility,
      displayOrder: Number(displayOrder) || 0,
    };

    try {
      setSaving(true);
      setFeedback(null);

      if (editingItem) {
        await updateDevVaultBrainTreasure(editingItem._id, payload);
        setFeedback({
          type: "success",
          message: `Question #${String(questionNumber).padStart(2, "0")} updated successfully!`,
        });
      } else {
        await createDevVaultBrainTreasure(payload);
        setFeedback({
          type: "success",
          message: `Question #${String(questionNumber).padStart(2, "0")} created successfully!`,
        });
      }

      setIsFormOpen(false);
      setEditingItem(null);
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: unknown) {
      console.error("Failed to save Brain Treasure:", err);
      const msg = err instanceof Error ? err.message : "Failed to save question.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: DevVaultBrainTreasure) => {
    const formatted = `#${String(item.questionNumber).padStart(2, "0")}`;
    if (!window.confirm(`Are you sure you want to delete question ${formatted} (${item.technicalBackground})?`)) {
      return;
    }

    try {
      await deleteDevVaultBrainTreasure(item._id);
      setFeedback({ type: "success", message: `Question ${formatted} deleted.` });
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Failed to delete question:", err);
      setFeedback({ type: "error", message: "Failed to delete question." });
    }
  };

  const handleToggleStatus = async (item: DevVaultBrainTreasure) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      await patchDevVaultBrainTreasureStatus(item._id, { status: nextStatus });
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i))
      );
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleToggleVisibility = async (item: DevVaultBrainTreasure) => {
    const nextVis = item.visibility === "visible" ? "hidden" : "visible";
    try {
      await patchDevVaultBrainTreasureStatus(item._id, { visibility: nextVis });
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, visibility: nextVis } : i))
      );
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  // Filtered items
  const filtered = items.filter((item) => {
    if (selectedBackground !== "all" && item.technicalBackground.toLowerCase() !== selectedBackground.toLowerCase()) {
      return false;
    }
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchQ = item.question.toLowerCase().includes(q);
      const matchA = item.answer.toLowerCase().includes(q);
      const matchT = item.technicalBackground.toLowerCase().includes(q);
      if (!matchQ && !matchA && !matchT) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🧠 Brain Treasure Questions</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              {items.length} Total
            </span>
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Curate technical questions and challenges with interactive revealable answers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
        >
          <span>+</span>
          <span>New Question</span>
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

      {/* Editor / Creation Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-cyan-500/40 bg-zinc-950 p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="text-base font-bold text-white">
              {editingItem
                ? `Edit Question #${String(editingItem.questionNumber).padStart(2, "0")}`
                : "Create New Brain Treasure Question"}
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Question Number */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                QUESTION NUMBER *
              </label>
              <input
                type="number"
                min={1}
                value={questionNumber}
                onChange={(e) => setQuestionNumber(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Shown as #{String(questionNumber).padStart(2, "0")}
              </span>
            </div>

            {/* Technical Background */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                TECHNICAL BACKGROUND *
              </label>
              <input
                type="text"
                value={technicalBackground}
                onChange={(e) => setTechnicalBackground(e.target.value)}
                placeholder="e.g. React, Git, DSA, Docker"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                DIFFICULTY
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DevVaultDifficulty)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                DISPLAY ORDER
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Controls sorting on homepage & lists
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              QUESTION *
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What happens when a component re-renders in React?"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          {/* Answer Text */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              ANSWER / EXPLANATION *
            </label>
            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a clear, in-depth explanation and mental model..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3.5 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none font-mono"
              required
            />
          </div>

          {/* Publishing & Visibility Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DevVaultStatus)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="published">Published (Live if visible)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                VISIBILITY
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as DevVaultVisibility)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="visible">Visible (Accessible publicly)</option>
                <option value="hidden">Hidden (Masked from public queries)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingItem ? "Update Question" : "Create Question"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, answers, or technical domains..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Domain Filter */}
        <select
          value={selectedBackground}
          onChange={(e) => setSelectedBackground(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">All Domains</option>
          {availableBackgrounds.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500">
          <span className="inline-block animate-spin mr-2">⏳</span>
          Loading Brain Treasure questions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500">
          <span className="text-2xl block mb-2">🧠</span>
          {items.length === 0
            ? "No Brain Treasure questions created yet. Click '+ New Question' to add your first challenge."
            : "No questions match your current search and filter criteria."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/70">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Topic / Domain</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-zinc-900/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                    #{String(item.questionNumber).padStart(2, "0")}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 font-mono text-[11px] text-zinc-300">
                      {item.technicalBackground}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-md">
                    <div className="font-semibold text-white truncate">
                      {item.question}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {item.answer}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${
                        item.difficulty === "beginner"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : item.difficulty === "advanced"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-zinc-400">
                    {item.displayOrder}
                  </td>

                  <td className="px-4 py-3 space-x-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono uppercase font-semibold transition ${
                        item.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono uppercase font-semibold transition ${
                        item.visibility === "visible"
                          ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {item.visibility}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-cyan-400 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
