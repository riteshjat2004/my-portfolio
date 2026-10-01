"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DevVaultError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log sanitized error locally for diagnostics without leaking to UI
    console.error("DevVault Route Error caught by boundary:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-8 py-20 flex flex-col items-center justify-center text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-mono text-rose-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>DEVVAULT CONNECTION STATUS</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Unable to load DevVault
        </h1>

        {/* Friendly explanation without raw stack traces */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-lg mb-8 leading-relaxed">
          Something went wrong while loading the technical knowledge base. This might be due to a temporary network issue or server connection.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
