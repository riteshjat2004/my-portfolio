import { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import BlogCard from "@/components/ui/BlogCard";
import { Blog } from "@/types/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs | Ritesh Jat - Portfolio",
  description:
    "Technical articles, guides, and thoughts on full-stack development, modern web architecture, and AI engineering.",
};

async function getPublishedBlogs(): Promise<Blog[]> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/blogs`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to load blogs:", error);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-16">
        <h1 className="mb-3 text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Blogs
        </h1>
        <p className="mb-12 text-zinc-400 max-w-2xl">
          Deep dives, tutorials, and engineering insights from projects, systems architecture, and web development.
        </p>

        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-400">
            No articles published yet. Check back soon!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                title={blog.title}
                excerpt={blog.excerpt}
                slug={blog.slug}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}