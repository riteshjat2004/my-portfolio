import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultCategoryClient from "@/components/devvault/DevVaultCategoryClient";
import { DevVaultCategory, DevVaultContent } from "@/types/devvault";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
}

async function getCategoryData(slug: string): Promise<{
  category: DevVaultCategory | null;
  topics: DevVaultContent[];
}> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const [catRes, topicsRes] = await Promise.all([
      fetch(`${apiUrl}/devvault/categories/${slug}`, { cache: "no-store" }),
      fetch(`${apiUrl}/devvault/content?category=${slug}`, { cache: "no-store" }),
    ]);

    if (!catRes.ok) {
      return { category: null, topics: [] };
    }

    const catData = await catRes.json();
    const topicsData = topicsRes.ok ? await topicsRes.json() : { content: [] };

    return {
      category: catData.category || null,
      topics: topicsData.content || [],
    };
  } catch (error) {
    console.error("Failed to fetch category data:", error);
    return { category: null, topics: [] };
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const { category } = await getCategoryData(slug);

  if (!category) {
    return {
      title: "Category Not Found | DevVault",
    };
  }

  return {
    title: `${category.name} | DevVault Technical Knowledge`,
    description:
      category.description ||
      `Explore in-depth technical blueprints, guides, and concepts in ${category.name}.`,
    openGraph: {
      title: `${category.name} | DevVault Technical Knowledge`,
      description:
        category.description ||
        `Explore in-depth technical blueprints, guides, and concepts in ${category.name}.`,
      type: "website",
    },
  };
}

export default async function DevVaultCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const { category, topics } = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-12 py-10">
        <DevVaultCategoryClient
          category={category}
          initialTopics={topics}
        />
      </main>

      <Footer />
    </div>
  );
}
