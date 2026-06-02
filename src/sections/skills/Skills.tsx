import SectionTitle from "@/components/ui/SectionTitle";
import SkillCard from "@/components/ui/SkillCard";
import { skillCategories } from "@/data/skills";
import FadeIn from "@/components/ui/FadeIn";

export default function Skills() {
  return (
    <FadeIn>
        <section
        id="skills"
        className="mx-auto max-w-6xl px-6 py-24"
        >
        <SectionTitle
            title="Skills & Technologies"
            subtitle="Technical Expertise"
        />

        <div className="grid gap-6 md:grid-cols-2">
            {skillCategories.map((category) => (
            <SkillCard
                key={category.title}
                title={category.title}
                skills={category.skills}
            />
            ))}
        </div>
        </section>
    </FadeIn>
  );
}