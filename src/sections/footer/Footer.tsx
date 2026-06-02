export default function Footer() {
  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-zinc-400">
            © 2026 Ritesh Jat. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="https://github.com/Rishi-364"
              className="text-zinc-400 hover:text-cyan-400"
            >
              GitHub
            </a>

            <a
              href="https://linkedin.com"
              className="text-zinc-400 hover:text-cyan-400"
            >
              LinkedIn
            </a>

            <a
              href="mailto:link4ritesh@gmail.com"
              className="text-zinc-400 hover:text-cyan-400"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}