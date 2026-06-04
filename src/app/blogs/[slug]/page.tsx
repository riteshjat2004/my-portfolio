"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getBlogBySlug } from "@/api/blogApi";
import { Blog } from "@/types/blog";

import ReactMarkdown from "react-markdown";

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

      <article className="max-w-none text-zinc-300">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="mb-6 text-4xl font-bold text-white">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mt-8 mb-4 text-3xl font-semibold text-white">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 mb-3 text-2xl font-medium text-white">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-8">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc pl-6">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="mb-2">
                {children}
              </li>
            ),
          }}
        >
          {blog.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}