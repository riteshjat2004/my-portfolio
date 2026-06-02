import SectionTitle from "@/components/ui/SectionTitle";
import ProjectCard from "@/components/ui/ProjectCard";
import Loader from "@/components/ui/Loader";
import { projects } from "@/data/projects";
import FadeIn from "@/components/ui/FadeIn";

export default function Projects() {

  const loading = false;

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

        {
          loading ? (
            <Loader />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  technologies={project.technologies}
                  github={project.github}
                  demo={project.demo}
                />
              ))}
            </div>
          )
        }

      </section>
    </FadeIn>
  );
}