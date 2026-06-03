"use client";

import { useEffect, useState } from "react";

import SectionTitle from "@/components/ui/SectionTitle";
import BlogCard from "@/components/ui/BlogCard";

import { getBlogs } from "@/api/blogApi";
import { Blog } from "@/types/blog";

export default function Blogs() {
  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data =
          await getBlogs();

        setBlogs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionTitle
        title="Latest Blogs"
        subtitle="Writing"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {blogs.slice(0, 3).map(
          (blog) => (
            <BlogCard
              key={blog._id}
              title={blog.title}
              excerpt={blog.excerpt}
              slug={blog.slug}
            />
          )
        )}
      </div>
    </section>
  );
}