"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";

export default function DevVaultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DevVault Route Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-2xl font-mono text-red-400 mx-auto">
            ⚠
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              DevVault Encountered an Issue
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We couldn&apos;t load the requested technical knowledge content. This might be due to a temporary network issue or a missing resource.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-cyan-400 transition font-mono"
            >
              Try Again
            </button>
            <Link
              href="/devvault"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition font-mono flex items-center justify-center"
            >
              Return to DevVault Hub
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
