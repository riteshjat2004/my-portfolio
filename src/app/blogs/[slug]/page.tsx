"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getBlogBySlug } from "@/api/blogApi";
import { Blog } from "@/types/blog";

export default function BlogPage() {
  const params = useParams();

  const slug = params.slug as string;

  const [blog, setBlog] =
    useState<Blog | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data =
          await getBlogBySlug(slug);

        setBlog(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (!blog) {
    return (
      <div className="p-20">
        Loading...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="mb-8 text-5xl font-bold">
        {blog.title}
      </h1>

      <p className="mb-8 text-zinc-400">
        {blog.excerpt}
      </p>

      <div className="flex gap-2 mb-8">
        {blog.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-800 px-3 py-1 text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <article className="leading-8 text-zinc-300">
        {blog.content}
      </article>
    </main>
  );
}