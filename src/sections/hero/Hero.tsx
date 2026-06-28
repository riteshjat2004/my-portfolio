"use client";

import Link from "next/link";
import { trackResumeDownload } from "@/api/analyticsApi";

export default function Hero() {
  const handleResumeClick = async () => {
    await trackResumeDownload();
  };

  return (
    <section className="w-full flex min-h-[90vh] items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 py-20">
        
        <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400">
          Available for Internships & Opportunities
        </div>

        <h1 className="max-w-4xl text-6xl font-extrabold leading-tight tracking-tight text-white md:text-8xl">
          Hi, I'm{" "}
          <span className="text-cyan-400">
            Ritesh Jat
          </span>
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-zinc-300 md:text-5xl">
          Full Stack Developer • AI Enthusiast • ECE Undergraduate
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
          I'm an Electronics and Communication Engineering student at
          MANIT Bhopal passionate about Full Stack Development,
          Artificial Intelligence, Problem Solving, and building
          impactful software products.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300 hover:scale-105"
          >
            View Projects
          </a>

          <Link
            href="/resume"
            onClick={handleResumeClick}
            className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-400 hover:scale-105"
          >
            View Resume
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap gap-6 text-zinc-400">
          <span>📍 Bhopal, India</span>
          <span>🎓 MANIT Bhopal</span>
          <span>💻 Full Stack & AI</span>
        </div>
      </div>
    </section>
  );
}