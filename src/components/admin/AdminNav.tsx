"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/api/authApi";

const adminNavLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Blogs", href: "/admin/blogs" },
  { label: "DevVault", href: "/admin/devvault" },
  { label: "Messages", href: "/admin/contact" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Resume", href: "/admin/resume" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Do not render admin navbar on login page
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      router.push("/admin/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-bold tracking-tight text-white hover:text-cyan-400 transition"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-base sm:text-lg">Admin Console</span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {adminNavLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? "bg-zinc-800 text-cyan-400 border border-zinc-700/60"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-cyan-400 transition py-1.5 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
          >
            Live Site
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
          >
            {loggingOut ? "Exiting..." : "Logout"}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle admin navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
          {adminNavLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-zinc-800 text-cyan-400 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/"
            target="_blank"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-cyan-400/90 hover:bg-zinc-900"
          >
            Live Portfolio ↗
          </Link>
        </div>
      )}
    </header>
  );
}
