import { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultHomeClient from "@/components/devvault/DevVaultHomeClient";
import {
  DevVaultCategory,
  DevVaultContent,
  DevVaultBrainTreasure,
  DevVaultHomeFeedResponse,
} from "@/types/devvault";

// 60-second stale-while-revalidate caching with background revalidation
export const revalidate = 60;

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

const getApiUrl = () =>
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// Fast consolidated home feed loader (single round-trip to backend)
async function getHomeFeed(): Promise<DevVaultHomeFeedResponse> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/devvault/home-feed`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          categories: data.categories || [],
          featuredTopics: data.featuredTopics || [],
          recentTopics: data.recentTopics || [],
          brainTreasure: data.brainTreasure || { items: [], total: 0 },
        };
      }
    }
  } catch (error) {
    console.warn("DevVault consolidated feed timed out or unavailable, attempting fallback:", error);
  }

  // Graceful fallback to individual queries if home-feed is not yet cached or fails
  try {
    const [catRes, featRes, recRes, btRes] = await Promise.all([
      fetch(`${apiUrl}/devvault/categories`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null),
      fetch(`${apiUrl}/devvault/content?featured=true&limit=4`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null),
      fetch(`${apiUrl}/devvault/content?limit=5&sort=newest`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null),
      fetch(`${apiUrl}/devvault/brain-treasure?limit=5`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null),
    ]);

    const categories = catRes && catRes.ok ? (await catRes.json()).categories || [] : [];
    const featuredTopics = featRes && featRes.ok ? (await featRes.json()).content || [] : [];
    const recentTopics = recRes && recRes.ok ? (await recRes.json()).content || [] : [];
    const btData = btRes && btRes.ok ? await btRes.json() : { items: [], total: 0 };

    return {
      categories,
      featuredTopics,
      recentTopics,
      brainTreasure: {
        items: btData.items || [],
        total: btData.total || 0,
      },
    };
  } catch (err) {
    console.error("DevVault fallback queries failed:", err);
    return {
      categories: [],
      featuredTopics: [],
      recentTopics: [],
      brainTreasure: { items: [], total: 0 },
    };
  }
}

export default async function DevVaultPage() {
  const feed = await getHomeFeed();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-12 py-12">
        <DevVaultHomeClient
          categories={feed.categories}
          featuredTopics={feed.featuredTopics}
          recentTopics={feed.recentTopics}
          brainTreasure={feed.brainTreasure.items}
          totalBrainTreasure={feed.brainTreasure.total}
        />
      </main>

      <Footer />
    </div>
  );
}
