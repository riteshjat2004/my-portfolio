import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultBlockRenderer from "@/components/devvault/DevVaultBlockRenderer";
import DevVaultTOC from "@/components/devvault/DevVaultTOC";
import DevVaultTopicCard from "@/components/devvault/DevVaultTopicCard";
import DevVaultReadingProgress from "@/components/devvault/DevVaultReadingProgress";
import DevVaultTopicActionBar from "@/components/devvault/DevVaultTopicActionBar";
import { DevVaultCategory, DevVaultDetailResponse } from "@/types/devvault";
import { formatDate } from "@/utils/readingTime";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

async function getTopicData(slug: string): Promise<DevVaultDetailResponse | null> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const res = await fetch(`${apiUrl}/devvault/content/${slug}`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      content: data.content,
      prevTopic: data.prevTopic || null,
      nextTopic: data.nextTopic || null,
      related: data.related || [],
    };
  } catch (error) {
    console.error("Failed to load DevVault topic:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTopicData(slug);

  if (!data || !data.content) {
    return {
      title: "Topic Not Found | DevVault",
    };
  }

  const { content } = data;
  const catName =
    typeof content.category === "object"
      ? (content.category as DevVaultCategory).name
      : "DevVault";

  return {
    title: `${content.title} | ${catName} | DevVault`,
    description:
      content.shortDescription ||
      `Understand ${content.title} with in-depth technical blueprints and mental models.`,
    openGraph: {
      title: `${content.title} | DevVault`,
      description: content.shortDescription || "Technical knowledge blueprint.",
      type: "article",
      images: content.coverImage ? [{ url: content.coverImage }] : undefined,
    },
  };
}

export default async function DevVaultTopicPage({ params }: PageProps) {
  const { category: catParam, slug } = await params;
  const data = await getTopicData(slug);

  if (!data || !data.content) {
    notFound();
  }

  const { content, prevTopic, nextTopic, related = [] } = data;

  const categoryObj =
    typeof content.category === "object"
      ? (content.category as DevVaultCategory)
      : null;

  const catSlug = categoryObj?.slug || catParam;
  const catName = categoryObj?.name || "General";
  const catIcon = categoryObj?.icon || "🏛️";

  const readingTimeMinutes =
    content.readingTime && content.readingTime >= 1
      ? content.readingTime
      : 5;
  const readingTime = `${readingTimeMinutes} min read`;
  const formattedDate = formatDate(content.updatedAt || content.createdAt);

  const difficultyColors: Record<string, string> = {
    beginner: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    intermediate: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    advanced: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  const diffClass =
    difficultyColors[content.difficulty || "intermediate"] ||
    "text-zinc-400 border-zinc-700 bg-zinc-800";

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body, html, .min-h-screen {
                background: #ffffff !important;
                color: #0f172a !important;
              }
              nav, footer, .reading-progress, header div.flex.flex-wrap, .lg\\:col-span-4 {
                display: none !important;
              }
              article {
                width: 100% !important;
                max-width: 100% !important;
              }
              h2, h3, h4 {
                break-after: avoid !important;
                page-break-after: avoid !important;
                color: #0f172a !important;
              }
              .rounded-2xl, .rounded-3xl, pre, blockquote, table {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                background-color: #f8fafc !important;
                color: #0f172a !important;
                border-color: #e2e8f0 !important;
              }
            }
          `,
        }}
      />
      <DevVaultReadingProgress />
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-12 py-10">
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500">
          <Link href="/devvault" className="text-zinc-400 hover:text-cyan-400 transition">
            DevVault
          </Link>
          <span>/</span>
          <Link
            href={`/devvault/${catSlug}`}
            className="text-zinc-400 hover:text-cyan-400 transition flex items-center gap-1"
          >
            <span>{catIcon}</span>
            <span>{catName}</span>
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold truncate max-w-xs sm:max-w-md">
            {content.title}
          </span>
        </nav>

        {/* Main Reading Container: Content + Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Content Column */}
          <article className="lg:col-span-8 space-y-8">
            {/* Header Metadata & Title */}
            <header className="space-y-5 border-b border-zinc-800/80 pb-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/devvault/${catSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-cyan-500/20 transition"
                >
                  <span>{catIcon}</span>
                  <span>{catName}</span>
                </Link>

                {content.difficulty && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider ${diffClass}`}
                  >
                    {content.difficulty}
                  </span>
                )}

                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400 capitalize">
                  {content.contentType ? content.contentType.replace("_", " ") : "article"}
                </span>

                <span className="text-xs font-mono text-zinc-500 ml-auto">
                  {readingTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {content.title}
              </h1>

              {content.shortDescription && (
                <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal">
                  {content.shortDescription}
                </p>
              )}

              {/* Action Bar: Export PDF & Copy Link */}
              <DevVaultTopicActionBar topic={content} relatedTopics={related} />

              {/* Cover Image Banner */}
              {content.coverImage && (
                <div className="relative mt-4 max-h-96 w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.coverImage}
                    alt={content.title}
                    className="max-h-96 w-full object-cover"
                  />
                </div>
              )}

              {/* Tags and Author info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs font-mono text-zinc-500">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-zinc-600 font-bold">TAGS:</span>
                  {content.tags && content.tags.length > 0 ? (
                    content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-400 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span>general</span>
                  )}
                </div>

                {formattedDate && (
                  <div>
                    Last updated on <span className="text-zinc-300">{formattedDate}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Mobile TOC accordion (strictly hidden on desktop) */}
            <div className="block lg:hidden">
              <DevVaultTOC blocks={content.content} variant="mobile" />
            </div>

            {/* Structured Technical Blocks Renderer */}
            <div className="py-2">
              <DevVaultBlockRenderer blocks={content.content} interactive={true} />
            </div>

            {/* Prev / Next Navigation Footbar */}
            {(prevTopic || nextTopic) && (
              <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevTopic ? (
                  <Link
                    href={`/devvault/${catSlug}/${prevTopic.slug}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-cyan-500/50 hover:bg-zinc-900 group"
                  >
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                      ← Previous Blueprint
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition block truncate">
                      {prevTopic.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextTopic && (
                  <Link
                    href={`/devvault/${catSlug}/${nextTopic.slug}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-right transition hover:border-cyan-500/50 hover:bg-zinc-900 group sm:ml-auto w-full"
                  >
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                      Next Blueprint →
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition block truncate">
                      {nextTopic.title}
                    </span>
                  </Link>
                )}
              </div>
            )}

            {/* Related Topics Section */}
            {related.length > 0 && (
              <div className="mt-16 pt-8 border-t border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>🧭 Continue Learning</span>
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                    Related technical blueprints and practical guides in {catName}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((item) => (
                    <DevVaultTopicCard
                      key={item._id}
                      topic={item}
                      showCategory={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Desktop Sticky Table of Contents Sidebar */}
          <div className="hidden lg:block lg:col-span-4 pl-4 border-l border-zinc-900">
            <DevVaultTOC blocks={content.content} variant="desktop" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
