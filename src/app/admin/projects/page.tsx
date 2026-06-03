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

export default function AdminProjects() {
  const [projects, setProjects] =
    useState<any[]>([]);

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

  const fetchProjects = async () => {
    const data =
      await getAdminProjects();

    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (
    id: string
  ) => {
    await deleteProject(id);

    fetchProjects();
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
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
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
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
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
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
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
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
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

      <div className="space-y-4">
        {projects.map(
          (project) => (
            <div
              key={project._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 p-5"
            >
              <div>
                <h2 className="font-semibold">
                  {project.title}
                </h2>

                <p className="text-zinc-400">
                  {project.description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleEdit(
                      project
                    )
                  }
                  className="rounded-lg bg-cyan-500 px-4 py-2"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      project._id
                    )
                  }
                  className="rounded-lg bg-red-500 px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}