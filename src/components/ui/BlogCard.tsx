import Link from "next/link";

interface BlogCardProps {
  title: string;
  excerpt: string;
  slug: string;
}

export default function BlogCard({
  title,
  excerpt,
  slug,
}: BlogCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 p-6 transition hover:border-cyan-400/40">
      <h3 className="text-2xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-4 text-zinc-400">
        {excerpt}
      </p>

      <Link
        href={`/blogs/${slug}`}
        className="mt-6 inline-block text-cyan-400"
      >
        Read More →
      </Link>
    </div>
  );
}