"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  getAnalyticsStats,
  getTopPages,
  getTopProjects,
} from "@/api/analyticsApi";
import {
  AnalyticsStats,
  PageView,
  ProjectClick,
} from "@/types/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const isAuthenticated = useProtectedRoute();
  const [stats, setStats] =
    useState<AnalyticsStats | null>(null);
  const [topPages, setTopPages] = useState<
    PageView[]
  >([]);
  const [topProjects, setTopProjects] = useState<
    ProjectClick[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData =
          await getAnalyticsStats();
        setStats(statsData);

        const pagesData =
          await getTopPages();
        setTopPages(pagesData);

        const projectsData =
          await getTopProjects();
        setTopProjects(projectsData);
      } catch (error) {
        console.error(
          "Failed to fetch analytics:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prevent render until auth is confirmed
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>Loading analytics...</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>
          Failed to load analytics data
        </p>
      </main>
    );
  }

  // Prepare chart data - last 7 days only
  const dailyData = stats.dailyVisitors
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .slice(-7);

  // Get top 5 pages
  const topPagesData = topPages.slice(0, 5);

  // Get top 5 projects
  const topProjectsData = topProjects.slice(0, 5);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div>
        <h1 className="text-4xl font-bold">
          Analytics
        </h1>

        <p className="mt-2 text-zinc-400">
          Portfolio metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400">
            Total Visitors
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.totalVisitors}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400">
            Unique Visitors
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.uniqueVisitors}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400">
            Resume Downloads
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.resumeDownloads}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400">
            Contact Submissions
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.contactSubmissions}
          </p>
        </div>
      </div>

      {/* Daily Visitors Chart */}
      <div className="mt-8 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold">
          Daily Visitors (Last 7 Days)
        </h2>

        {dailyData.length > 0 ? (
          <div className="mt-4">
            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <LineChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  style={{
                    fontSize: "12px",
                  }}
                />

                <YAxis
                  stroke="#71717a"
                  style={{
                    fontSize: "12px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-zinc-500">
            No data yet
          </p>
        )}
      </div>

      {/* Top Pages */}
      <div className="mt-8 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold">
          Top Pages
        </h2>

        {topPagesData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {topPagesData.map((page, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-zinc-300">
                  {page.page}
                </span>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-zinc-800 rounded">
                    <div
                      className="h-full bg-cyan-500 rounded"
                      style={{
                        width: `${
                          (page.views /
                            Math.max(
                              ...topPagesData.map(
                                (p) => p.views
                              )
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="w-8 text-right text-sm font-medium text-cyan-400">
                    {page.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-zinc-500">
            No data yet
          </p>
        )}
      </div>

      {/* Top Projects */}
      <div className="mt-8 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold">
          Project Engagement
        </h2>

        {topProjectsData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {topProjectsData.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-zinc-300 font-mono">
                  {project.projectId.substring(
                    0,
                    12
                  )}
                  ...
                </span>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-zinc-800 rounded">
                    <div
                      className="h-full bg-cyan-500 rounded"
                      style={{
                        width: `${
                          (project.clicks /
                            Math.max(
                              ...topProjectsData.map(
                                (p) => p.clicks
                              )
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="w-8 text-right text-sm font-medium text-cyan-400">
                    {project.clicks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-zinc-500">
            No data yet
          </p>
        )}
      </div>
    </main>
  );
}