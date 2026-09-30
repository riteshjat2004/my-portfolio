"use client";

import React, { useState } from "react";
import {
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
import DevVaultLightbox, { LightboxImage } from "./DevVaultLightbox";
import ReactMarkdown from "react-markdown";

interface DevVaultBlockRendererProps {
  blocks?: DevVaultBlock[] | string | Record<string, unknown> | null;
  interactive?: boolean;
}

export default function DevVaultBlockRenderer({
  blocks,
  interactive = true,
}: DevVaultBlockRendererProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleOpenLightbox = (images: LightboxImage[], index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Handle empty or null
  if (!blocks) {
    return (
      <div className="py-12 text-center text-zinc-500 italic text-sm">
        No content blocks added yet.
      </div>
    );
  }

  // If content is a raw string (e.g. legacy markdown or plain text)
  if (typeof blocks === "string") {
    return (
      <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {blocks}
      </div>
    );
  }

  // If not an array (e.g. object with blocks or corrupt data)
  const blockList: DevVaultBlock[] = Array.isArray(blocks)
    ? blocks
    : (blocks as { blocks?: DevVaultBlock[] }).blocks || [];

  if (blockList.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 italic text-sm">
        No content blocks added yet. Start by adding a section.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 text-zinc-200">
        {blockList.map((block, idx) => (
          <SingleBlockRenderer
            key={block.id || `block-${idx}`}
            block={block}
            interactive={interactive}
            onOpenLightbox={handleOpenLightbox}
          />
        ))}
      </div>

      <DevVaultLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </>
  );
}

function SingleBlockRenderer({
  block,
  interactive,
  onOpenLightbox,
}: {
  block: DevVaultBlock;
  interactive: boolean;
  onOpenLightbox: (images: LightboxImage[], index: number) => void;
}) {
  switch (block.type) {
    // ----------------------------------------
    // TEXT BLOCKS
    // ----------------------------------------
    case "heading": {
      const data = (block.data || {}) as HeadingBlockData;
      const level = data.level || 2;
      const text = data.text || "";
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (level === 2) {
        return (
          <h2
            id={slug}
            className="group mt-10 mb-4 flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-zinc-800/80 pb-3"
          >
            <span className="text-cyan-400 font-mono text-lg select-none">#</span>
            <span>{text}</span>
            <a
              href={`#${slug}`}
              className="opacity-0 group-hover:opacity-100 transition text-zinc-500 text-sm hover:text-cyan-400"
              aria-label="Link to section"
            >
              🔗
            </a>
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            id={slug}
            className="mt-8 mb-3 flex items-center gap-2 text-xl sm:text-2xl font-bold text-white tracking-tight"
          >
            <span className="text-indigo-400 font-mono text-base select-none">##</span>
            <span>{text}</span>
          </h3>
        );
      }
      return (
        <h4
          id={slug}
          className="mt-6 mb-2 text-base sm:text-lg font-semibold text-zinc-200 tracking-wide"
        >
          {text}
        </h4>
      );
    }

    case "paragraph": {
      const data = (block.data || {}) as ParagraphBlockData;
      return (
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal whitespace-pre-line max-w-prose">
          {data.text || ""}
        </p>
      );
    }

    case "quote": {
      const data = (block.data || {}) as QuoteBlockData;
      return (
        <blockquote className="my-6 border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-950/20 to-transparent p-5 sm:p-6 rounded-r-2xl italic text-zinc-200">
          <p className="text-base sm:text-lg font-serif">“{data.text}”</p>
          {(data.author || data.source) && (
            <footer className="mt-3 text-xs sm:text-sm font-sans not-italic text-zinc-400 flex items-center gap-2">
              <span className="text-cyan-400 font-bold">—</span>
              <span className="font-semibold text-zinc-300">{data.author}</span>
              {data.source && (
                <span className="text-zinc-500">({data.source})</span>
              )}
            </footer>
          )}
        </blockquote>
      );
    }

    // ----------------------------------------
    // TECHNICAL BLOCKS
    // ----------------------------------------
    case "code": {
      const data = (block.data || {}) as CodeBlockData;
      return <CodeBlockView data={data} />;
    }

    case "command": {
      const data = (block.data || {}) as CommandBlockData;
      return <CommandBlockView data={data} />;
    }

    case "terminal": {
      const data = (block.data || {}) as TerminalBlockData;
      return <TerminalBlockView data={data} />;
    }

    case "table": {
      const data = (block.data || {}) as TableBlockData;
      return <TableBlockView data={data} />;
    }

    // ----------------------------------------
    // EDUCATIONAL BLOCKS
    // ----------------------------------------
    case "note":
    case "tip":
    case "warning":
    case "important": {
      const data = (block.data || {}) as CalloutBlockData;
      return <CalloutBlockView type={block.type} data={data} />;
    }

    case "definition": {
      const data = (block.data || {}) as DefinitionBlockData;
      return (
        <div className="my-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📖</span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Terminology Definition
              </span>
            </div>
            {data.context && (
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-300 border border-indigo-500/20">
                {data.context}
              </span>
            )}
          </div>
          <div className="mt-3 text-xl font-extrabold text-white font-mono">
            {data.term}
          </div>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
            {data.definition}
          </p>
        </div>
      );
    }

    case "concept": {
      const data = (block.data || {}) as ConceptBlockData;
      return (
        <div className="my-6 rounded-3xl border border-cyan-500/30 bg-zinc-950/80 p-6 sm:p-7 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono uppercase tracking-wider">
            <span>🧠</span>
            <span>Core Concept</span>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-extrabold text-white">
            {data.title}
          </h3>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
            {data.explanation}
          </p>
          {data.analogy && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/90 flex gap-3">
              <span className="text-lg select-none">🎯</span>
              <div>
                <strong className="block text-amber-400 font-semibold mb-1">
                  Mental Model / Analogy:
                </strong>
                {data.analogy}
              </div>
            </div>
          )}
          {data.keyPoints && data.keyPoints.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Key Takeaways:
              </span>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                {data.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold select-none">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    case "step": {
      const data = (block.data || {}) as StepBlockData;
      return (
        <div className="my-6 relative pl-6 sm:pl-8 border-l-2 border-cyan-500/40">
          <div className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-black font-extrabold text-sm shadow-md shadow-cyan-500/50">
            {data.stepNumber || 1}
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {data.title}
            </h4>
            <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
              {data.description}
            </p>
            {data.code && (
              <div className="mt-4">
                <CodeBlockView
                  data={{
                    code: data.code,
                    language: data.language || "bash",
                    title: "Implementation Snippet",
                    showLineNumbers: false,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    case "checklist": {
      const data = (block.data || {}) as ChecklistBlockData;
      return (
        <ChecklistBlockView
          items={data.items || []}
          interactive={interactive}
        />
      );
    }

    // ----------------------------------------
    // MEDIA BLOCKS
    // ----------------------------------------
    case "image": {
      const data = (block.data || {}) as ImageBlockData;
      if (!data.url) return null;
      return (
        <figure className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
          <DevVaultImageWithFallback
            url={data.url}
            caption={data.caption}
            alt={data.alt || data.caption || "DevVault Diagram"}
            onClick={() =>
              onOpenLightbox(
                [{ url: data.url, caption: data.caption, alt: data.alt }],
                0
              )
            }
          />
          {data.caption && (
            <figcaption className="p-3 text-center text-xs sm:text-sm text-zinc-400 bg-zinc-900/60 border-t border-zinc-800/80">
              <span className="font-semibold text-zinc-300">Figure:</span> {data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "gallery": {
      const data = (block.data || {}) as GalleryBlockData;
      const images = data.images || [];
      if (images.length === 0) return null;

      const lightboxPayload: LightboxImage[] = images.map((img) => ({
        url: img.url,
        caption: img.caption,
        alt: img.alt,
      }));

      return (
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, i) => (
            <figure
              key={img.id || i}
              className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col justify-between"
            >
              <DevVaultImageWithFallback
                url={img.url}
                caption={img.caption}
                alt={img.alt || img.caption || `Gallery item ${i + 1}`}
                onClick={() => onOpenLightbox(lightboxPayload, i)}
              />
              {img.caption && (
                <figcaption className="p-2.5 text-center text-xs text-zinc-400 bg-zinc-900/40 border-t border-zinc-800/60">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    // ----------------------------------------
    // REFERENCE & NAVIGATION BLOCKS
    // ----------------------------------------
    case "link": {
      const data = (block.data || {}) as LinkBlockData;
      return (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 block group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-cyan-500/50 hover:bg-zinc-900/50"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition">
              <span>🔗</span>
              <span>{data.title || data.url}</span>
            </div>
            <span className="text-cyan-400 font-mono text-sm group-hover:translate-x-1 transition">
              ↗
            </span>
          </div>
          {data.description && (
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 pl-6">
              {data.description}
            </p>
          )}
          <span className="mt-2 block text-[11px] font-mono text-zinc-500 pl-6 truncate">
            {data.url}
          </span>
        </a>
      );
    }

    case "reference": {
      const data = (block.data || {}) as ReferenceBlockData;
      return (
        <div className="my-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3 text-xs sm:text-sm text-zinc-400 flex items-start gap-3">
          <span className="text-zinc-500 font-mono font-bold select-none">[ref]</span>
          <div className="flex-1">
            <span className="font-semibold text-zinc-200">{data.title}</span>
            {data.citation && (
              <span className="block mt-0.5 text-zinc-400 italic">
                {data.citation}
              </span>
            )}
            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
              >
                <span>source link</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>
      );
    }

    case "related": {
      const data = (block.data || {}) as RelatedBlockData;
      return (
        <div className="my-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
            Related Exploration
          </span>
          <h4 className="text-base font-bold text-white">{data.title}</h4>
          {data.description && (
            <p className="mt-1 text-xs text-zinc-400">{data.description}</p>
          )}
        </div>
      );
    }

    case "markdown": {
      const data = (block.data || {}) as MarkdownBlockData;
      return (
        <div className="my-4 font-sans text-sm sm:text-base text-zinc-300 leading-relaxed rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h3 className="text-xl font-bold text-white mb-3 mt-4 border-b border-zinc-800 pb-1">
                  {children}
                </h3>
              ),
              h2: ({ children }) => (
                <h4 className="text-lg font-bold text-white mb-2 mt-3">
                  {children}
                </h4>
              ),
              h3: ({ children }) => (
                <h5 className="text-base font-semibold text-white mb-2 mt-2">
                  {children}
                </h5>
              ),
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-zinc-300 last:mb-0">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 list-disc pl-5 space-y-1 text-zinc-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 list-decimal pl-5 space-y-1 text-zinc-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              code: ({ children }) => (
                <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
                  {children}
                </code>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  {children}
                </a>
              ),
            }}
          >
            {data.markdown || ""}
          </ReactMarkdown>
        </div>
      );
    }

    default:
      // Graceful fallback for unknown block types
      return (
        <div className="my-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 text-xs text-zinc-500 font-mono">
          [Custom block: {block.type}]
        </div>
      );
  }
}

// ==========================================
// IMAGE WITH GRACEFUL FALLBACK & LIGHTBOX TRIGGER
// ==========================================

function DevVaultImageWithFallback({
  url,
  caption,
  alt,
  onClick,
}: {
  url: string;
  caption?: string;
  alt: string;
  onClick?: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="p-8 text-center bg-zinc-900/60 border border-zinc-800 rounded-xl my-2">
        <span className="text-2xl block mb-2">🖼️</span>
        <p className="text-xs font-mono text-zinc-400">
          Visual illustration currently unavailable
        </p>
        {caption && (
          <p className="mt-1 text-xs text-zinc-500 italic">Caption: {caption}</p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group/img relative w-full min-h-[200px] max-h-[500px] flex items-center justify-center bg-black/60 cursor-zoom-in overflow-hidden"
      title="Click to view full-screen illustration"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onError={() => setHasError(true)}
        className="max-h-[500px] w-auto max-w-full object-contain mx-auto rounded-lg transition-transform duration-300 group-hover/img:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity rounded-full bg-black/80 border border-zinc-700 px-3 py-1 text-[11px] font-mono text-zinc-200">
          🔍 Click to expand
        </span>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS: SYNTAX AWARE CODE & INTERACTION
// ==========================================

function CodeBlockView({ data }: { data: CodeBlockData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data.code) return;
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = (data.code || "").split("\n");

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 select-none">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          {data.title ? (
            <span className="text-xs font-mono text-zinc-300 font-medium ml-2">
              {data.title}
            </span>
          ) : (
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 ml-2">
              {data.language || "code"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">
            {data.language || "text"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-mono text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <span className="text-emerald-400">✓</span>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Syntax Coloration */}
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-zinc-100">
        {data.showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/30">
                  <td className="w-10 select-none pr-4 text-right text-zinc-600 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre">
                    <HighlightedLine line={line} language={data.language} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre">
            <code>
              {lines.map((line, idx) => (
                <div key={idx}>
                  <HighlightedLine line={line} language={data.language} />
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}

// Lightweight, deterministic syntax coloration
function HighlightedLine({ line }: { line: string; language?: string }) {
  if (!line || !line.trim()) {
    return <span>{" "}</span>;
  }

  // Comments
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }

  // Keywords pattern
  const tokens = line.split(/(\s+|[(),;.:{}[\]+\-*/=<>!&|"'`])/g);

  const KEYWORDS = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "import", "export", "from", "default", "class", "extends", "async", "await",
    "try", "catch", "throw", "new", "this", "typeof", "instanceof", "def",
    "self", "class", "int", "void", "bool", "char", "float", "double",
    "struct", "typedef", "public", "private", "protected", "static", "package",
    "interface", "type", "enum", "select", "case", "switch", "break", "continue"
  ]);

  const TYPES = new Set([
    "string", "number", "boolean", "Promise", "Record", "Array", "Map", "Set",
    "null", "undefined", "true", "false", "None", "True", "False"
  ]);

  return (
    <span>
      {tokens.map((token, i) => {
        if (KEYWORDS.has(token)) {
          return (
            <span key={i} className="text-cyan-400 font-semibold">
              {token}
            </span>
          );
        }
        if (TYPES.has(token)) {
          return (
            <span key={i} className="text-indigo-400">
              {token}
            </span>
          );
        }
        if (/^".*"$/.test(token) || /^'.*'$/.test(token) || /^`.*`$/.test(token)) {
          return (
            <span key={i} className="text-emerald-300">
              {token}
            </span>
          );
        }
        if (/^\d+(\.\d+)?$/.test(token)) {
          return (
            <span key={i} className="text-amber-300">
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </span>
  );
}

function CommandBlockView({ data }: { data: CommandBlockData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data.command) return;
    navigator.clipboard.writeText(data.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 font-mono">
      {data.description && (
        <div className="text-xs text-zinc-400 mb-2 font-sans">
          {data.description}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs sm:text-sm text-cyan-300">
          <span className="text-zinc-500 select-none font-bold">
            {data.cwd ? `${data.cwd} $` : "$"}
          </span>
          <span className="font-semibold">{data.command}</span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-400 hover:text-white transition"
          title="Copy command"
        >
          {copied ? "✓" : "📋"}
        </button>
      </div>
    </div>
  );
}

function TerminalBlockView({ data }: { data: TerminalBlockData }) {
  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-zinc-800 bg-black font-mono">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/70 border-b border-zinc-800">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        <span className="text-xs text-zinc-500 ml-2">Terminal Output</span>
      </div>
      <div className="p-4 text-xs sm:text-sm leading-relaxed text-emerald-400/90 whitespace-pre-wrap overflow-x-auto">
        {data.command && (
          <div className="text-zinc-400 mb-2 font-bold">
            $ {data.command}
          </div>
        )}
        {data.output}
      </div>
    </div>
  );
}

function TableBlockView({ data }: { data: TableBlockData }) {
  const headers = data.headers || [];
  const rows = data.rows || [];

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {data.caption && (
        <div className="px-4 py-2.5 bg-zinc-900/70 border-b border-zinc-800 text-xs font-mono font-semibold text-zinc-400">
          Table: {data.caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          {headers.length > 0 && (
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase font-mono text-zinc-400">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-zinc-800/60">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-zinc-900/40 transition">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-zinc-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalloutBlockView({
  type,
  data,
}: {
  type: string;
  data: CalloutBlockData;
}) {
  const configs: Record<
    string,
    { border: string; bg: string; icon: string; titleColor: string; defaultTitle: string }
  > = {
    note: {
      border: "border-cyan-500/40",
      bg: "bg-cyan-950/20",
      icon: "ℹ️",
      titleColor: "text-cyan-400",
      defaultTitle: "Note",
    },
    tip: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-950/20",
      icon: "💡",
      titleColor: "text-emerald-400",
      defaultTitle: "Pro Tip",
    },
    warning: {
      border: "border-amber-500/40",
      bg: "bg-amber-950/20",
      icon: "⚠️",
      titleColor: "text-amber-400",
      defaultTitle: "Warning",
    },
    important: {
      border: "border-rose-500/40",
      bg: "bg-rose-950/20",
      icon: "🚨",
      titleColor: "text-rose-400",
      defaultTitle: "Important",
    },
  };

  const cfg = configs[type] || configs.note;

  return (
    <div
      className={`my-5 rounded-2xl border ${cfg.border} ${cfg.bg} p-4 sm:p-5 backdrop-blur-md`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl select-none">{cfg.icon}</span>
        <h4 className={`text-sm font-bold uppercase tracking-wider ${cfg.titleColor}`}>
          {data.title || cfg.defaultTitle}
        </h4>
      </div>
      <p className="mt-2 text-sm sm:text-base text-zinc-200 leading-relaxed pl-8">
        {data.text}
      </p>
    </div>
  );
}

function ChecklistBlockView({
  items,
  interactive,
}: {
  items: Array<{ id: string; text: string; done?: boolean }>;
  interactive: boolean;
}) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    items.forEach((item, idx) => {
      init[item.id || idx.toString()] = Boolean(item.done);
    });
    return init;
  });

  const toggle = (id: string) => {
    if (!interactive) return;
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="my-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
      <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-3">
        Action Checklist
      </span>
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const key = item.id || idx.toString();
          const isDone = checkedState[key];
          return (
            <label
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-start gap-3 p-2 rounded-xl transition cursor-pointer select-none ${
                isDone ? "bg-emerald-950/10 text-zinc-500" : "hover:bg-zinc-900 text-zinc-200"
              }`}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggle(key)}
                className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-400 focus:ring-0 cursor-pointer"
              />
              <span className={`text-sm sm:text-base ${isDone ? "line-through text-zinc-500" : ""}`}>
                {item.text}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
