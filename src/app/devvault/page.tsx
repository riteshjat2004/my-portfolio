import { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultHomeClient from "@/components/devvault/DevVaultHomeClient";
import { DevVaultCategory, DevVaultContent, DevVaultBrainTreasure } from "@/types/devvault";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DevVault | Technical Knowledge Platform",
  description:
    "Curated technical knowledge base, system architecture blueprints, setup guides, code snippets, and developer cheatsheets by Ritesh Jat.",
  openGraph: {
    title: "DevVault | Technical Knowledge Platform",
    description:
      "Understand the technology. Don't just copy it. Technical blueprints, firmware protocols, and system architecture guides.",
    url: "https://riteshjat.me/devvault",
    siteName: "Ritesh Jat Portfolio",
    locale: "en_US",
    type: "website",
  },
};

async function getCategories(): Promise<DevVaultCategory[]> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/devvault/categories`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Failed to load DevVault categories:", error);
    return [];
  }
}

async function getFeaturedTopics(): Promise<DevVaultContent[]> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/devvault/content?featured=true&limit=4`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.content || [];
  } catch (error) {
    console.error("Failed to load featured topics:", error);
    return [];
  }
}

async function getRecentTopics(): Promise<DevVaultContent[]> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    // Strictly fetch maximum 5 latest published topics from server
    const res = await fetch(`${apiUrl}/devvault/content?limit=5&sort=newest`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.content || [];
  } catch (error) {
    console.error("Failed to load recent topics:", error);
    return [];
  }
}

async function getBrainTreasure(): Promise<{ items: DevVaultBrainTreasure[]; total: number }> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    // Strictly fetch maximum 5 Brain Treasure questions for homepage preview
    const res = await fetch(`${apiUrl}/devvault/brain-treasure?limit=5`, {
      cache: "no-store",
    });

    if (!res.ok) return { items: [], total: 0 };
    const data = await res.json();
    return {
      items: data.items || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Failed to load Brain Treasure questions:", error);
    return { items: [], total: 0 };
  }
}

export default async function DevVaultPage() {
  const [categories, featuredTopics, recentTopics, brainTreasureData] = await Promise.all([
    getCategories(),
    getFeaturedTopics(),
    getRecentTopics(),
    getBrainTreasure(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-12 py-12">
        <DevVaultHomeClient
          categories={categories}
          featuredTopics={featuredTopics}
          recentTopics={recentTopics}
          brainTreasure={brainTreasureData.items}
          totalBrainTreasure={brainTreasureData.total}
        />
      </main>

      <Footer />
    </div>
  );
}
