"use client";

import { useState } from "react";

import SectionTitle from "@/components/ui/SectionTitle";
import FadeIn from "@/components/ui/FadeIn";

import { sendContactMessage } from "@/api/contactApi";

export default function Contact() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await sendContactMessage({
        name,
        email,
        message,
      });

      setSuccess(
        "Message sent successfully!"
      );

      setName("");
      setEmail("");
      setMessage("");

    } catch (error) {
      console.error(error);

      setError(
        "Failed to send message."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <section
        id="contact"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <SectionTitle
          title="Get In Touch"
          subtitle="Contact"
        />

        <div className="rounded-2xl border border-zinc-800 p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
            />

            <textarea
              rows={6}
              placeholder="Your Message"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
            />

            {success && (
              <p className="text-green-400">
                {success}
              </p>
            )}

            {error && (
              <p className="text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-medium text-black"
            >
              {loading
                ? "Sending..."
                : "Send Message"}
            </button>

          </form>
        </div>
      </section>
    </FadeIn>
  );
}