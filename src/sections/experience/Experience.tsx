import SectionTitle from "@/components/ui/SectionTitle";
import FadeIn from "@/components/ui/FadeIn";

const experiences = [
  {
    year: "2025",
    role: "Student Mentor",
    organization: "MANIT Bhopal",
    description:
      "Guided first-year students in academics, coding practices, and career development.",
  },
  {
    year: "2025",
    role: "IoT Summer Intern",
    organization: "PrepRight",
    description:
      "Worked on IoT concepts, sensors, microcontrollers, and real-world embedded systems applications.",
  },
  {
    year: "2023",
    role: "Mess Committee Member",
    organization: "MANIT Bhopal",
    description:
      "Coordinated communication and operations for facilities serving hundreds of students.",
  },
];

export default function Experience() {
  return (
    <FadeIn>
        <section
            id="experience"
            className="mx-auto max-w-6xl px-6 py-24"
        >
            <SectionTitle
            title="Experience"
            subtitle="Journey"
        />

        <div className="space-y-6">
            {experiences.map((item) => (
            <div
                key={item.role}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-cyan-400/30"
            >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-xl font-semibold text-white">
                    {item.role}
                </h3>

                <span className="text-cyan-400">
                    {item.year}
                </span>
                </div>

                <p className="mt-2 text-zinc-300">
                {item.organization}
                </p>

                <p className="mt-4 text-zinc-400">
                {item.description}
                </p>
            </div>
            ))}
        </div>
        </section>
    </FadeIn>
  );
}