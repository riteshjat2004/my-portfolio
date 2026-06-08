"use client";

import { trackProjectClick } from "@/api/analyticsApi";

interface ProjectCardProps {
  projectId: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string;
}

export default function ProjectCard({
  projectId,
  title,
  description,
  technologies,
  github,
  demo,
}: ProjectCardProps) {
  const handleClick = (type: string) => {
    trackProjectClick(projectId);
  };

  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/10">
      <h3 className="text-2xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-zinc-400">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("github")}
          className="font-medium text-cyan-400 hover:text-cyan-300"
        >
          GitHub →
        </a>

        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("demo")}
          className="font-medium text-cyan-400 hover:text-cyan-300"
        >
          Live Demo →
        </a>
      </div>
    </div>
  );
}