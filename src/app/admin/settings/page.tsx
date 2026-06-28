"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function SettingsPage() {
  const isAuthenticated = useProtectedRoute();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-3 text-zinc-400">
          Settings management will be added here.
        </p>
      </div>
    </main>
  );
}
