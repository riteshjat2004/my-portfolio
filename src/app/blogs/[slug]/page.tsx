import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import { Blog } from "@/types/blog";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchBlog(slug: string): Promise<Blog | null> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/blogs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | Portfolio",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} | Portfolio`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-16">
        <Link
          href="/blogs"
          className="mb-8 inline-flex items-center text-sm text-zinc-400 hover:text-cyan-400 transition"
        >
          ← Back to all blogs
        </Link>

        <h1 className="mb-4 text-4xl sm:text-5xl font-bold tracking-tight text-white">
          {blog.title}
        </h1>

        <p className="mb-8 text-lg text-zinc-400 leading-relaxed">
          {blog.excerpt}
        </p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 border border-zinc-700/50 px-3 py-1 text-xs font-mono text-cyan-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <article className="prose prose-invert max-w-none text-zinc-300">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mb-6 text-3xl font-bold text-white border-b border-zinc-800 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-8 mb-4 text-2xl font-semibold text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-6 mb-3 text-xl font-medium text-white">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 leading-7 text-zinc-300">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-5 list-disc pl-6 space-y-1 text-zinc-300">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-5 list-decimal pl-6 space-y-1 text-zinc-300">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-7">{children}</li>
              ),
              code: ({ children }) => (
                <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-sm text-cyan-200">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="mb-6 overflow-x-auto rounded-lg bg-zinc-900 border border-zinc-800 p-4 font-mono text-sm text-zinc-200">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-cyan-500/50 pl-4 italic text-zinc-400 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}