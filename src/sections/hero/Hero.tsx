"use client";

import Link from "next/link";
import { useState } from "react";
import { trackResumeDownload } from "@/api/analyticsApi";

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const handleResumeClick = async () => {
    await trackResumeDownload();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("link4riteshjat@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full flex min-h-[90vh] items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-cyan-400 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Available for Internships & Full-Time Roles
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-7xl md:text-8xl">
          Hi, I&apos;m <span className="text-cyan-400">Ritesh Jat</span>
        </h1>

        <h2 className="mt-4 text-xl sm:text-2xl md:text-4xl font-semibold text-zinc-300">
          Full Stack Developer • Systems & AI Enthusiast • ECE @ MANIT Bhopal
        </h2>

        <p className="mt-8 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400">
          I&apos;m an Electronics and Communication Engineering undergraduate at MANIT Bhopal passionate about architecting scalable full-stack applications, intelligent AI pipelines, and high-performance software systems.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300 hover:scale-105"
          >
            View Projects
          </a>

          <Link
            href="/resume"
            onClick={handleResumeClick}
            className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-400 hover:scale-105"
          >
            View Resume
          </Link>

          <button
            onClick={handleCopyEmail}
            className="relative rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            title="Copy email to clipboard"
          >
            {copied ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Email
              </span>
            )}
          </button>
        </div>

        <div className="mt-12 flex flex-wrap gap-6 text-sm text-zinc-400 border-t border-zinc-900 pt-6">
          <span className="flex items-center gap-1.5">📍 Bhopal, India</span>
          <span className="flex items-center gap-1.5">🎓 MANIT Bhopal</span>
          <span className="flex items-center gap-1.5">💻 Full Stack & Distributed Systems</span>
          <a
            href="https://github.com/riteshjat2004"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:underline"
          >
            🐙 github.com/riteshjat2004 ↗
          </a>
        </div>
      </div>
    </section>
  );
}