"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/utils/auth";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push(
        "/admin/login"
      );
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-zinc-400">
          Authentication successful.
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

      <div className="rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold">
          Blogs
        </h2>

        <p className="mt-2 text-zinc-400">
          Blog management coming soon
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold">
          Messages
        </h2>

        <p className="mt-2 text-zinc-400">
          Contact messages coming soon
        </p>
      </div>

    </div>
  </main>
);
}