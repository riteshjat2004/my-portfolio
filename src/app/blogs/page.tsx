"use client";

import { useEffect, useState } from "react";

import { Blog } from "@/types/blog";
import { getBlogs } from "@/api/blogApi";

import BlogCard from "@/components/ui/BlogCard";

export default function BlogsPage() {
  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const data =
        await getBlogs();

      setBlogs(data);
    };

    fetchBlogs();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="mb-12 text-5xl font-bold">
        Blogs
      </h1>

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
    </main>
  );
}