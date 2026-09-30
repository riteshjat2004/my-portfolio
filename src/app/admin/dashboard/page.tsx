"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getProjects } from "@/api/projectApi";
import { getAdminBlogs } from "@/api/blogApi";
import { getContacts } from "@/api/contactApi";
import { getAnalyticsStats } from "@/api/analyticsApi";
import { getCurrentResume } from "@/api/profile";
import { getAdminDevVaultCategories } from "@/api/devvaultApi";
import { Project } from "@/types/project";
import { Blog } from "@/types/blog";
import { Contact } from "@/types/contact";
import { AnalyticsStats } from "@/types/analytics";
import { DevVaultCategory } from "@/types/devvault";

export default function Dashboard() {
  const isAuthenticated = useProtectedRoute();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [resumeData, setResumeData] = useState<{
    resumeUrl?: string;
    resumeFileName?: string;
  } | null>(null);
  const [vaultCategories, setVaultCategories] = useState<DevVaultCategory[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        const [projectsRes, blogsRes, contactsRes, analyticsRes, resumeRes, vaultRes] =
          await Promise.allSettled([
            getProjects(),
            getAdminBlogs(),
            getContacts(),
            getAnalyticsStats(),
            getCurrentResume(),
            getAdminDevVaultCategories(),
          ]);

        if (projectsRes.status === "fulfilled") {
          setProjects(projectsRes.value || []);
        }
        if (blogsRes.status === "fulfilled") {
          setBlogs(blogsRes.value || []);
        }
        if (contactsRes.status === "fulfilled") {
          setContacts(contactsRes.value || []);
        }
        if (analyticsRes.status === "fulfilled") {
          setAnalytics(analyticsRes.value || null);
        }
        if (resumeRes.status === "fulfilled") {
          setResumeData(resumeRes.value || null);
        }
        if (vaultRes.status === "fulfilled") {
          setVaultCategories(vaultRes.value || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const featuredProjectsCount = projects.filter((p) => p.featured).length;
  const publishedBlogsCount = blogs.filter((b) => b.published).length;
  const totalVisitors = analytics?.totalVisitors ?? 0;
  const uniqueVisitors = analytics?.uniqueVisitors ?? 0;
  const resumeDownloads = analytics?.resumeDownloads ?? 0;

  return (
    <main className="min-h-screen bg-black px-6 py-10 sm:px-10 lg:px-12 text-white">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live & Operational
            </span>
          </div>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Welcome back! Here is a summary of your portfolio activity, content, and inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-400 hover:text-white"
          >
            <span>Live Portfolio</span>
            <span className="text-cyan-400 font-mono">↗</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Metric Row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Visitors */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Total Visitors</span>
            <span className="text-cyan-400 text-base">👥</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {loading ? "..." : totalVisitors}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {loading ? "Loading stats" : `${uniqueVisitors} unique visitors`}
          </p>
        </div>

        {/* Metric 2: Projects */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Active Projects</span>
            <span className="text-indigo-400 text-base">⚡</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {loading ? "..." : projects.length}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {loading ? "Loading projects" : `${featuredProjectsCount} featured on home`}
          </p>
        </div>

        {/* Metric 3: Blogs */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Published Blogs</span>
            <span className="text-purple-400 text-base">✍️</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {loading ? "..." : publishedBlogsCount}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {loading ? "Loading blogs" : `${blogs.length - publishedBlogsCount} drafts saved`}
          </p>
        </div>

        {/* Metric 4: Messages */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Contact Inquiries</span>
            <span className="text-emerald-400 text-base">💬</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {loading ? "..." : contacts.length}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {contacts.length > 0 ? "Latest inquiry received" : "No inquiries yet"}
          </p>
        </div>
      </div>

      {/* Main Section Grid: Management Hub + Recent Activity */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Left Column: Management Sections */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Control Center</span>
            <span className="text-xs font-mono text-zinc-500">Management & Content</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Projects Hub */}
            <div className="group rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-6 backdrop-blur-md transition hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    📁
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
                    {projects.length} Total
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-400 transition">
                  Projects
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Showcase engineering builds, architecture flows, tech stacks, and live demo links.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="/admin/projects"
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-cyan-300"
                >
                  Manage Projects →
                </Link>
              </div>
            </div>

            {/* Blogs Hub */}
            <div className="group rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-6 backdrop-blur-md transition hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                    ✍️
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
                    {publishedBlogsCount} Live
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-purple-400 transition">
                  Blog Articles
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Author Markdown articles with custom tags, excerpts, covers, and publish status.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="/admin/blogs"
                  className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500/20 hover:text-white"
                >
                  Manage Articles →
                </Link>
              </div>
            </div>

            {/* Messages Hub */}
            <div className="group rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-6 backdrop-blur-md transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    💬
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
                    {contacts.length} Messages
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-400 transition">
                  Contact Inquiries
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Review inquiries, feedback, recruiter messages, and client opportunities.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="/admin/contact"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white"
                >
                  View Messages →
                </Link>
              </div>
            </div>

            {/* Analytics Hub */}
            <div className="group rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-6 backdrop-blur-md transition hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    📊
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
                    {resumeDownloads} Downloads
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-amber-400 transition">
                  Analytics & Growth
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Track page popularity, project clicks, visitor sessions, and geographic trends.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="/admin/analytics"
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 hover:text-white"
                >
                  View Analytics →
                </Link>
              </div>
            </div>

            {/* DevVault Hub */}
            <div className="group rounded-3xl border border-zinc-800/90 bg-zinc-950/60 p-6 backdrop-blur-md transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    🏛️
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
                    {vaultCategories.length} Categories
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-400 transition">
                  DevVault Hub
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Dynamic technical knowledge base, system guides, notes, and category taxonomy.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href="/admin/devvault"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white"
                >
                  Manage DevVault →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Resume Status & Recent Messages Preview */}
        <div className="space-y-6">
          {/* Resume Snapshot Widget */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📄 Resume Status</span>
              </h3>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
                Active
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs text-zinc-400">Current file:</p>
              <p className="mt-1 text-sm font-semibold text-white font-mono truncate">
                {resumeData?.resumeFileName || "resume.pdf"}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span>Direct Downloads</span>
                <span className="font-bold text-white">{resumeDownloads}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/admin/resume"
                className="w-full text-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-cyan-400 hover:text-white transition"
              >
                Upload New PDF →
              </Link>
              <Link
                href="/resume"
                target="_blank"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-cyan-400 hover:bg-zinc-800 transition"
                title="Preview resume on public site"
              >
                ↗
              </Link>
            </div>
          </div>

          {/* Recent Messages Snapshot */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>💬 Recent Inquiries</span>
              </h3>
              <Link
                href="/admin/contact"
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                All ({contacts.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Loading messages...
              </div>
            ) : contacts.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No inquiries submitted yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {contacts.slice(0, 3).map((contact) => (
                  <div
                    key={contact._id}
                    className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-3.5 transition hover:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {contact.createdAt
                          ? new Date(contact.createdAt).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-cyan-400/80 truncate">
                      {contact.email}
                    </p>
                    <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}