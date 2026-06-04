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
              href="/admin/login"
              className="text-zinc-400 hover:text-cyan-400"
            >
              Admin
            </a>
            
            <a
              href="https://github.com/riteshjat2004"
              className="text-zinc-400 hover:text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/ritesh-jat-634837291"
              className="text-zinc-400 hover:text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>

            <a
              href="mailto:link4riteshjat@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
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