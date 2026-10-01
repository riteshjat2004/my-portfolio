import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DevVaultContent,
  DevVaultCategory,
  DevVaultBlock,
  HeadingBlockData,
  ParagraphBlockData,
  QuoteBlockData,
  CodeBlockData,
  CommandBlockData,
  TerminalBlockData,
  TableBlockData,
  CalloutBlockData,
  DefinitionBlockData,
  ConceptBlockData,
  StepBlockData,
  ChecklistBlockData,
  ImageBlockData,
  GalleryBlockData,
  LinkBlockData,
  ReferenceBlockData,
  RelatedBlockData,
  MarkdownBlockData,
} from "@/types/devvault";
import { formatDate } from "@/utils/readingTime";
import { GEIST_FONT_BASE64 } from "@/utils/devvaultFontData";

interface ImagePayload {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Normalizes technical symbols, arrows, inequalities, and Unicode glyphs.
 * Ensures consistent rendering across all PDF viewers without corruption.
 */
export function sanitizePdfText(text: string): string {
  if (!text) return "";
  return text
    // Replace smart quotes and dashes with standard/verified unicode
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "—")
    .replace(/\u2013/g, "–")
    // Arrows
    .replace(/(\u21D2|=>)/g, "→")
    .replace(/(\u21D0|<=)/g, "←")
    .replace(/\u21D4/g, "↔")
    // Checkmarks
    .replace(/[\u2713\u2714]/g, "✓")
    // Multiplication
    .replace(/\u00D7/g, "×")
    // Inequalities & math symbols
    .replace(/\u2265/g, "≥")
    .replace(/\u2264/g, "≤")
    .replace(/\u2260/g, "≠")
    .replace(/\u00B1/g, "±")
    // Bullets
    .replace(/[\u2022\u25CF]/g, "•")
    // Normalize tabs to 4 spaces to preserve indentation in code
    .replace(/\t/g, "    ")
    // Convert unrenderable colored emojis to clean bracketed text badges
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, (match) => {
      if (match === "→" || match === "←" || match === "↔" || match === "•" || match === "✓") return match;
      if (match === "💡") return "[Tip]";
      if (match === "⚠️") return "[Warning]";
      if (match === "🚨") return "[Important]";
      if (match === "🧠") return "[Concept]";
      if (match === "📖") return "[Def]";
      if (match === "💻") return "[Code]";
      if (match === "🎯") return "[Goal]";
      return "";
    });
}

/**
 * Loads an image from a URL into a data URL for embedding in jsPDF.
 * Uses CORS anonymous and times out after 4s so a slow/blocked image never halts generation.
 */
async function loadImageDataUrl(url: string): Promise<ImagePayload | null> {
  if (typeof window === "undefined" || !url) return null;
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      let resolved = false;

      const finish = (result: ImagePayload | null) => {
        if (!resolved) {
          resolved = true;
          resolve(result);
        }
      };

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const naturalW = img.naturalWidth || img.width || 800;
          const naturalH = img.naturalHeight || img.height || 600;
          canvas.width = naturalW;
          canvas.height = naturalH;
          const ctx = canvas.getContext("2d");
          if (!ctx) return finish(null);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          finish({ dataUrl, width: naturalW, height: naturalH });
        } catch {
          finish(null);
        }
      };

      img.onerror = () => finish(null);
      setTimeout(() => finish(null), 4000);
      img.src = url;
    });
  } catch {
    return null;
  }
}

/**
 * Exports a published DevVault topic into a high-quality, print-friendly technical PDF document.
 * Includes embedded Unicode TrueType font, intelligent keep-together block pagination,
 * explicit high-contrast print colors, and zero orphaned headings.
 */
export async function exportTopicToPdf(
  topic: DevVaultContent,
  relatedTopics: DevVaultContent[] = []
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // Embed Unicode TrueType Font (Geist) for technical symbols (→, ✓, ×, ≥, ≤, ±, •)
  try {
    doc.addFileToVFS("Geist.ttf", GEIST_FONT_BASE64);
    doc.addFont("Geist.ttf", "Geist", "normal");
    doc.addFont("Geist.ttf", "Geist", "bold");
    doc.setFont("Geist", "normal");
  } catch (fontErr) {
    console.warn("Could not register embedded Geist font, falling back to standard font", fontErr);
  }

  const fontFamily = "Geist";
  const safeSetFont = (style: "normal" | "bold" = "normal") => {
    try {
      doc.setFont(fontFamily, style);
    } catch {
      doc.setFont("helvetica", style);
    }
  };

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89
  const marginX = 42;
  const marginTop = 46;
  const marginBottom = 46;
  const printableWidth = pageWidth - marginX * 2; // ~511.28 pt
  const maxY = pageHeight - marginBottom; // ~795.89 pt
  const printableHeight = maxY - marginTop; // ~749.89 pt

  let y = marginTop;

  const ensureSpace = (neededHeight: number): void => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = marginTop;
    }
  };

  const categoryName =
    typeof topic.category === "object"
      ? (topic.category as DevVaultCategory).name
      : "General";
  const readingTimeMinutes =
    topic.readingTime && topic.readingTime >= 1 ? Number(topic.readingTime) : 5;
  const readingTime = `${readingTimeMinutes} MIN READ`;
  const updatedDate = formatDate(topic.updatedAt || topic.createdAt);

  // ==========================================
  // 1. DOCUMENT HEADER & BRAND BADGE
  // ==========================================
  safeSetFont("bold");
  doc.setFontSize(20);
  const titleLines: string[] = doc.splitTextToSize(sanitizePdfText(topic.title), printableWidth);
  const titleLineHeight = 24;

  safeSetFont("normal");
  doc.setFontSize(10);
  const descLines: string[] = topic.shortDescription
    ? doc.splitTextToSize(sanitizePdfText(topic.shortDescription), printableWidth)
    : [];
  const descLineHeight = 14;

  // Eyebrow Branding Badge
  const eyebrowBoxH = 14;
  doc.setFillColor(2, 132, 199); // Cyan-600
  doc.roundedRect(marginX, y, 72, eyebrowBoxH, 2, 2, "F");
  safeSetFont("bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DEVVAULT", marginX + 8, y + 10);

  safeSetFont("normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TECHNICAL KNOWLEDGE BLUEPRINT", marginX + 80, y + 10);

  y += eyebrowBoxH + 10;

  // Title
  safeSetFont("bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Slate-900
  for (let i = 0; i < titleLines.length; i++) {
    doc.text(titleLines[i], marginX, y + 15);
    y += titleLineHeight;
  }

  // Short Description
  if (descLines.length > 0) {
    y += 2;
    safeSetFont("normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    for (let j = 0; j < descLines.length; j++) {
      doc.text(descLines[j], marginX, y + 10);
      y += descLineHeight;
    }
  }

  y += 6;

  // Metadata Pill Row (Compact)
  ensureSpace(22);
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.75);
  doc.roundedRect(marginX, y, printableWidth, 19, 3, 3, "FD");

  let metaX = marginX + 8;
  const printMetaItem = (label: string, value: string, badgeColor?: [number, number, number]) => {
    if (!value) return;
    safeSetFont("normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, metaX, y + 12.5);
    metaX += doc.getTextWidth(`${label}:`) + 3;

    safeSetFont("bold");
    if (badgeColor) {
      doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value, metaX, y + 12.5);
    metaX += doc.getTextWidth(value) + 12;
  };

  printMetaItem("CATEGORY", categoryName.toUpperCase());
  if (topic.difficulty) {
    const diffColor: [number, number, number] =
      topic.difficulty === "beginner"
        ? [16, 185, 129] // Emerald
        : topic.difficulty === "intermediate"
        ? [217, 119, 6] // Amber
        : [147, 51, 234]; // Purple
    printMetaItem("DIFFICULTY", topic.difficulty.toUpperCase(), diffColor);
  }
  printMetaItem("READING TIME", readingTime.toUpperCase());
  if (updatedDate) {
    printMetaItem("UPDATED", updatedDate.toUpperCase());
  }

  y += 24;

  // Cover Image (if present)
  if (topic.coverImage) {
    const coverPayload = await loadImageDataUrl(topic.coverImage);
    if (coverPayload) {
      const targetW = printableWidth;
      const aspect = coverPayload.width / coverPayload.height;
      const targetH = Math.min(190, targetW / aspect);
      ensureSpace(targetH + 14);
      doc.addImage(coverPayload.dataUrl, "JPEG", marginX, y, targetW, targetH);
      y += targetH + 14;
    }
  }

  // ==========================================
  // 2. PARSE BLOCKS & TABLE OF CONTENTS
  // ==========================================
  const rawBlocksInput: DevVaultBlock[] = Array.isArray(topic.content)
    ? topic.content
    : typeof topic.content === "string"
    ? [{ id: "legacy-1", type: "markdown", data: { markdown: topic.content } }]
    : [];

  // Filter out any redundant heading block at the start that merely repeats the document title
  const rawBlocks = rawBlocksInput.filter((b, idx) => {
    if (
      idx === 0 &&
      b.type === "heading" &&
      (b.data as HeadingBlockData)?.text?.trim().toLowerCase() === topic.title.trim().toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const headingBlocks = rawBlocks.filter(
    (b) => b.type === "heading" && Boolean((b.data as HeadingBlockData)?.text)
  );

  if (headingBlocks.length > 0) {
    const tocBoxH = 18 + headingBlocks.length * 13 + 6;
    ensureSpace(tocBoxH + 12);

    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.75);
    doc.roundedRect(marginX, y, printableWidth, tocBoxH, 3, 3, "FD");

    safeSetFont("bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("DOCUMENT CONTENTS", marginX + 10, y + 13);

    let tocItemY = y + 26;
    let secCounter = 1;

    headingBlocks.forEach((hb) => {
      const hd = hb.data as HeadingBlockData;
      const rawText = sanitizePdfText(hd.text || "");

      // Avoid duplicate numbering: detect if heading already starts with a number (e.g. "1. ", "2.1 ")
      const matchNum = rawText.match(/^(\d+(\.\d+)*)[\.\)]\s*(.*)$/);
      let label = "";
      let cleanText = rawText;

      if (hd.level === 2) {
        if (matchNum) {
          label = `${matchNum[1]}. `;
          cleanText = matchNum[3];
        } else {
          label = `${secCounter}. `;
          secCounter++;
        }
      } else if (hd.level === 3) {
        label = "• ";
      } else {
        label = "- ";
      }

      const indent = hd.level === 3 ? 20 : hd.level === 4 ? 30 : 10;
      safeSetFont(hd.level === 2 ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(hd.level === 2 ? 30 : 71, hd.level === 2 ? 41 : 85, hd.level === 2 ? 59 : 105);

      const textToDraw = `${label}${cleanText}`;
      const trunc = doc.splitTextToSize(textToDraw, printableWidth - indent - 16)[0];
      doc.text(trunc, marginX + indent, tocItemY);
      tocItemY += 13;
    });

    y += tocBoxH + 10;

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, marginX + printableWidth, y);
    y += 12;
  }

  // ==========================================
  // 3. INTELLIGENT BLOCK MEASUREMENT HELPER
  // ==========================================
  const measureBlockHeight = (block: DevVaultBlock): number => {
    if (!block || !block.type) return 20;

    switch (block.type) {
      case "heading": {
        const d = (block.data || {}) as HeadingBlockData;
        const l = d.level || 2;
        return l === 2 ? 34 : l === 3 ? 26 : 20;
      }
      case "paragraph": {
        const d = (block.data || {}) as ParagraphBlockData;
        safeSetFont("normal");
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(sanitizePdfText(d.text || ""), printableWidth);
        return lines.length * 13.5 + 6;
      }
      case "quote": {
        const d = (block.data || {}) as QuoteBlockData;
        safeSetFont("normal");
        doc.setFontSize(9.5);
        const qLines = doc.splitTextToSize(sanitizePdfText(`“${d.text || ""}”`), printableWidth - 24);
        return qLines.length * 14 + (d.author ? 24 : 14) + 8;
      }
      case "code": {
        const d = (block.data || {}) as CodeBlockData;
        const lines = (d.code || "").split("\n");
        const gutterWidth = d.showLineNumbers !== false ? 26 : 10;
        const maxCodeW = printableWidth - gutterWidth - 8;
        safeSetFont("normal");
        doc.setFontSize(8);
        let wrappedCount = 0;
        for (const line of lines) {
          const w = doc.splitTextToSize(sanitizePdfText(line) || " ", maxCodeW);
          wrappedCount += Math.max(1, w.length);
        }
        return 18 + wrappedCount * 12 + 8;
      }
      case "command":
        return 34;
      case "terminal": {
        const d = (block.data || {}) as TerminalBlockData;
        const tLines = (d.output || "").split("\n");
        return 16 + tLines.length * 12 + 16;
      }
      case "table": {
        const d = (block.data || {}) as TableBlockData;
        const rowCount = (d.rows || []).length;
        return 24 + (rowCount + 1) * 20;
      }
      case "concept": {
        const d = (block.data || {}) as ConceptBlockData;
        safeSetFont("normal");
        doc.setFontSize(9);
        const expLines = doc.splitTextToSize(sanitizePdfText(d.explanation || ""), printableWidth - 24);
        const anaLines = d.analogy
          ? doc.splitTextToSize(sanitizePdfText(d.analogy), printableWidth - 70)
          : [];
        const ptsCount = d.keyPoints?.length || 0;
        return 36 + expLines.length * 13 + (anaLines.length > 0 ? anaLines.length * 12 + 16 : 0) + ptsCount * 12.5 + 10;
      }
      case "definition": {
        const d = (block.data || {}) as DefinitionBlockData;
        safeSetFont("normal");
        doc.setFontSize(9);
        const defLines = doc.splitTextToSize(sanitizePdfText(d.definition || ""), printableWidth - 24);
        return 38 + defLines.length * 13 + 8;
      }
      case "step": {
        const d = (block.data || {}) as StepBlockData;
        safeSetFont("normal");
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(sanitizePdfText(d.description || ""), printableWidth - 36);
        const codeLines = d.code ? d.code.split("\n") : [];
        return 26 + descLines.length * 13 + (codeLines.length > 0 ? codeLines.length * 11 + 16 : 0) + 8;
      }
      case "note":
      case "tip":
      case "warning":
      case "important": {
        const d = (block.data || {}) as CalloutBlockData;
        safeSetFont("normal");
        doc.setFontSize(9);
        const cLines = doc.splitTextToSize(sanitizePdfText(d.text || ""), printableWidth - 28);
        return 24 + cLines.length * 13 + 8;
      }
      case "checklist": {
        const d = (block.data || {}) as ChecklistBlockData;
        const itms = d.items || [];
        return 22 + itms.length * 15 + 8;
      }
      case "image":
        return 210;
      case "gallery":
        return 210;
      case "link":
        return 36;
      case "reference":
        return 30;
      case "related":
        return 32;
      case "markdown":
        return 60;
      default:
        return 30;
    }
  };

  // ==========================================
  // 4. RENDER ALL 20 BLOCK TYPES WITH KEEP-TOGETHER
  // ==========================================
  for (let bIdx = 0; bIdx < rawBlocks.length; bIdx++) {
    const block = rawBlocks[bIdx];
    if (!block || !block.type) continue;

    const blockHeight = measureBlockHeight(block);

    // ==========================================
    // HEADING ORPHAN PREVENTION (break-after: avoid)
    // ==========================================
    if (block.type === "heading") {
      const nextBlock = rawBlocks[bIdx + 1];
      if (nextBlock && nextBlock.type !== "heading") {
        const nextH = measureBlockHeight(nextBlock);
        // If the following block fits entirely on a single page, ensure heading and that block fit together
        if (nextH <= printableHeight) {
          if (y + blockHeight + nextH > maxY) {
            doc.addPage();
            y = marginTop;
          }
        } else {
          // If following block is very tall, ensure at least 100pt of it fits under this heading
          if (y + blockHeight + 100 > maxY) {
            doc.addPage();
            y = marginTop;
          }
        }
      } else {
        if (y + blockHeight + 50 > maxY) {
          doc.addPage();
          y = marginTop;
        }
      }
    } else {
      // Non-heading block: atomic keep-together if fits on a page
      if (blockHeight <= printableHeight && y + blockHeight > maxY) {
        doc.addPage();
        y = marginTop;
      }
    }

    switch (block.type) {
      case "heading": {
        const d = (block.data || {}) as HeadingBlockData;
        const text = sanitizePdfText(d.text || "");
        if (!text.trim()) break;

        if (d.level === 2) {
          y += 4;
          doc.setFillColor(2, 132, 199);
          doc.rect(marginX, y + 2, 3, 14, "F"); // Accent cyan bar
          safeSetFont("bold");
          doc.setFontSize(14);
          doc.setTextColor(15, 23, 42); // Slate-900
          const lines = doc.splitTextToSize(text, printableWidth - 12);
          doc.text(lines, marginX + 8, y + 13);
          y += lines.length * 16 + 6;
        } else if (d.level === 3) {
          y += 3;
          safeSetFont("bold");
          doc.setFontSize(11.5);
          doc.setTextColor(30, 41, 59); // Slate-800
          const lines = doc.splitTextToSize(text, printableWidth);
          doc.text(lines, marginX, y + 10);
          y += lines.length * 14 + 4;
        } else {
          safeSetFont("bold");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85); // Slate-700
          const lines = doc.splitTextToSize(text, printableWidth);
          doc.text(lines, marginX, y + 9);
          y += lines.length * 13 + 4;
        }
        break;
      }

      case "paragraph": {
        const d = (block.data || {}) as ParagraphBlockData;
        const text = sanitizePdfText(d.text || "");
        if (!text.trim()) break;

        safeSetFont("normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59); // Slate-800
        const lines = doc.splitTextToSize(text, printableWidth);

        for (const line of lines) {
          ensureSpace(14);
          doc.text(line, marginX, y + 9.5);
          y += 13.5;
        }
        y += 6;
        break;
      }

      case "quote": {
        const d = (block.data || {}) as QuoteBlockData;
        const text = sanitizePdfText(d.text || "");
        if (!text.trim()) break;

        safeSetFont("normal");
        doc.setFontSize(9.5);
        const quoteLines = doc.splitTextToSize(`“${text}”`, printableWidth - 24);
        const boxHeight = quoteLines.length * 14 + (d.author ? 24 : 14);

        doc.setFillColor(240, 249, 255); // Cyan-50 tint
        doc.rect(marginX, y, printableWidth, boxHeight, "F");
        doc.setFillColor(2, 132, 199); // Blue bar
        doc.rect(marginX, y, 3.5, boxHeight, "F");

        doc.setTextColor(15, 23, 42);
        doc.text(quoteLines, marginX + 14, y + 12);

        if (d.author) {
          safeSetFont("bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const authText = sanitizePdfText(`— ${d.author}${d.source ? ` (${d.source})` : ""}`);
          doc.text(authText, marginX + 14, y + quoteLines.length * 14 + 14);
        }

        y += boxHeight + 8;
        break;
      }

      case "code": {
        const d = (block.data || {}) as CodeBlockData;
        const code = d.code || "";
        if (!code.trim()) break;

        const lang = (d.language || "code").toUpperCase();
        const title = d.title ? sanitizePdfText(d.title) : lang;
        const codeLines = code.split("\n");
        const showNums = d.showLineNumbers !== false;

        // Render Code Header Bar with 3 window controls
        ensureSpace(24);
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.roundedRect(marginX, y, printableWidth, 18, 2, 2, "F");

        doc.setFillColor(239, 68, 68);
        doc.circle(marginX + 8, y + 9, 2.5, "F");
        doc.setFillColor(245, 158, 11);
        doc.circle(marginX + 15, y + 9, 2.5, "F");
        doc.setFillColor(16, 185, 129);
        doc.circle(marginX + 22, y + 9, 2.5, "F");

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(title, marginX + 30, y + 12);

        safeSetFont("normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(lang, marginX + printableWidth - doc.getTextWidth(lang) - 8, y + 12);
        y += 18;

        const gutterWidth = showNums ? 26 : 10;
        const maxCodeWidth = printableWidth - gutterWidth - 8;

        for (let idx = 0; idx < codeLines.length; idx++) {
          const rawLine = sanitizePdfText(codeLines[idx]) || " ";
          safeSetFont("normal");
          doc.setFontSize(8);

          // Wrap long lines safely
          const wrapped = doc.splitTextToSize(rawLine, maxCodeWidth);

          for (let wIdx = 0; wIdx < wrapped.length; wIdx++) {
            ensureSpace(12);
            // Draw background line strip (Slate-50)
            doc.setFillColor(248, 250, 252);
            doc.rect(marginX, y, printableWidth, 12, "F");

            // Line number in gutter
            if (showNums) {
              doc.setFillColor(241, 245, 249);
              doc.rect(marginX, y, gutterWidth, 12, "F");
              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.5);
              doc.line(marginX + gutterWidth, y, marginX + gutterWidth, y + 12);

              if (wIdx === 0) {
                safeSetFont("normal");
                doc.setFontSize(6.5);
                doc.setTextColor(148, 163, 184);
                const numStr = String(idx + 1);
                doc.text(numStr, marginX + gutterWidth - doc.getTextWidth(numStr) - 4, y + 8.5);
              }
            }

            // Code Text in Slate-900 (High-Contrast, preserves indentation)
            safeSetFont("normal");
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            const extraIndent = wIdx > 0 ? 8 : 0;
            doc.text(wrapped[wIdx], marginX + gutterWidth + 6 + extraIndent, y + 8.5);
            y += 12;
          }
        }
        y += 8;
        break;
      }

      case "command": {
        const d = (block.data || {}) as CommandBlockData;
        const cmd = sanitizePdfText(d.command || "");
        if (!cmd.trim()) break;

        ensureSpace(34);
        doc.setFillColor(241, 245, 249); // Slate-100
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, printableWidth, 26, 3, 3, "FD");

        safeSetFont("bold");
        doc.setFontSize(8.5);
        doc.setTextColor(2, 132, 199);
        doc.text("$", marginX + 10, y + 16);

        safeSetFont("bold");
        doc.setTextColor(15, 23, 42);
        doc.text(cmd, marginX + 20, y + 16);

        if (d.description) {
          safeSetFont("normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          const descStr = doc.splitTextToSize(sanitizePdfText(d.description), 160)[0];
          doc.text(descStr, marginX + printableWidth - doc.getTextWidth(descStr) - 10, y + 16);
        }

        y += 32;
        break;
      }

      case "terminal": {
        const d = (block.data || {}) as TerminalBlockData;
        const output = sanitizePdfText(d.output || "");
        if (!output.trim()) break;

        const termLines = output.split("\n");

        ensureSpace(24 + termLines.length * 12);
        // Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.roundedRect(marginX, y, printableWidth, 16, 2, 2, "F");

        doc.setFillColor(239, 68, 68);
        doc.circle(marginX + 8, y + 8, 2.5, "F");
        doc.setFillColor(245, 158, 11);
        doc.circle(marginX + 15, y + 8, 2.5, "F");
        doc.setFillColor(16, 185, 129);
        doc.circle(marginX + 22, y + 8, 2.5, "F");

        safeSetFont("bold");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("TERMINAL OUTPUT", marginX + 30, y + 11);
        y += 16;

        // Terminal Content in light slate box for print clarity
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.75);
        const termH = termLines.length * 12 + 8;
        doc.rect(marginX, y, printableWidth, termH, "FD");

        let termY = y + 10;
        safeSetFont("normal");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42); // Crisp dark text
        for (const line of termLines) {
          const trunc = doc.splitTextToSize(line, printableWidth - 16)[0] || "";
          doc.text(trunc, marginX + 8, termY);
          termY += 12;
        }

        y += termH + 8;
        break;
      }

      case "table": {
        const d = (block.data || {}) as TableBlockData;
        const rawHeaders = d.headers || [];
        const rawRows = d.rows || [];
        if (rawHeaders.length === 0 && rawRows.length === 0) break;

        const sanitizedHeaders = rawHeaders.map((h) => sanitizePdfText(h));
        const sanitizedRows = rawRows.map((row) => row.map((cell) => sanitizePdfText(cell)));

        ensureSpace(50);
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: sanitizedHeaders.length > 0 ? [sanitizedHeaders] : undefined,
          body: sanitizedRows,
          theme: "grid",
          styles: {
            font: fontFamily,
            fontSize: 8.5,
            cellPadding: 5,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
        });

        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY;
        y = (finalY || y) + 12;
        break;
      }

      case "concept": {
        const d = (block.data || {}) as ConceptBlockData;
        const expLines = doc.splitTextToSize(sanitizePdfText(d.explanation || ""), printableWidth - 24);
        const anaLines = d.analogy
          ? doc.splitTextToSize(sanitizePdfText(d.analogy), printableWidth - 70)
          : [];
        const keyPoints = d.keyPoints || [];

        // Clear, readable, print-safe light indigo background
        doc.setFillColor(245, 247, 255); // Indigo-50
        doc.setDrawColor(199, 210, 254); // Indigo-200
        doc.setLineWidth(1);
        doc.roundedRect(marginX, y, printableWidth, blockHeight, 4, 4, "FD");

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("CORE CONCEPT", marginX + 12, y + 14);

        safeSetFont("bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.text(sanitizePdfText(d.title || ""), marginX + 12, y + 27);

        let curY = y + 40;
        safeSetFont("normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.text(expLines, marginX + 12, curY);
        curY += expLines.length * 13 + 4;

        if (anaLines.length > 0) {
          doc.setFillColor(254, 243, 199); // Amber-100
          doc.setDrawColor(245, 158, 11);
          doc.roundedRect(marginX + 12, curY, printableWidth - 24, anaLines.length * 12 + 8, 2, 2, "F");
          safeSetFont("bold");
          doc.setFontSize(8);
          doc.setTextColor(146, 64, 14);
          doc.text("Analogy: ", marginX + 18, curY + 11);
          safeSetFont("normal");
          doc.text(anaLines, marginX + 56, curY + 11);
          curY += anaLines.length * 12 + 14;
        }

        if (keyPoints.length > 0) {
          safeSetFont("bold");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text("KEY TAKEAWAYS:", marginX + 12, curY + 4);
          curY += 12;

          for (const pt of keyPoints) {
            safeSetFont("bold");
            doc.setFontSize(8.5);
            doc.setTextColor(79, 70, 229);
            doc.text("•", marginX + 14, curY);
            safeSetFont("normal");
            doc.setTextColor(30, 41, 59);
            doc.text(sanitizePdfText(pt), marginX + 22, curY);
            curY += 12.5;
          }
        }

        y += blockHeight + 8;
        break;
      }

      case "definition": {
        const d = (block.data || {}) as DefinitionBlockData;
        const defLines = doc.splitTextToSize(sanitizePdfText(d.definition || ""), printableWidth - 24);

        doc.setFillColor(236, 254, 255); // Cyan-50
        doc.setDrawColor(165, 243, 252); // Cyan-200
        doc.setLineWidth(1);
        doc.roundedRect(marginX, y, printableWidth, blockHeight, 3, 3, "FD");

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(8, 145, 178); // Cyan-600
        doc.text("TERMINOLOGY DEFINITION", marginX + 12, y + 14);

        if (d.context) {
          safeSetFont("normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          const cText = sanitizePdfText(`[${d.context}]`);
          doc.text(cText, marginX + printableWidth - doc.getTextWidth(cText) - 12, y + 14);
        }

        safeSetFont("bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText(d.term || ""), marginX + 12, y + 28);

        safeSetFont("normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(defLines, marginX + 12, y + 42);

        y += blockHeight + 8;
        break;
      }

      case "step": {
        const d = (block.data || {}) as StepBlockData;
        const descLines = doc.splitTextToSize(sanitizePdfText(d.description || ""), printableWidth - 36);
        const hasCode = Boolean(d.code?.trim());
        const codeLines = hasCode ? (d.code || "").split("\n") : [];

        // Step number badge
        doc.setFillColor(2, 132, 199);
        doc.circle(marginX + 12, y + 12, 10, "F");
        safeSetFont("bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        const stepNum = String(d.stepNumber || 1);
        doc.text(stepNum, marginX + 12 - doc.getTextWidth(stepNum) / 2, y + 15);

        // Step Title
        safeSetFont("bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText(d.title || ""), marginX + 28, y + 15);

        // Description
        safeSetFont("normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(descLines, marginX + 28, y + 30);
        let curY = y + 30 + descLines.length * 13;

        // Nested Snippet
        if (hasCode) {
          const snippetH = codeLines.length * 11 + 10;
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(marginX + 28, curY, printableWidth - 28, snippetH, 2, 2, "F");
          safeSetFont("normal");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          for (const sLine of codeLines) {
            doc.text(sanitizePdfText(sLine), marginX + 34, curY + 9);
            curY += 11;
          }
          curY += 4;
        }

        y = curY + 8;
        break;
      }

      case "note":
      case "tip":
      case "warning":
      case "important": {
        const d = (block.data || {}) as CalloutBlockData;
        const textLines = doc.splitTextToSize(sanitizePdfText(d.text || ""), printableWidth - 28);

        type CalloutTheme = {
          border: [number, number, number];
          bg: [number, number, number];
          title: [number, number, number];
          label: string;
        };

        const themes: Record<string, CalloutTheme> = {
          note: { border: [2, 132, 199], bg: [240, 249, 255], title: [3, 105, 161], label: "NOTE" },
          tip: { border: [16, 185, 129], bg: [236, 253, 245], title: [4, 120, 87], label: "PRO TIP" },
          warning: { border: [245, 158, 11], bg: [255, 251, 235], title: [180, 83, 9], label: "WARNING" },
          important: { border: [244, 63, 94], bg: [255, 241, 242], title: [190, 18, 60], label: "IMPORTANT" },
        };

        const th = themes[block.type] || themes.note;

        doc.setFillColor(th.bg[0], th.bg[1], th.bg[2]);
        doc.rect(marginX, y, printableWidth, blockHeight, "F");

        doc.setFillColor(th.border[0], th.border[1], th.border[2]);
        doc.rect(marginX, y, 3.5, blockHeight, "F");

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(th.title[0], th.title[1], th.title[2]);
        doc.text(d.title ? `${th.label}: ${sanitizePdfText(d.title).toUpperCase()}` : th.label, marginX + 12, y + 13);

        safeSetFont("normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(textLines, marginX + 12, y + 25);

        y += blockHeight + 8;
        break;
      }

      case "checklist": {
        const d = (block.data || {}) as ChecklistBlockData;
        const items = d.items || [];
        if (items.length === 0) break;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, printableWidth, blockHeight, 3, 3, "FD");

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("ACTION CHECKLIST", marginX + 12, y + 14);

        let checkY = y + 28;
        for (const it of items) {
          const isDone = Boolean(it.done);

          // Vector checkbox (emerald checkmark for completed, crisp border for uncompleted)
          doc.setDrawColor(isDone ? 16 : 203, isDone ? 185 : 213, isDone ? 129 : 225);
          doc.setFillColor(isDone ? 236 : 255, isDone ? 253 : 255, isDone ? 245 : 255);
          doc.roundedRect(marginX + 12, checkY - 7, 9, 9, 2, 2, "FD");

          if (isDone) {
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(1.2);
            doc.line(marginX + 13.5, checkY - 2.5, marginX + 15.5, checkY - 0.5);
            doc.line(marginX + 15.5, checkY - 0.5, marginX + 19.5, checkY - 5);
            doc.setLineWidth(0.75);
          }

          safeSetFont("normal");
          doc.setFontSize(8.5);
          doc.setTextColor(isDone ? 100 : 30, isDone ? 116 : 41, isDone ? 139 : 59);
          doc.text(sanitizePdfText(it.text || ""), marginX + 28, checkY);
          checkY += 15;
        }

        y += blockHeight + 8;
        break;
      }

      case "image": {
        const d = (block.data || {}) as ImageBlockData;
        if (!d.url) break;

        const payload = await loadImageDataUrl(d.url);
        if (payload) {
          const maxImgW = printableWidth;
          const aspect = payload.width / payload.height;
          const imgH = Math.min(240, maxImgW / aspect);

          ensureSpace(imgH + 24);
          doc.addImage(payload.dataUrl, "JPEG", marginX, y, maxImgW, imgH);
          y += imgH + 6;

          if (d.caption) {
            safeSetFont("normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const capLines = doc.splitTextToSize(sanitizePdfText(`Figure: ${d.caption}`), printableWidth);
            doc.text(capLines, marginX, y + 8);
            y += capLines.length * 11 + 6;
          }
        } else {
          ensureSpace(32);
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(marginX, y, printableWidth, 26, 2, 2, "F");
          safeSetFont("normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(sanitizePdfText(`[Diagram Illustration: ${d.caption || d.alt || "Visual Diagram"}]`), marginX + 12, y + 16);
          y += 32;
        }
        break;
      }

      case "gallery": {
        const d = (block.data || {}) as GalleryBlockData;
        const images = d.images || [];
        for (const gImg of images) {
          if (!gImg.url) continue;
          const payload = await loadImageDataUrl(gImg.url);
          if (payload) {
            const aspect = payload.width / payload.height;
            const targetH = Math.min(200, printableWidth / aspect);
            ensureSpace(targetH + 20);
            doc.addImage(payload.dataUrl, "JPEG", marginX, y, printableWidth, targetH);
            y += targetH + 6;

            if (gImg.caption) {
              safeSetFont("normal");
              doc.setFontSize(8);
              doc.setTextColor(100, 116, 139);
              doc.text(sanitizePdfText(`Figure: ${gImg.caption}`), marginX, y + 8);
              y += 14;
            }
          }
        }
        y += 8;
        break;
      }

      case "link": {
        const d = (block.data || {}) as LinkBlockData;
        if (!d.url) break;

        ensureSpace(34);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, printableWidth, 30, 2, 2, "FD");

        safeSetFont("bold");
        doc.setFontSize(9);
        doc.setTextColor(2, 132, 199);
        doc.text(sanitizePdfText(`↗  ${d.title || d.url}`), marginX + 10, y + 13);

        safeSetFont("normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const truncUrl = doc.splitTextToSize(d.url, printableWidth - 20)[0];
        doc.text(truncUrl, marginX + 10, y + 23);

        doc.link(marginX, y, printableWidth, 30, { url: d.url });
        y += 36;
        break;
      }

      case "reference": {
        const d = (block.data || {}) as ReferenceBlockData;
        ensureSpace(28);

        safeSetFont("bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("[Ref]", marginX, y + 12);

        safeSetFont("bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText(d.title || ""), marginX + 30, y + 12);

        if (d.citation || d.url) {
          safeSetFont("normal");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(sanitizePdfText(d.citation || d.url || ""), marginX + 30, y + 23);
          if (d.url) {
            doc.link(marginX + 30, y + 14, printableWidth - 30, 12, { url: d.url });
          }
        }
        y += 28;
        break;
      }

      case "related": {
        const d = (block.data || {}) as RelatedBlockData;
        ensureSpace(30);

        doc.setFillColor(240, 253, 244); // Light emerald
        doc.setDrawColor(187, 247, 208);
        doc.setLineWidth(0.75);
        doc.roundedRect(marginX, y, printableWidth, 26, 2, 2, "FD");

        safeSetFont("bold");
        doc.setFontSize(7.5);
        doc.setTextColor(16, 185, 129);
        doc.text("RELATED EXPLORATION", marginX + 10, y + 11);

        safeSetFont("bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText(d.title || ""), marginX + 10, y + 20);

        y += 32;
        break;
      }

      case "markdown": {
        const d = (block.data || {}) as MarkdownBlockData;
        const mdText = sanitizePdfText(d.markdown || "");
        if (!mdText.trim()) break;

        const lines = mdText.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            y += 4;
            continue;
          }

          if (trimmed.startsWith("### ")) {
            ensureSpace(28);
            safeSetFont("bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            doc.text(trimmed.replace(/^###\s+/, ""), marginX, y + 10);
            y += 16;
          } else if (trimmed.startsWith("## ")) {
            ensureSpace(34);
            safeSetFont("bold");
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text(trimmed.replace(/^##\s+/, ""), marginX, y + 11);
            y += 18;
          } else if (trimmed.startsWith("# ")) {
            ensureSpace(40);
            safeSetFont("bold");
            doc.setFontSize(15);
            doc.setTextColor(15, 23, 42);
            doc.text(trimmed.replace(/^#\s+/, ""), marginX, y + 13);
            y += 20;
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            ensureSpace(14);
            safeSetFont("normal");
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            const bulletText = `•  ${trimmed.replace(/^[-*]\s+/, "")}`;
            const bLines = doc.splitTextToSize(bulletText, printableWidth - 8);
            doc.text(bLines, marginX + 6, y + 9);
            y += bLines.length * 13;
          } else {
            safeSetFont("normal");
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            const pLines = doc.splitTextToSize(trimmed, printableWidth);
            for (const pl of pLines) {
              ensureSpace(13);
              doc.text(pl, marginX, y + 8.5);
              y += 12.5;
            }
          }
        }
        y += 6;
        break;
      }

      default:
        break;
    }
  }

  // ==========================================
  // 5. RELATED TOPICS SECTION (END OF DOC)
  // ==========================================
  if (relatedTopics && relatedTopics.length > 0) {
    ensureSpace(50);
    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, marginX + printableWidth, y);
    y += 14;

    safeSetFont("bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("RELATED BLUEPRINTS IN DEVVAULT", marginX, y + 10);
    y += 16;

    for (const rel of relatedTopics.slice(0, 4)) {
      ensureSpace(18);
      safeSetFont("bold");
      doc.setFontSize(8.5);
      doc.setTextColor(2, 132, 199);
      doc.text(sanitizePdfText(`•  ${rel.title}`), marginX + 4, y + 10);

      if (rel.difficulty) {
        safeSetFont("normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        const diffStr = `(${rel.difficulty.toUpperCase()})`;
        doc.text(diffStr, marginX + printableWidth - doc.getTextWidth(diffStr), y + 10);
      }
      y += 14;
    }
  }

  // ==========================================
  // 6. TWO-PASS RUNNING HEADER & FOOTER ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Top Header on pages 2+
    if (p > 1) {
      safeSetFont("normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("DEVVAULT", marginX, 28);
      const topTitle = doc.splitTextToSize(sanitizePdfText(topic.title), printableWidth - 80)[0] || "";
      doc.text(topTitle, marginX + printableWidth - doc.getTextWidth(topTitle), 28);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(marginX, 34, marginX + printableWidth, 34);
    }

    // Bottom Footer on all pages
    const footerY = pageHeight - 24;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, footerY - 8, marginX + printableWidth, footerY - 8);

    safeSetFont("normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("DevVault  ·  Ritesh Jat  ·  Technical Knowledge Platform", marginX, footerY);

    const pageStr = `Page ${p} of ${totalPages}`;
    doc.text(pageStr, marginX + printableWidth - doc.getTextWidth(pageStr), footerY);
  }

  // ==========================================
  // 7. TRIGGER DOWNLOAD WITH SANITIZED FILENAME
  // ==========================================
  const safeSlug = (topic.slug || topic.title)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  const fileName = `${safeSlug || "devvault-topic"}.pdf`;
  doc.save(fileName);
}
