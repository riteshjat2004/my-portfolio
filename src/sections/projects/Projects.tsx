"use client";

import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectArchitectureModal from "@/components/ui/ProjectArchitectureModal";
import Loader from "@/components/ui/Loader";
import FadeIn from "@/components/ui/FadeIn";
import { getProjects } from "@/api/projectApi";
import { Project } from "@/types/project";
import {
  resolveProjectArchitecture,
  PROJECT_CATEGORIES,
  normalizeCategory,
} from "@/utils/projectArchitecture";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 1. Sort projects so featured projects appear first
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return a.featured ? -1 : 1;
      }
      return 0;
    });
  }, [projects]);

  // 2. Compute categories and project counts based on normalized categories
  const categoryTabs = useMemo(() => {
    const counts: Record<string, number> = { All: sortedProjects.length };

    sortedProjects.forEach((p) => {
      const { category } = resolveProjectArchitecture(p);
      const normalized = normalizeCategory(category);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });

    const allNames = Array.from(
      new Set(["All", ...PROJECT_CATEGORIES, ...Object.keys(counts)])
    );

    return allNames.map((name) => ({
      name,
      count: counts[name] || 0,
    }));
  }, [sortedProjects]);

  // 3. Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return sortedProjects.filter((project) => {
      const { category } = resolveProjectArchitecture(project);
      const normalizedProjectCategory = normalizeCategory(category);
      const normalizedActive = normalizeCategory(activeCategory);

      const matchesCategory =
        activeCategory === "All" ||
        normalizedProjectCategory === normalizedActive;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.technologies || []).some((tech) =>
          tech.toLowerCase().includes(q)
        );

      return matchesCategory && matchesSearch;
    });
  }, [sortedProjects, activeCategory, searchQuery]);

  return (
    <FadeIn>
      <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
        <SectionTitle
          title="Featured Projects"
          subtitle="Portfolio & Engineering"
        />

        {/* Search & Category Filter Controls */}
        <div className="mt-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs with Counts */}
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map(({ name, count }) => {
              const isActive = activeCategory === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveCategory(name)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition inline-flex items-center gap-2 ${
                    isActive
                      ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20"
                      : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span>{name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive
                        ? "bg-black/20 text-black font-bold"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-xs">
            <input
              type="text"
              placeholder="Search stack or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 pl-9 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:border-cyan-400 focus:outline-none transition"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <Loader />
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center">
            <p className="text-lg font-medium text-zinc-300">
              No projects found under &ldquo;{activeCategory}&rdquo;.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Try switching categories, clearing your search query, or add a project from the admin console.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-5 rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-cyan-400 hover:bg-zinc-900 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onOpenArchitecture={(p) => setSelectedProject(p)}
              />
            ))}
          </div>
        )}

        {/* Interactive Architecture Modal */}
        <ProjectArchitectureModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </section>
    </FadeIn>
  );
}