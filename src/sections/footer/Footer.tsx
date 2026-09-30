import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <p>© 2026 Ritesh Jat. All rights reserved.</p>
            <Link
              href="/admin/login"
              className="text-zinc-600 hover:text-cyan-400 transition ml-1 p-1 rounded hover:bg-zinc-800/50"
              title="Admin Portal (or press Ctrl + Shift + A)"
              aria-label="Admin Portal"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </Link>
          </div>

          <div className="flex gap-6">
            <a
              href="https://github.com/riteshjat2004"
              className="text-zinc-400 hover:text-cyan-400 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/ritesh-jat-634837291"
              className="text-zinc-400 hover:text-cyan-400 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=link4riteshjat@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-cyan-400 transition"
              title="Compose email to link4riteshjat@gmail.com in Gmail"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}