"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "DevVault", href: "/devvault" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();

  // Reset pending loading indicator as soon as navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setIsMenuOpen(false);

    // Hash link smooth scrolling on the home page
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // Immediate click feedback for route navigation (e.g. /devvault, /blogs)
    if (!href.startsWith("/#") && pathname !== href) {
      setPendingHref(href);
    }
  };

  const handleResumeClick = () => {
    setIsMenuOpen(false);
    if (pathname !== "/resume") {
      setPendingHref("/resume");
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl relative">
      {/* Top Edge Navigation Progress Bar for Immediate Feedback */}
      {pendingHref && (
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none z-50">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        </div>
      )}

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition"
        >
          <span className="text-cyan-400">Ritesh</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isPending = pendingHref === link.href;
            const isActive =
              link.href === "/devvault"
                ? pathname.startsWith("/devvault")
                : link.href === "/blogs"
                ? pathname.startsWith("/blogs")
                : pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className={`relative text-sm font-medium transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
                  isPending
                    ? "text-cyan-400 font-semibold"
                    : isActive
                    ? "text-cyan-400 font-semibold"
                    : "text-zinc-400 hover:text-cyan-400"
                }`}
              >
                <span>{link.label}</span>
                {isPending && (
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"
                    title="Opening..."
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/resume"
            onClick={handleResumeClick}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
              pendingHref === "/resume"
                ? "border-cyan-400 bg-cyan-400 text-black font-semibold"
                : "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            }`}
          >
            <span>Resume</span>
            {pendingHref === "/resume" && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black animate-ping" />
            )}
          </Link>
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
            {navLinks.map((link, index) => {
              const isPending = pendingHref === link.href;
              const isActive =
                link.href === "/devvault"
                  ? pathname.startsWith("/devvault")
                  : link.href === "/blogs"
                  ? pathname.startsWith("/blogs")
                  : pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className={`text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-between ${
                    isPending
                      ? "text-cyan-400 font-semibold"
                      : isActive
                      ? "text-cyan-400 font-semibold"
                      : "text-zinc-400 hover:text-cyan-400"
                  } ${
                    isMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                >
                  <span>{link.label}</span>
                  {isPending && (
                    <span className="text-xs font-mono text-cyan-400 animate-pulse">
                      Opening...
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/resume"
              onClick={handleResumeClick}
              className={`inline-block w-fit rounded-lg border border-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                pendingHref === "/resume"
                  ? "bg-cyan-400 text-black font-semibold"
                  : "text-cyan-400 hover:bg-cyan-400 hover:text-black"
              } ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
              style={{
                transitionDelay: isMenuOpen ? "150ms" : "0ms",
              }}
            >
              Resume
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}