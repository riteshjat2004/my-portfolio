"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function AdminBlogs() {
  useProtectedRoute();

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Manage Blogs
      </h1>
      <p className="text-zinc-400">
        Blog management coming soon
      </p>
    </main>
  );
}
