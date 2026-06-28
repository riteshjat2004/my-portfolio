"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentResume, getResumeApiUrl, getResumeDownloadUrl } from "@/api/profile";

export default function ResumePage() {
  const [resume, setResume] = useState<{
    resumeUrl: string;
    resumeFileName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const data = await getCurrentResume();
        setResume(data);
        setError("");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setResume(null);
        } else {
          setError("Resume is currently unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Portfolio</p>
            <h1 className="mt-2 text-3xl font-bold">Resume Preview</h1>
            <p className="mt-2 text-zinc-400">
              Browse the latest uploaded resume without leaving the site.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Back to Portfolio
            </Link>

            {resume?.resumeUrl && (
              <a
                href={getResumeDownloadUrl()}
                download={resume?.resumeFileName || "resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                Download Resume
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-zinc-400">
            Loading resume...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-400">
            {error}
          </div>
        ) : resume?.resumeUrl ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2">
            <object
              data={getResumeApiUrl()}
              type="application/pdf"
              className="h-[75vh] w-full min-h-[600px] rounded-xl border-0 bg-white"
            >
              <div className="flex min-h-[600px] flex-col items-center justify-center gap-3 rounded-xl bg-white p-8 text-center text-zinc-700">
                <p className="text-lg font-semibold">Your browser could not render the PDF inline.</p>
                <a
                  href={getResumeApiUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black transition hover:bg-cyan-300"
                >
                  Open PDF in a new tab
                </a>
              </div>
            </object>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-zinc-400">
            No resume has been uploaded yet.
          </div>
        )}
      </div>
    </main>
  );
}
