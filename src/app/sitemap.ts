import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riteshjat.dev";
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/devvault`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/devvault/brain-treasure`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/blogs`, { cache: "no-store" });
    if (res.ok) {
      const blogs = await res.json();
      if (Array.isArray(blogs)) {
        const blogRoutes: MetadataRoute.Sitemap = blogs.map(
          (blog: { slug: string; updatedAt?: string }) => ({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          })
        );
        return [...staticRoutes, ...blogRoutes];
      }
    }
  } catch {
    // Graceful fallback to static routes when backend is offline
  }

  return staticRoutes;
}
