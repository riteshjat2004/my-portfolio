"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  useProtectedRoute();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-4 text-zinc-400">
            Welcome to your admin panel
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/admin/login");
          }}
          className="rounded-xl bg-red-500 px-5 py-3"
        >
          Logout
        </button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/projects"
          className="rounded-2xl border border-zinc-800 p-6 transition hover:border-cyan-400"
        >
          <h2 className="text-2xl font-bold">
            Projects
          </h2>

          <p className="mt-2 text-zinc-400">
            Manage portfolio projects
          </p>
        </Link>

        <Link
          href="/admin/blogs"
          className="rounded-2xl border border-zinc-800 p-6 transition hover:border-cyan-400"
        >
          <h2 className="text-2xl font-bold">
            Blogs
          </h2>

          <p className="mt-2 text-zinc-400">
            Manage blog posts
          </p>
        </Link>

        <Link
          href="/admin/contact"
          className="rounded-2xl border border-zinc-800 p-6 transition hover:border-cyan-400"
        >
          <h2 className="text-2xl font-bold">
            Messages
          </h2>

          <p className="mt-2 text-zinc-400">
            View contact messages
          </p>
        </Link>
      </div>
    </main>
  );
}