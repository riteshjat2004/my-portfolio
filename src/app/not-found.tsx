import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-extrabold text-zinc-800 tracking-widest select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-semibold text-cyan-400">
            Page Not Found
          </span>
        </div>

        <p className="max-w-md text-zinc-400 mb-8">
          The page you are looking for doesn&apos;t exist, was removed, or is temporarily unavailable.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-cyan-500 px-6 py-2.5 font-medium text-black transition hover:bg-cyan-400"
          >
            Return Home
          </Link>
          <Link
            href="/blogs"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-2.5 font-medium text-zinc-200 transition hover:bg-zinc-700"
          >
            Browse Blogs
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
