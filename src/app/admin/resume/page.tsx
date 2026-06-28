"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getCurrentResume, getResumeApiUrl, uploadResumeFile } from "@/api/profile";

export default function ResumePage() {
  const isAuthenticated = useProtectedRoute();
  const [resume, setResume] = useState<{
    resumeUrl: string;
    resumeFileName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        setError("Unable to load the current resume right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setError("Resume must be 5MB or smaller.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Choose a PDF file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const data = await uploadResumeFile(selectedFile);
      setResume({
        resumeUrl: data.resumeUrl,
        resumeFileName: data.resumeFileName || selectedFile.name,
      });
      setSuccess("Resume updated successfully.");
      setSelectedFile(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Unable to upload the resume right now.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Resume Management</h1>
        <p className="mt-3 text-zinc-400">
          Upload and update the resume that appears on the public portfolio.
        </p>

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <h2 className="text-2xl font-semibold">Current Resume Status</h2>

          {loading ? (
            <p className="mt-4 text-zinc-400">Loading resume details...</p>
          ) : resume?.resumeUrl ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-400">Active resume</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {resume.resumeFileName || "Resume PDF"}
                </p>
              </div>

              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/10"
              >
                Preview Resume
              </a>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-zinc-400">
              No resume has been uploaded yet.
            </div>
          )}
        </div>

        <form
          onSubmit={handleUpload}
          className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
        >
          <h2 className="text-2xl font-semibold">Upload PDF Resume</h2>
          <p className="mt-2 text-sm text-zinc-400">
            PDF only • Maximum size 5MB • Uploading replaces the current resume.
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mt-6 block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300"
          />

          {selectedFile && (
            <p className="mt-3 text-sm text-zinc-400">
              Selected: {selectedFile.name}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : resume?.resumeUrl ? "Replace Resume" : "Upload Resume"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setError("");
                setSuccess("");
              }}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
