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

interface ImagePayload {
  dataUrl: string;
  width: number;
  height: number;
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

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89
  const marginX = 42;
  const marginTop = 52;
  const marginBottom = 50;
  const printableWidth = pageWidth - marginX * 2; // ~511pt
  const maxY = pageHeight - marginBottom;

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
  const titleLines: string[] = doc.splitTextToSize(topic.title, printableWidth);
  const titleLineHeight = 26;
  const descLines: string[] = topic.shortDescription
    ? doc.splitTextToSize(topic.shortDescription, printableWidth)
    : [];
  const descLineHeight = 15;

  // Calculate header height dynamically to ensure adequate space
  const headerHeight =
    20 + // Eyebrow box and padding
    18 + // Gap between eyebrow and title
    titleLines.length * titleLineHeight +
    (descLines.length > 0 ? 14 + descLines.length * descLineHeight : 0) +
    22; // Gap before metadata row

  ensureSpace(headerHeight);

  // Eyebrow Branding Badge
  const eyebrowBoxH = 14;
  doc.setFillColor(2, 132, 199); // Cyan-600
  doc.roundedRect(marginX, y, 78, eyebrowBoxH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DEVVAULT", marginX + 8, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TECHNICAL KNOWLEDGE BLUEPRINT", marginX + 88, y + 10);

  // Vertical position for Title (placing baseline well below eyebrow box)
  // Eyebrow box ends at y + eyebrowBoxH (14). Add 18pt margin + 16pt font ascent = +34pt.
  let currentY = y + eyebrowBoxH + 18 + 16;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(15, 23, 42); // Slate-900
  for (let i = 0; i < titleLines.length; i++) {
    doc.text(titleLines[i], marginX, currentY);
    if (i < titleLines.length - 1) {
      currentY += titleLineHeight;
    }
  }

  // Short Description
  if (descLines.length > 0) {
    // 14pt gap after title bottom (ascent ~16, descent ~5)
    currentY += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105); // Slate-600
    for (let j = 0; j < descLines.length; j++) {
      doc.text(descLines[j], marginX, currentY);
      if (j < descLines.length - 1) {
        currentY += descLineHeight;
      }
    }
    y = currentY + 16;
  } else {
    y = currentY + 18;
  }

  // Metadata Pill Row
  ensureSpace(26);
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.75);
  doc.roundedRect(marginX, y, printableWidth, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  let metaX = marginX + 10;
  const printMetaItem = (label: string, value: string, badgeColor?: [number, number, number]) => {
    if (!value) return;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, metaX, y + 14);
    metaX += doc.getTextWidth(`${label}:`) + 3;

    doc.setFont("helvetica", "bold");
    if (badgeColor) {
      doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value, metaX, y + 14);
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

  y += 32;

  // Cover Image (if present)
  if (topic.coverImage) {
    const coverPayload = await loadImageDataUrl(topic.coverImage);
    if (coverPayload) {
      const targetW = printableWidth;
      const aspect = coverPayload.width / coverPayload.height;
      const targetH = Math.min(220, targetW / aspect);
      ensureSpace(targetH + 16);
      doc.addImage(coverPayload.dataUrl, "JPEG", marginX, y, targetW, targetH);
      y += targetH + 16;
    }
  }

  // ==========================================
  // 2. TABLE OF CONTENTS (if headings exist)
  // ==========================================
  const rawBlocks: DevVaultBlock[] = Array.isArray(topic.content)
    ? topic.content
    : typeof topic.content === "string"
    ? [{ id: "legacy-1", type: "markdown", data: { markdown: topic.content } }]
    : [];

  const headingBlocks = rawBlocks.filter(
    (b) => b.type === "heading" && Boolean((b.data as HeadingBlockData)?.text)
  );

  if (headingBlocks.length > 0) {
    ensureSpace(34 + headingBlocks.length * 16);
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.roundedRect(marginX, y, printableWidth, 20 + headingBlocks.length * 15, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("DOCUMENT CONTENTS", marginX + 12, y + 14);

    let tocY = y + 28;
    headingBlocks.forEach((hb, idx) => {
      const hd = hb.data as HeadingBlockData;
      const indent = hd.level === 3 ? 24 : hd.level === 4 ? 36 : 12;
      const numLabel = hd.level === 2 ? `${idx + 1}. ` : "• ";

      doc.setFont("helvetica", hd.level === 2 ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const text = `${numLabel}${hd.text}`;
      const truncated = doc.splitTextToSize(text, printableWidth - indent - 20)[0];
      doc.text(truncated, marginX + indent, tocY);
      tocY += 15;
    });

    y += 26 + headingBlocks.length * 15 + 14;
  }

  // Divider Rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(marginX, y, marginX + printableWidth, y);
  y += 18;

  // ==========================================
  // 3. RENDER ALL 20 BLOCK TYPES
  // ==========================================
  for (const block of rawBlocks) {
    if (!block || !block.type) continue;

    switch (block.type) {
      case "heading": {
        const d = (block.data || {}) as HeadingBlockData;
        const text = d.text || "";
        if (!text.trim()) break;

        if (d.level === 2) {
          ensureSpace(55);
          y += 10;
          doc.setFillColor(2, 132, 199);
          doc.rect(marginX, y + 1, 3, 14, "F"); // Accent bar
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14.5);
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(text, printableWidth - 12);
          doc.text(lines, marginX + 8, y + 12);
          y += lines.length * 17 + 8;
        } else if (d.level === 3) {
          ensureSpace(40);
          y += 6;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(30, 41, 59);
          const lines = doc.splitTextToSize(text, printableWidth);
          doc.text(lines, marginX, y + 10);
          y += lines.length * 14 + 6;
        } else {
          ensureSpace(32);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(text, printableWidth);
          doc.text(lines, marginX, y + 9);
          y += lines.length * 13 + 5;
        }
        break;
      }

      case "paragraph": {
        const d = (block.data || {}) as ParagraphBlockData;
        const text = d.text || "";
        if (!text.trim()) break;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59); // Slate-800
        const lines = doc.splitTextToSize(text, printableWidth);

        for (const line of lines) {
          ensureSpace(14);
          doc.text(line, marginX, y + 9);
          y += 13.5;
        }
        y += 6;
        break;
      }

      case "quote": {
        const d = (block.data || {}) as QuoteBlockData;
        const text = d.text || "";
        if (!text.trim()) break;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        const quoteLines = doc.splitTextToSize(`“${text}”`, printableWidth - 24);
        const boxHeight = quoteLines.length * 14 + (d.author ? 24 : 14);

        ensureSpace(boxHeight + 8);
        doc.setFillColor(240, 249, 255); // Light cyan tint
        doc.rect(marginX, y, printableWidth, boxHeight, "F");
        doc.setFillColor(2, 132, 199); // Blue bar
        doc.rect(marginX, y, 3.5, boxHeight, "F");

        doc.setTextColor(15, 23, 42);
        doc.text(quoteLines, marginX + 14, y + 12);

        if (d.author) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const authText = `— ${d.author}${d.source ? ` (${d.source})` : ""}`;
          doc.text(authText, marginX + 14, y + quoteLines.length * 14 + 14);
        }

        y += boxHeight + 10;
        break;
      }

      case "code": {
        const d = (block.data || {}) as CodeBlockData;
        const code = d.code || "";
        if (!code.trim()) break;

        const lang = (d.language || "code").toUpperCase();
        const title = d.title || lang;
        const codeLines = code.split("\n");
        const showNums = d.showLineNumbers !== false;

        // Render Code Header Bar
        ensureSpace(24);
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.roundedRect(marginX, y, printableWidth, 18, 2, 2, "F");
        doc.setFont("courier", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(title, marginX + 8, y + 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(lang, marginX + printableWidth - doc.getTextWidth(lang) - 8, y + 12);
        y += 18;

        // Code Body Box
        const gutterWidth = showNums ? 26 : 8;
        const maxCodeWidth = printableWidth - gutterWidth - 10;

        for (let idx = 0; idx < codeLines.length; idx++) {
          const rawLine = codeLines[idx] || " ";
          doc.setFont("courier", "normal");
          doc.setFontSize(8);

          // Wrap long lines safely
          const wrapped = doc.splitTextToSize(rawLine, maxCodeWidth);

          for (let wIdx = 0; wIdx < wrapped.length; wIdx++) {
            ensureSpace(12);
            // Draw background line strip
            doc.setFillColor(248, 250, 252);
            doc.rect(marginX, y, printableWidth, 12, "F");

            // Line number in gutter
            if (showNums && wIdx === 0) {
              doc.setFont("courier", "normal");
              doc.setFontSize(7);
              doc.setTextColor(148, 163, 184);
              const numStr = String(idx + 1).padStart(3, " ");
              doc.text(numStr, marginX + 4, y + 8.5);
            }

            // Code Text
            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            doc.text(wrapped[wIdx], marginX + gutterWidth, y + 8.5);
            y += 12;
          }
        }
        y += 10;
        break;
      }

      case "command": {
        const d = (block.data || {}) as CommandBlockData;
        const cmd = d.command || "";
        if (!cmd.trim()) break;

        ensureSpace(34);
        doc.setFillColor(241, 245, 249); // Slate-100
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(marginX, y, printableWidth, 26, 3, 3, "FD");

        doc.setFont("courier", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(2, 132, 199);
        doc.text("$", marginX + 10, y + 16);

        doc.setFont("courier", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(cmd, marginX + 22, y + 16);

        if (d.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          const descStr = doc.splitTextToSize(d.description, 160)[0];
          doc.text(descStr, marginX + printableWidth - doc.getTextWidth(descStr) - 10, y + 16);
        }

        y += 34;
        break;
      }

      case "terminal": {
        const d = (block.data || {}) as TerminalBlockData;
        const output = d.output || "";
        if (!output.trim()) break;

        const termLines = output.split("\n");

        ensureSpace(24 + termLines.length * 12);
        // Header
        doc.setFillColor(15, 23, 42); // Dark slate
        doc.roundedRect(marginX, y, printableWidth, 16, 2, 2, "F");
        doc.setFont("courier", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text("● ● ●   TERMINAL OUTPUT", marginX + 8, y + 11);
        y += 16;

        // Terminal Content
        doc.setFillColor(30, 41, 59);
        const termH = termLines.length * 12 + 8;
        doc.rect(marginX, y, printableWidth, termH, "F");

        let termY = y + 10;
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(56, 189, 248); // Cyan-400
        for (const line of termLines) {
          const trunc = doc.splitTextToSize(line, printableWidth - 16)[0] || "";
          doc.text(trunc, marginX + 8, termY);
          termY += 12;
        }

        y += termH + 10;
        break;
      }

      case "table": {
        const d = (block.data || {}) as TableBlockData;
        const headers = d.headers || [];
        const rows = d.rows || [];
        if (headers.length === 0 && rows.length === 0) break;

        ensureSpace(50);
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: headers.length > 0 ? [headers] : undefined,
          body: rows,
          theme: "grid",
          styles: {
            font: "helvetica",
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

        // Advance y to bottom of table
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY;
        y = (finalY || y) + 14;
        break;
      }

      case "concept": {
        const d = (block.data || {}) as ConceptBlockData;
        ensureSpace(70);

        doc.setFillColor(245, 243, 255); // Indigo-50
        doc.setDrawColor(199, 210, 254); // Indigo-200
        doc.setLineWidth(1);

        const expLines = doc.splitTextToSize(d.explanation || "", printableWidth - 24);
        const analogyLines = d.analogy
          ? doc.splitTextToSize(`Analogy: ${d.analogy}`, printableWidth - 32)
          : [];
        const pointsCount = d.keyPoints?.length || 0;

        const boxH =
          32 +
          expLines.length * 13 +
          (analogyLines.length > 0 ? analogyLines.length * 12 + 14 : 0) +
          pointsCount * 13 +
          12;

        ensureSpace(boxH);
        doc.roundedRect(marginX, y, printableWidth, boxH, 4, 4, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("CORE CONCEPT", marginX + 12, y + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(d.title || "", marginX + 12, y + 27);

        let curY = y + 40;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(expLines, marginX + 12, curY);
        curY += expLines.length * 13 + 4;

        if (analogyLines.length > 0) {
          doc.setFillColor(254, 243, 199); // Amber-100
          doc.roundedRect(marginX + 12, curY, printableWidth - 24, analogyLines.length * 12 + 8, 2, 2, "F");
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.setTextColor(146, 64, 14);
          doc.text(analogyLines, marginX + 18, curY + 11);
          curY += analogyLines.length * 12 + 14;
        }

        if (d.keyPoints && d.keyPoints.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text("KEY TAKEAWAYS:", marginX + 12, curY + 6);
          curY += 12;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 41, 59);
          for (const pt of d.keyPoints) {
            doc.text(`•  ${pt}`, marginX + 16, curY);
            curY += 12.5;
          }
        }

        y += boxH + 12;
        break;
      }

      case "definition": {
        const d = (block.data || {}) as DefinitionBlockData;
        const defLines = doc.splitTextToSize(d.definition || "", printableWidth - 24);
        const boxH = 40 + defLines.length * 13;

        ensureSpace(boxH);
        doc.setFillColor(236, 254, 255); // Cyan-50
        doc.setDrawColor(165, 243, 252); // Cyan-200
        doc.roundedRect(marginX, y, printableWidth, boxH, 3, 3, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(8, 145, 178); // Cyan-600
        doc.text("TERMINOLOGY DEFINITION", marginX + 12, y + 14);

        if (d.context) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`[${d.context}]`, marginX + printableWidth - doc.getTextWidth(`[${d.context}]`) - 12, y + 14);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(d.term || "", marginX + 12, y + 28);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(defLines, marginX + 12, y + 42);

        y += boxH + 10;
        break;
      }

      case "step": {
        const d = (block.data || {}) as StepBlockData;
        const descLines = doc.splitTextToSize(d.description || "", printableWidth - 36);
        const hasCode = Boolean(d.code?.trim());
        const codeLines = hasCode ? (d.code || "").split("\n") : [];
        const boxH = 26 + descLines.length * 13 + (hasCode ? codeLines.length * 11 + 16 : 0);

        ensureSpace(boxH + 6);
        // Step number badge
        doc.setFillColor(2, 132, 199);
        doc.circle(marginX + 12, y + 12, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        const stepNum = String(d.stepNumber || 1);
        doc.text(stepNum, marginX + 12 - doc.getTextWidth(stepNum) / 2, y + 15);

        // Step Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(d.title || "", marginX + 28, y + 15);

        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(descLines, marginX + 28, y + 30);
        let curY = y + 30 + descLines.length * 13;

        // Nested Snippet
        if (hasCode) {
          const snippetH = codeLines.length * 11 + 10;
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(marginX + 28, curY, printableWidth - 28, snippetH, 2, 2, "F");
          doc.setFont("courier", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          for (const sLine of codeLines) {
            doc.text(sLine, marginX + 34, curY + 9);
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
        const textLines = doc.splitTextToSize(d.text || "", printableWidth - 28);
        const boxH = 26 + textLines.length * 13;

        ensureSpace(boxH + 6);

        type CalloutTheme = {
          border: [number, number, number];
          bg: [number, number, number];
          label: string;
        };

        const themes: Record<string, CalloutTheme> = {
          note: { border: [2, 132, 199], bg: [240, 249, 255], label: "NOTE" },
          tip: { border: [16, 185, 129], bg: [236, 253, 245], label: "PRO TIP" },
          warning: { border: [245, 158, 11], bg: [254, 243, 199], label: "WARNING" },
          important: { border: [244, 63, 94], bg: [255, 241, 242], label: "IMPORTANT" },
        };

        const th = themes[block.type] || themes.note;

        doc.setFillColor(th.bg[0], th.bg[1], th.bg[2]);
        doc.rect(marginX, y, printableWidth, boxH, "F");

        doc.setFillColor(th.border[0], th.border[1], th.border[2]);
        doc.rect(marginX, y, 3.5, boxH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(th.border[0], th.border[1], th.border[2]);
        doc.text(d.title ? `${th.label}: ${d.title.toUpperCase()}` : th.label, marginX + 12, y + 13);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(textLines, marginX + 12, y + 25);

        y += boxH + 8;
        break;
      }

      case "checklist": {
        const d = (block.data || {}) as ChecklistBlockData;
        const items = d.items || [];
        if (items.length === 0) break;

        const boxH = 24 + items.length * 15;
        ensureSpace(boxH);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(marginX, y, printableWidth, boxH, 3, 3, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("ACTION CHECKLIST", marginX + 12, y + 14);

        let checkY = y + 28;
        for (const it of items) {
          const isDone = Boolean(it.done);
          doc.setFont("courier", "bold");
          doc.setFontSize(9);
          doc.setTextColor(isDone ? 16 : 100, isDone ? 185 : 116, isDone ? 129 : 139);
          doc.text(isDone ? "[x]" : "[ ]", marginX + 12, checkY);

          doc.setFont("helvetica", isDone ? "italic" : "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(isDone ? 100 : 30, isDone ? 116 : 41, isDone ? 139 : 59);
          doc.text(it.text || "", marginX + 30, checkY);
          checkY += 15;
        }

        y += boxH + 10;
        break;
      }

      case "image": {
        const d = (block.data || {}) as ImageBlockData;
        if (!d.url) break;

        const payload = await loadImageDataUrl(d.url);
        if (payload) {
          const maxImgW = printableWidth;
          const aspect = payload.width / payload.height;
          const imgH = Math.min(260, maxImgW / aspect);

          ensureSpace(imgH + 28);
          doc.addImage(payload.dataUrl, "JPEG", marginX, y, maxImgW, imgH);
          y += imgH + 6;

          if (d.caption) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const capLines = doc.splitTextToSize(`Figure: ${d.caption}`, printableWidth);
            doc.text(capLines, marginX, y + 8);
            y += capLines.length * 11 + 6;
          }
        } else {
          // Graceful fallback for broken image
          ensureSpace(36);
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(marginX, y, printableWidth, 30, 2, 2, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`[Diagram Illustration: ${d.caption || d.alt || "Visual Diagram"}]`, marginX + 12, y + 18);
          y += 36;
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
            const targetH = Math.min(220, printableWidth / aspect);
            ensureSpace(targetH + 24);
            doc.addImage(payload.dataUrl, "JPEG", marginX, y, printableWidth, targetH);
            y += targetH + 6;

            if (gImg.caption) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(8);
              doc.setTextColor(100, 116, 139);
              doc.text(`Figure: ${gImg.caption}`, marginX, y + 8);
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

        ensureSpace(36);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(marginX, y, printableWidth, 32, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(2, 132, 199);
        doc.text(`↗  ${d.title || d.url}`, marginX + 10, y + 14);

        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const truncUrl = doc.splitTextToSize(d.url, printableWidth - 20)[0];
        doc.text(truncUrl, marginX + 10, y + 25);

        // Add clickable link
        doc.link(marginX, y, printableWidth, 32, { url: d.url });

        y += 38;
        break;
      }

      case "reference": {
        const d = (block.data || {}) as ReferenceBlockData;
        ensureSpace(30);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("[Ref]", marginX, y + 12);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(d.title || "", marginX + 30, y + 12);

        if (d.citation || d.url) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(d.citation || d.url || "", marginX + 30, y + 23);
          if (d.url) {
            doc.link(marginX + 30, y + 14, printableWidth - 30, 12, { url: d.url });
          }
        }

        y += 30;
        break;
      }

      case "related": {
        const d = (block.data || {}) as RelatedBlockData;
        ensureSpace(32);

        doc.setFillColor(240, 253, 244); // Light emerald
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(marginX, y, printableWidth, 28, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(16, 185, 129);
        doc.text("RELATED EXPLORATION", marginX + 10, y + 12);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(d.title || "", marginX + 10, y + 22);

        y += 34;
        break;
      }

      case "markdown": {
        const d = (block.data || {}) as MarkdownBlockData;
        const mdText = d.markdown || "";
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
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            doc.text(trimmed.replace(/^###\s+/, ""), marginX, y + 10);
            y += 16;
          } else if (trimmed.startsWith("## ")) {
            ensureSpace(34);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text(trimmed.replace(/^##\s+/, ""), marginX, y + 11);
            y += 18;
          } else if (trimmed.startsWith("# ")) {
            ensureSpace(40);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(15, 23, 42);
            doc.text(trimmed.replace(/^#\s+/, ""), marginX, y + 13);
            y += 20;
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            ensureSpace(14);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            const bulletText = `•  ${trimmed.replace(/^[-*]\s+/, "")}`;
            const bLines = doc.splitTextToSize(bulletText, printableWidth - 8);
            doc.text(bLines, marginX + 6, y + 9);
            y += bLines.length * 13;
          } else {
            doc.setFont("helvetica", "normal");
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
  // 4. RELATED TOPICS SECTION (END OF DOC)
  // ==========================================
  if (relatedTopics && relatedTopics.length > 0) {
    ensureSpace(60);
    y += 14;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y, marginX + printableWidth, y);
    y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("RELATED BLUEPRINTS IN DEVVAULT", marginX, y + 10);
    y += 18;

    for (const rel of relatedTopics.slice(0, 4)) {
      ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(2, 132, 199);
      doc.text(`•  ${rel.title}`, marginX + 4, y + 10);

      if (rel.difficulty) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        const diffStr = `(${rel.difficulty})`;
        doc.text(diffStr, marginX + printableWidth - doc.getTextWidth(diffStr), y + 10);
      }
      y += 15;
    }
  }

  // ==========================================
  // 5. TWO-PASS HEADER & FOOTER ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Top Header on pages 2+
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("DEVVAULT", marginX, 32);
      const topTitle = doc.splitTextToSize(topic.title, printableWidth - 100)[0] || "";
      doc.text(topTitle, marginX + printableWidth - doc.getTextWidth(topTitle), 32);

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.5);
      doc.line(marginX, 38, marginX + printableWidth, 38);
    }

    // Bottom Footer on all pages
    const footerY = pageHeight - 26;
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    doc.line(marginX, footerY - 10, marginX + printableWidth, footerY - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("DevVault  ·  Ritesh Jat  ·  Technical Knowledge Platform", marginX, footerY);

    const pageStr = `Page ${p} of ${totalPages}`;
    doc.text(pageStr, marginX + printableWidth - doc.getTextWidth(pageStr), footerY);
  }

  // ==========================================
  // 6. TRIGGER DOWNLOAD WITH SANITIZED FILENAME
  // ==========================================
  const safeSlug = (topic.slug || topic.title)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  const fileName = `${safeSlug || "devvault-topic"}.pdf`;
  doc.save(fileName);
}
