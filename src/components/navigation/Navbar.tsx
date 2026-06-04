"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white"
        >
        <span className="text-cyan-400">Portfolio</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-all duration-300 ease-in-out hover:text-cyan-400"
            >
              {link.label}
            </a>
          ))}

          <a
            href="https://drive.google.com/file/d/1RmMlSXtGqk0s_NqU3li6rQqPLJ-Oe8S2/view?usp=sharing"
            target="_blank"
            className="rounded-lg border border-cyan-400 px-4 py-2 text-sm font-medium text-cyan-400 transition-all duration-300 ease-in-out hover:bg-cyan-400 hover:text-black"
          >
            Resume
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="relative h-6 w-6 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMenuOpen}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            {/* Top line */}
            <span
              className={`block h-0.5 w-6 origin-center bg-zinc-300 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            {/* Middle line */}
            <span
              className={`block h-0.5 w-6 bg-zinc-300 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
              }`}
            />
            {/* Bottom line */}
            <span
              className={`block h-0.5 w-6 origin-center bg-zinc-300 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        className={`border-t border-zinc-800 bg-black/90 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          isMenuOpen
            ? "max-h-80 opacity-100 visible"
            : "max-h-0 opacity-0 invisible"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-6">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleLinkClick}
                className={`text-sm font-medium text-zinc-400 transition-all duration-300 ease-in-out hover:text-cyan-400 ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://drive.google.com/file/d/1RmMlSXtGqk0s_NqU3li6rQqPLJ-Oe8S2/view?usp=sharing"
              target="_blank"
              onClick={handleLinkClick}
              className={`inline-block w-fit rounded-lg border border-cyan-400 px-4 py-2 text-sm font-medium text-cyan-400 transition-all duration-300 ease-in-out hover:bg-cyan-400 hover:text-black ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
              style={{
                transitionDelay: isMenuOpen ? "150ms" : "0ms",
              }}
            >
              Resume
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}