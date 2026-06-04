"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getAdminProjects,
  deleteProject,
  createProject,
  updateProject,
} from "@/api/adminProjectApi";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function AdminProjects() {
  const isAuthenticated = useProtectedRoute();
  const [projects, setProjects] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [technologies, setTechnologies] =
    useState("");

  const [github, setGithub] =
    useState("");

  const [demo, setDemo] =
    useState("");

  const [featured, setFeatured] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const fetchProjects = async () => {
    try {
      const data =
        await getAdminProjects();

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

  const handleDelete = async (
    id: string
  ) => {
    setDeleting(true);
    try {
      await deleteProject(id);

      setProjects((prev) =>
        prev.filter(
          (project) => project._id !== id
        )
      );
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (
    project: any
  ) => {
    setEditingId(project._id);

    setTitle(project.title);

    setDescription(
      project.description
    );

    setTechnologies(
      project.technologies.join(", ")
    );

    setGithub(project.github);

    setDemo(project.demo);

    setFeatured(
      project.featured
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const projectData = {
      title,
      description,
      technologies:
        technologies
          .split(",")
          .map((tech) =>
            tech.trim()
          ),
      github,
      demo,
      featured,
    };

    if (editingId) {
      await updateProject(
        editingId,
        projectData
      );
    } else {
      await createProject(
        projectData
      );
    }

    setEditingId(null);

    setTitle("");
    setDescription("");
    setTechnologies("");
    setGithub("");
    setDemo("");
    setFeatured(false);

    fetchProjects();
  };

  // Prevent render until auth is confirmed
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-10 text-4xl font-bold">
        Manage Projects
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-4 rounded-2xl border border-zinc-800 p-6"
      >
        <h2 className="text-2xl font-bold">
          {editingId
            ? "Edit Project"
            : "Create Project"}
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
        />

        <input
          type="text"
          placeholder="Technologies (comma separated)"
          value={technologies}
          onChange={(e) =>
            setTechnologies(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
        />

        <input
          type="text"
          placeholder="GitHub URL"
          value={github}
          onChange={(e) =>
            setGithub(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
        />

        <input
          type="text"
          placeholder="Demo URL"
          value={demo}
          onChange={(e) =>
            setDemo(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
        />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) =>
              setFeatured(
                e.target.checked
              )
            }
          />

          Featured Project
        </label>

        <button
          type="submit"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-medium text-black"
        >
          {editingId
            ? "Update Project"
            : "Create Project"}
        </button>
      </form>

      {/* Statistics Card */}
      <div className="mb-10 rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold mb-2">
          Total Projects
        </h2>
        <p className="text-4xl font-bold text-cyan-400">
          {projects.length}
        </p>
      </div>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map(
            (project) => (
              <div
                key={project._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 p-5 gap-4"
              >
                <div>
                  <h2 className="font-semibold">
                    {project.title}
                  </h2>

                  <p className="text-zinc-400">
                    {project.description}
                  </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() =>
                      handleEdit(
                        project
                      )
                    }
                    className="rounded-lg bg-cyan-500 px-4 py-2 font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setDeleteConfirm(
                        project._id
                      )
                    }
                    className="rounded-lg bg-red-500 px-4 py-2 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-zinc-800 p-6 max-w-sm w-full bg-black">
            <h2 className="text-2xl font-bold mb-2">Delete Project</h2>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-zinc-800 px-4 py-2 font-medium transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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