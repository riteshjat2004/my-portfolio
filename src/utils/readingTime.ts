import { DevVaultBlock } from "@/types/devvault";

export function calculateReadingTime(
  content: DevVaultBlock[] | string | Record<string, unknown> | null | undefined
): string {
  if (!content) return "1 min read";

  let wordCount = 0;
  let technicalBlocks = 0;

  if (typeof content === "string") {
    wordCount = content.trim().split(/\s+/).length;
  } else if (Array.isArray(content)) {
    for (const block of content) {
      const d = (block.data || {}) as Record<string, unknown>;

      if (block.type === "code" || block.type === "command" || block.type === "table") {
        technicalBlocks++;
      }

      if (typeof d.text === "string") {
        wordCount += d.text.trim().split(/\s+/).length;
      }
      if (typeof d.description === "string") {
        wordCount += d.description.trim().split(/\s+/).length;
      }
      if (typeof d.explanation === "string") {
        wordCount += d.explanation.trim().split(/\s+/).length;
      }
      if (typeof d.definition === "string") {
        wordCount += d.definition.trim().split(/\s+/).length;
      }
      if (typeof d.markdown === "string") {
        wordCount += d.markdown.trim().split(/\s+/).length;
      }
      if (Array.isArray(d.keyPoints)) {
        for (const pt of d.keyPoints) {
          if (typeof pt === "string") wordCount += pt.trim().split(/\s+/).length;
        }
      }
    }
  }

  // Average reading speed: 200 words per minute + 0.5 min per code/table block
  const minutes = Math.max(1, Math.round(wordCount / 200 + technicalBlocks * 0.5));
  return `${minutes} min read`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
