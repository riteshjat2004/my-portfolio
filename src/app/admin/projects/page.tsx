"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAdminProjects,
  deleteProject,
  createProject,
  updateProject,
} from "@/api/adminProjectApi";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  PROJECT_CATEGORIES,
  resolveProjectArchitecture,
} from "@/utils/projectArchitecture";

export default function AdminProjects() {
  const isAuthenticated = useProtectedRoute();
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Full Stack");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [featured, setFeatured] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getAdminProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((project) => project._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (project: any) => {
    setEditingId(project._id);
    setTitle(project.title);
    setCategory(
      project.category ||
        resolveProjectArchitecture(project).category ||
        "Full Stack"
    );
    setDescription(project.description);
    setTechnologies(
      Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : ""
    );
    setGithub(project.github || "");
    setDemo(project.demo || "");
    setFeatured(Boolean(project.featured));

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Full Stack");
    setDescription("");
    setTechnologies("");
    setGithub("");
    setDemo("");
    setFeatured(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      technologies: technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      github: github.trim(),
      demo: demo.trim(),
      featured,
    };

    if (editingId) {
      await updateProject(editingId, projectData);
    } else {
      await createProject(projectData);
    }

    resetForm();
    fetchProjects();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 sm:p-10 text-white">
        <p className="text-zinc-400">Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 sm:p-10 text-white max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Manage Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create, categorize, and feature projects on your live portfolio.
          </p>
        </div>
      </div>

      {/* Create / Edit Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mb-12 space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {editingId ? "Edit Project" : "Create New Project"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Project Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AI Financial Analyst, Edge IoT Sensor Gateway"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  category === cat
                    ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Description
          </label>
          <textarea
            required
            rows={4}
            placeholder="Detailed description of the problem solved, architecture decisions, and results..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Technologies (comma-separated)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. C++, FreeRTOS, ESP32, MQTT (or Next.js, TypeScript, Tailwind, Express)"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* URLs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              GitHub Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/..."
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Live Demo / Architecture Demo URL
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Featured Toggle */}
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-400 focus:ring-cyan-400"
          />
          <span className="text-sm font-medium text-zinc-300">
            Feature this project prominently on the homepage
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            className="rounded-xl bg-cyan-400 px-6 py-2.5 font-bold text-black transition hover:bg-cyan-300"
          >
            {editingId ? "Save Changes" : "Create Project"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Projects List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          All Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 p-8 text-center text-zinc-400">
            No projects found. Add your first project above!
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectCategory =
                project.category ||
                resolveProjectArchitecture(project).category ||
                "Full Stack";

              return (
                <div
                  key={project._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 gap-4 hover:border-zinc-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                        {projectCategory}
                      </span>
                      {project.featured && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                          ★ Featured
                        </span>
                      )}
                      <h3 className="font-bold text-white text-lg">
                        {project.title}
                      </h3>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(project.technologies || []).map((t: string) => (
                        <span
                          key={t}
                          className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(project)}
                      className="rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-black transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(project._id)}
                      className="rounded-xl bg-red-500/80 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-2">Delete Project?</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete this project? A copy will be preserved in trash history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}