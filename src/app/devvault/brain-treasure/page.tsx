import { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultBrainTreasureClient from "@/components/devvault/DevVaultBrainTreasureClient";
import { DevVaultBrainTreasure } from "@/types/devvault";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Brain Treasure | Technical Challenges & Mental Models | DevVault",
  description:
    "Test your engineering understanding with curated technical questions, mental models, and deep explanations across systems, languages, and architectures.",
  openGraph: {
    title: "Brain Treasure | DevVault",
    description:
      "Test your understanding. Think first, then reveal the answer. Curated technical questions and challenges by Ritesh Jat.",
    url: "https://riteshjat.me/devvault/brain-treasure",
    siteName: "Ritesh Jat Portfolio",
    locale: "en_US",
    type: "website",
  },
};

async function getBrainTreasureData(): Promise<{
  items: DevVaultBrainTreasure[];
  technicalBackgrounds: string[];
  total: number;
}> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/devvault/brain-treasure?limit=100`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return { items: [], technicalBackgrounds: [], total: 0 };
    }

    const data = await res.json();
    return {
      items: data.items || [],
      technicalBackgrounds: data.technicalBackgrounds || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Failed to load Brain Treasure questions:", error);
    return { items: [], technicalBackgrounds: [], total: 0 };
  }
}

export default async function BrainTreasurePage() {
  const { items, technicalBackgrounds, total } = await getBrainTreasureData();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-8 lg:px-12 py-12">
        <DevVaultBrainTreasureClient
          initialItems={items}
          technicalBackgrounds={technicalBackgrounds}
          total={total}
        />
      </main>

      <Footer />
    </div>
  );
}
