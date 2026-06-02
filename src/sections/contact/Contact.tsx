import SectionTitle from "@/components/ui/SectionTitle";

export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <SectionTitle
        title="Get In Touch"
        subtitle="Contact"
      />

      <div className="rounded-2xl border border-zinc-800 p-8">
        <form className="space-y-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
          />

          <textarea
            rows={6}
            placeholder="Your Message"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-white outline-none"
          />

          <button
            type="submit"
            className="rounded-xl bg-cyan-400 px-6 py-3 font-medium text-black"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}