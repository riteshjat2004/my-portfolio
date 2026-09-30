"use client";

import { useEffect } from "react";
import { Project } from "@/types/project";
import { resolveProjectArchitecture } from "@/utils/projectArchitecture";

interface ProjectArchitectureModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectArchitectureModal({
  project,
  onClose,
}: ProjectArchitectureModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const { architecture, category, highlights } = resolveProjectArchitecture(project);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {category}
              </span>
              <span className="text-xs text-zinc-500 font-mono">Architecture Overview</span>
            </div>
            <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-white">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            aria-label="Close architecture modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
            {project.description}
          </p>

          {/* Interactive System Flow Diagram */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              System Topology & Component Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Client Node */}
              <div className="relative rounded-2xl border border-cyan-500/30 bg-zinc-900/60 p-4 transition hover:border-cyan-400">
                <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs uppercase tracking-wider mb-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Frontend Layer
                </div>
                <div className="text-sm font-semibold text-white">
                  {architecture.client}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  User interface, state management & client caching
                </p>
              </div>

              {/* API Node */}
              <div className="relative rounded-2xl border border-indigo-500/30 bg-zinc-900/60 p-4 transition hover:border-indigo-400">
                <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs uppercase tracking-wider mb-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  API & Business Logic
                </div>
                <div className="text-sm font-semibold text-white">
                  {architecture.api}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Authentication, request routing & controller logic
                </p>
              </div>

              {/* Data & Cloud Node */}
              <div className="relative rounded-2xl border border-emerald-500/30 bg-zinc-900/60 p-4 transition hover:border-emerald-400">
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs uppercase tracking-wider mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Persistence & Cloud
                </div>
                <div className="text-sm font-semibold text-white">
                  {architecture.database}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Indexed schemas & cloud deployment on {architecture.deployment}
                </p>
              </div>
            </div>
          </div>

          {/* Key Engineering Highlights */}
          {highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Key Engineering Highlights
              </h3>
              <ul className="space-y-2">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-cyan-400 mt-1 select-none">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack Pills */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Technologies & Tooling
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-mono text-cyan-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-5">
          <div className="flex gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
              >
                GitHub Repository ↗
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300 transition"
              >
                Live Demonstration ↗
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
