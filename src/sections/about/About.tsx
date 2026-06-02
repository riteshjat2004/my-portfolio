import SectionTitle from "@/components/ui/SectionTitle";

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <SectionTitle
        title="About Me"
        subtitle="Introduction"
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-lg leading-8 text-zinc-400">
            I am an Electronics and Communication
            Engineering student at MANIT Bhopal
            passionate about Software Development,
            Artificial Intelligence, Problem Solving,
            and Full Stack Engineering.
          </p>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            I enjoy building scalable applications,
            exploring AI technologies, solving DSA
            problems, and working on projects that
            combine software with electronics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="text-3xl font-bold text-cyan-400">
              250+
            </h3>
            <p className="mt-2 text-zinc-400">
              DSA Problems Solved
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="text-3xl font-bold text-cyan-400">
              8.57
            </h3>
            <p className="mt-2 text-zinc-400">
              Current CGPA
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="text-3xl font-bold text-cyan-400">
              5+
            </h3>
            <p className="mt-2 text-zinc-400">
              Major Projects
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6">
            <h3 className="text-3xl font-bold text-cyan-400">
              ECE
            </h3>
            <p className="mt-2 text-zinc-400">
              Undergraduate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}