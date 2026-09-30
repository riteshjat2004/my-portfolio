"use client";

import { trackProjectClick } from "@/api/analyticsApi";
import { Project } from "@/types/project";
import { resolveProjectArchitecture } from "@/utils/projectArchitecture";

interface ProjectCardProps {
  project: Project;
  onOpenArchitecture?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onOpenArchitecture,
}: ProjectCardProps) {
  const { title, description, technologies, github, demo, _id } = project;
  const { category } = resolveProjectArchitecture(project);

  const handleClick = () => {
    trackProjectClick(_id);
  };

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-950/70 p-7 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {category}
            </span>
            {project.featured && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 flex items-center gap-1">
                ★ Featured
              </span>
            )}
          </div>

          {onOpenArchitecture && (
            <button
              onClick={() => onOpenArchitecture(project)}
              className="text-xs font-mono text-zinc-400 hover:text-cyan-400 transition inline-flex items-center gap-1 group-hover:text-cyan-400"
            >
              <span>Architecture</span>
              <span className="text-cyan-400">⚡</span>
            </button>
          )}
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-zinc-400 text-sm line-clamp-3">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-zinc-800/80 bg-zinc-900/90 px-2.5 py-1 text-xs font-mono text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-zinc-900 pt-5">
        <div className="flex gap-4">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="text-sm font-semibold text-zinc-300 hover:text-cyan-400 transition"
            >
              GitHub ↗
            </a>
          )}

          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              Live Demo ↗
            </a>
          )}
        </div>

        {onOpenArchitecture && (
          <button
            onClick={() => onOpenArchitecture(project)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-cyan-500/50 hover:bg-zinc-800 hover:text-white"
          >
            Deep Dive
          </button>
        )}
      </div>
    </div>
  );
}