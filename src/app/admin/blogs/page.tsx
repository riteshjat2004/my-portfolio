"use client";

import { useEffect, useState } from "react";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@/api/blogApi";
import { Blog } from "@/types/blog";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function AdminBlogs() {
  const isAuthenticated = useProtectedRoute();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  const fetchBlogs = async () => {
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEdit = (blog: Blog) => {
    setEditingId(blog._id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setTags(blog.tags.join(", "));
    setCoverImage(blog.coverImage);
    setPublished(blog.published);
  };

  const handleNewBlog = () => {
    setIsCreating(true);
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setTags("");
    setCoverImage("");
    setPublished(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const blogData: Omit<Blog, "_id"> = {
      title,
      slug,
      excerpt,
      content,
      tags: tags.split(",").map((tag) => tag.trim()),
      coverImage,
      published,
    };

    try {
      if (editingId) {
        await updateBlog(editingId, blogData);
      } else {
        await createBlog(blogData);
      }

      setEditingId(null);
      setIsCreating(false);
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setTags("");
      setCoverImage("");
      setPublished(false);

      fetchBlogs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  // Prevent render until auth is confirmed
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>Loading blogs...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold">
          Manage Blogs
        </h1>
        <button
          onClick={handleNewBlog}
          className="rounded-xl bg-cyan-400 px-5 py-3 font-medium text-black"
        >
          New Blog
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 space-y-4 rounded-2xl border border-zinc-800 p-6"
        >
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Blog" : "Create Blog"}
          </h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
            required
          />

          <input
            type="text"
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
            required
          />

          <textarea
            placeholder="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
            required
          />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white h-32"
            required
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
          />

          <input
            type="text"
            placeholder="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 px-5 py-3 font-medium text-black"
            >
              {editingId ? "Update Blog" : "Create Blog"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setIsCreating(false);
              }}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Statistics Card */}
      <div className="mb-10 rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold mb-2">
          Total Blogs
        </h2>
        <p className="text-4xl font-bold text-cyan-400">
          {blogs.length}
        </p>
      </div>

      {/* Empty State */}
      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 p-5 gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Cover Image Thumbnail */}
                {blog.coverImage && (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Blog Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="font-semibold">
                      {blog.title}
                    </h2>
                    {blog.published ? (
                      <span className="text-xs bg-cyan-500 text-black px-2 py-1 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs border border-zinc-700 text-zinc-400 px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-sm mb-2">
                    {blog.excerpt.length > 100
                      ? blog.excerpt.slice(0, 100) + "..."
                      : blog.excerpt}
                  </p>

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 mt-2">
                    Slug: {blog.slug}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedBlog(blog)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 flex-1 sm:flex-none"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(blog)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 flex-1 sm:flex-none"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(blog._id)}
                  className="rounded-lg bg-red-500 px-4 py-2 flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-zinc-800 p-6 max-w-sm w-full bg-black">
            <h2 className="text-2xl font-bold mb-2">Delete Blog</h2>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete this blog? This action cannot be undone.
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

      {/* View Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full bg-black max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Blog Details</h2>

            <div className="space-y-4 mb-6">
              {/* Title */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Title</p>
                <p className="text-white font-semibold">
                  {selectedBlog.title}
                </p>
              </div>

              {/* Slug */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Slug</p>
                <p className="text-zinc-300">
                  {selectedBlog.slug}
                </p>
              </div>

              {/* Cover Image */}
              {selectedBlog.coverImage && (
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Cover Image</p>
                  <img
                    src={selectedBlog.coverImage}
                    alt={selectedBlog.title}
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Excerpt</p>
                <p className="text-zinc-300">
                  {selectedBlog.excerpt}
                </p>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Content</p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                    {selectedBlog.content}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBlog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Published Status */}
              <div>
                <p className="text-sm text-zinc-400 mb-1">Status</p>
                <p className="text-white">
                  {selectedBlog.published ? (
                    <span className="bg-cyan-500 text-black px-3 py-1 rounded inline-block">
                      Published
                    </span>
                  ) : (
                    <span className="border border-zinc-700 text-zinc-400 px-3 py-1 rounded inline-block">
                      Draft
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBlog(null)}
                className="flex-1 rounded-lg border border-zinc-800 px-4 py-2 font-medium transition hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  handleEdit(selectedBlog);
                }}
                className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  setDeleteConfirm(selectedBlog._id);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
