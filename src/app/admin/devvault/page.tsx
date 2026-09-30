"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  getAdminDevVaultCategories,
  getAdminDevVaultContentList,
  getAdminDevVaultContentById,
} from "@/api/devvaultApi";
import { DevVaultCategory, DevVaultContent } from "@/types/devvault";
import DevVaultContentTable from "@/components/devvault/DevVaultContentTable";
import DevVaultCategoryManager from "@/components/devvault/DevVaultCategoryManager";
import DevVaultBrainTreasureManager from "@/components/devvault/DevVaultBrainTreasureManager";
import DevVaultEditor from "@/components/devvault/DevVaultEditor";

export default function AdminDevVaultPage() {
  const isAuthenticated = useProtectedRoute();

  const [activeTab, setActiveTab] = useState<"topics" | "categories" | "brain-treasure">("topics");
  const [categories, setCategories] = useState<DevVaultCategory[]>([]);
  const [contentList, setContentList] = useState<DevVaultContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [editingContent, setEditingContent] = useState<DevVaultContent | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loadingContentItem, setLoadingContentItem] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, cont] = await Promise.all([
        getAdminDevVaultCategories(),
        getAdminDevVaultContentList(),
      ]);
      setCategories(cats || []);
      setContentList(cont.content || []);
    } catch (err) {
      console.error("Failed to load DevVault admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleStartCreate = () => {
    setEditingContent(null);
    setIsEditorOpen(true);
  };

  const handleStartEdit = async (item: DevVaultContent) => {
    try {
      setLoadingContentItem(true);
      // Fetch full content item (including full body blocks) by ID
      const fullItem = await getAdminDevVaultContentById(item._id);
      setEditingContent(fullItem || item);
      setIsEditorOpen(true);
    } catch (err) {
      console.error("Failed to fetch full content item:", err);
      setEditingContent(item);
      setIsEditorOpen(true);
    } finally {
      setLoadingContentItem(false);
    }
  };

  const handleSaveSuccess = () => {
    setIsEditorOpen(false);
    setEditingContent(null);
    fetchData();
  };

  if (!isAuthenticated) {
    return null;
  }

  // KPI Calculations
  const totalTopics = contentList.length;
  const publishedCount = contentList.filter((c) => c.status === "published").length;
  const draftCount = contentList.filter((c) => c.status === "draft").length;
  const hiddenCount = contentList.filter((c) => c.visibility === "hidden").length;
  const featuredCount = contentList.filter((c) => c.featured).length;

  return (
    <main className="min-h-screen bg-black px-4 py-8 sm:px-8 lg:px-12 text-white">
      {/* If Editor is open, show the full-screen technical CMS editor */}
      {isEditorOpen ? (
        <div className="max-w-7xl mx-auto">
          {loadingContentItem ? (
            <div className="py-24 text-center text-zinc-400">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Loading full technical topic blocks...
            </div>
          ) : (
            <DevVaultEditor
              initialContent={editingContent}
              categories={categories}
              onSaveSuccess={handleSaveSuccess}
              onCancel={() => {
                setIsEditorOpen(false);
                setEditingContent(null);
              }}
            />
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>DevVault Control Center</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-medium text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Dynamic CMS
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                Author, curate, and structure your technical knowledge base with extensible block architectures.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/devvault"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-400 hover:text-white"
              >
                <span>Live Portal</span>
                <span className="text-cyan-400 font-mono">↗</span>
              </Link>

              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
              >
                <span>+</span>
                <span>New Topic</span>
              </button>
            </div>
          </div>

          {/* Metric KPI Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-zinc-400">
                Total Topics
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : totalTopics}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-emerald-400">
                Published Live
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : publishedCount}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-amber-400">
                Drafts
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : draftCount}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-zinc-400">
                Hidden
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : hiddenCount}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-amber-400">
                Featured
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : featuredCount}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md">
              <div className="text-[11px] font-mono font-semibold uppercase text-cyan-400">
                Categories
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {loading ? "..." : categories.length}
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("topics")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "topics"
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>📚 Topics & Content</span>
              <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono">
                {contentList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "categories"
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>🏛️ Category Taxonomy</span>
              <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono">
                {categories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("brain-treasure")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "brain-treasure"
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>🧠 Brain Treasure</span>
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === "topics" ? (
            <DevVaultContentTable
              content={contentList}
              categories={categories}
              loading={loading}
              onEdit={handleStartEdit}
              onRefresh={fetchData}
            />
          ) : activeTab === "categories" ? (
            <DevVaultCategoryManager
              categories={categories}
              onRefresh={fetchData}
            />
          ) : (
            <DevVaultBrainTreasureManager
              onRefreshParent={fetchData}
            />
          )}
        </div>
      )}
    </main>
  );
}
