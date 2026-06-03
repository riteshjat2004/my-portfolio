"use client";

import { useEffect, useState } from "react";

import SectionTitle from "@/components/ui/SectionTitle";
import ProjectCard from "@/components/ui/ProjectCard";
import Loader from "@/components/ui/Loader";
import FadeIn from "@/components/ui/FadeIn";

import { getProjects } from "@/api/projectApi";
import { Project } from "@/types/project";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();

        // console.log("PROJECT DATA:", data); --> Debugging log to check the structure of the fetched data

        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <FadeIn>
      <section
        id="projects"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <SectionTitle
          title="Featured Projects"
          subtitle="Portfolio"
        />

        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                title={project.title}
                description={project.description}
                technologies={project.technologies}
                github={project.github}
                demo={project.demo}
              />
            ))}
          </div>
        )}
      </section>
    </FadeIn>
  );
}