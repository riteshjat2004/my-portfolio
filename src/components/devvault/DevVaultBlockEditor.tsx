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
import DevVaultImageUploader from "./DevVaultImageUploader";
import DevVaultPopconfirm from "./DevVaultPopconfirm";

const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "mermaid",
  "c",
  "cpp",
  "java",
  "kotlin",
  "sql",
  "html",
  "css",
  "bash",
  "shell",
  "json",
  "yaml",
  "xml",
  "arduino",
  "embedded_c",
  "verilog",
  "rust",
  "go",
  "markdown",
  "plaintext",
];

const BLOCK_LABELS: Record<string, { label: string; icon: string; badgeColor: string }> = {
  heading: { label: "Heading", icon: "#", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  paragraph: { label: "Paragraph", icon: "¶", badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  quote: { label: "Quote", icon: "“", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  code: { label: "Code Block", icon: "💻", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  command: { label: "CLI Command", icon: "$", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  terminal: { label: "Terminal Output", icon: "⌨️", badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  table: { label: "Data Table", icon: "▦", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  note: { label: "Note Callout", icon: "ℹ️", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  tip: { label: "Pro Tip", icon: "💡", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  warning: { label: "Warning", icon: "⚠️", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  important: { label: "Important Alert", icon: "🚨", badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  definition: { label: "Term Definition", icon: "📖", badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  concept: { label: "Core Concept", icon: "🧠", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  step: { label: "Numbered Step", icon: "🔢", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  checklist: { label: "Action Checklist", icon: "☑️", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  image: { label: "Image / Diagram", icon: "🖼️", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  gallery: { label: "Image Gallery", icon: "🗂️", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  link: { label: "External Link", icon: "🔗", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  reference: { label: "Citation / Ref", icon: "📚", badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  related: { label: "Related Topic", icon: "🧭", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  markdown: { label: "Raw Markdown", icon: "M↓", badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
};

interface DevVaultBlockEditorProps {
  block: DevVaultBlock;
  index: number;
  totalBlocks: number;
  onChange: (updatedBlock: DevVaultBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBelow?: () => void;
}

export default function DevVaultBlockEditor({
  block,
  index,
  totalBlocks,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertBelow,
}: DevVaultBlockEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const blockMeta = BLOCK_LABELS[block.type] || {
    label: block.type,
    icon: "▫️",
    badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const updateData = (newData: Record<string, unknown>) => {
    onChange({
      ...block,
      data: {
        ...(block.data as Record<string, unknown>),
        ...newData,
      },
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-md transition hover:border-zinc-700">
      {/* Block Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 rounded-t-2xl border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-white transition text-xs font-mono select-none"
            title={collapsed ? "Expand block" : "Collapse block"}
          >
            {collapsed ? "▶" : "▼"}
          </button>

          <span className="text-zinc-500 font-mono text-xs select-none">
            #{index + 1}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium ${blockMeta.badgeColor}`}
          >
            <span>{blockMeta.icon}</span>
            <span>{blockMeta.label}</span>
          </span>

          {collapsed && (
            <span className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-md">
              {getBlockPreviewSummary(block)}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:border-zinc-700 hover:text-cyan-400 transition"
            title="Duplicate Block"
          >
            ⎘
          </button>
          {onInsertBelow && (
            <button
              type="button"
              onClick={onInsertBelow}
              className="h-7 px-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition flex items-center gap-1"
              title="Insert block directly below"
            >
              <span>+</span>
              <span className="hidden sm:inline text-[10px]">Insert Below</span>
            </button>
          )}
          <DevVaultPopconfirm
            title={`Delete block #${index + 1}?`}
            onConfirm={onDelete}
            confirmLabel="Delete"
          >
            {(openConfirm) => (
              <button
                type="button"
                onClick={openConfirm}
                className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                title="Delete Block"
              >
                ✕
              </button>
            )}
          </DevVaultPopconfirm>
        </div>
      </div>

      {/* Block Body Inputs */}
      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          <RenderBlockSpecificInputs
            block={block}
            updateData={updateData}
          />
        </div>
      )}
    </div>
  );
}

function RenderBlockSpecificInputs({
  block,
  updateData,
}: {
  block: DevVaultBlock;
  updateData: (data: Record<string, unknown>) => void;
}) {
  switch (block.type) {
    case "heading": {
      const data = (block.data || {}) as HeadingBlockData;
      const currentLevel = Number(data.level) === 3 ? 3 : Number(data.level) === 4 ? 4 : 2;

      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 font-medium">Heading Size:</span>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((lvl) => {
                const isActive = currentLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateData({ level: lvl })}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
                        : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    H{lvl} {lvl === 2 ? "(Main Section)" : lvl === 3 ? "(Subsection)" : "(Sub-topic)"}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="text"
            value={data.text || ""}
            onChange={(e) => updateData({ text: e.target.value })}
            placeholder="Heading text (e.g. Why Docker? or Pinout Diagram)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      );
    }

    case "paragraph": {
      const data = block.data as ParagraphBlockData;
      return (
        <textarea
          rows={4}
          value={data.text || ""}
          onChange={(e) => updateData({ text: e.target.value })}
          placeholder="Write technical explanation, context, or detailed insights..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none leading-relaxed"
        />
      );
    }

    case "quote": {
      const data = block.data as QuoteBlockData;
      return (
        <div className="space-y-3">
          <textarea
            rows={3}
            value={data.text || ""}
            onChange={(e) => updateData({ text: e.target.value })}
            placeholder="Quote text..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={data.author || ""}
              onChange={(e) => updateData({ author: e.target.value })}
              placeholder="Author (e.g. Linus Torvalds)"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={data.source || ""}
              onChange={(e) => updateData({ source: e.target.value })}
              placeholder="Source / Context (e.g. Linux Kernel Mailing List)"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    case "code": {
      const data = block.data as CodeBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                LANGUAGE
              </label>
              <select
                value={data.language || "typescript"}
                onChange={(e) => updateData({ language: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none capitalize"
              >
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                FILE TITLE / DESCRIPTION
              </label>
              <input
                type="text"
                value={data.title || ""}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. server.ts or ESP32_GPIO.ino"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={Boolean(data.showLineNumbers)}
                  onChange={(e) => updateData({ showLineNumbers: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-cyan-400 focus:ring-0"
                />
                <span>Show Line Numbers</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1">
              CODE CONTENT
            </label>
            <textarea
              rows={8}
              value={data.code || ""}
              onChange={(e) => updateData({ code: e.target.value })}
              placeholder="// Write or paste code snippet here..."
              className="w-full font-mono rounded-xl border border-zinc-800 bg-black/80 p-3 text-xs sm:text-sm text-cyan-300 placeholder-zinc-700 focus:border-cyan-400 focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      );
    }

    case "command": {
      const data = block.data as CommandBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                COMMAND
              </label>
              <input
                type="text"
                value={data.command || ""}
                onChange={(e) => updateData({ command: e.target.value })}
                placeholder="e.g. docker run -d -p 8080:80 nginx:alpine"
                className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                WORKING DIRECTORY (OPTIONAL)
              </label>
              <input
                type="text"
                value={data.cwd || ""}
                onChange={(e) => updateData({ cwd: e.target.value })}
                placeholder="e.g. ~/projects"
                className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1">
              DESCRIPTION / INSTRUCTION
            </label>
            <input
              type="text"
              value={data.description || ""}
              onChange={(e) => updateData({ description: e.target.value })}
              placeholder="e.g. Start background nginx container mapping port 8080"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    case "terminal": {
      const data = block.data as TerminalBlockData;
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={data.command || ""}
            onChange={(e) => updateData({ command: e.target.value })}
            placeholder="Invoked command (e.g. esptool.py flash_id)"
            className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <textarea
            rows={5}
            value={data.output || ""}
            onChange={(e) => updateData({ output: e.target.value })}
            placeholder="Paste console output or execution logs..."
            className="w-full font-mono rounded-xl border border-zinc-800 bg-black/80 p-3 text-xs text-emerald-400 placeholder-zinc-700 focus:border-cyan-400 focus:outline-none"
            spellCheck={false}
          />
        </div>
      );
    }

    case "table": {
      const data = (block.data || {}) as TableBlockData;
      return <TableBlockEditor data={data} updateData={updateData} />;
    }

    case "note":
    case "tip":
    case "warning":
    case "important": {
      const data = block.data as CalloutBlockData;
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder={`Custom title (Optional, defaults to ${block.type.toUpperCase()})`}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <textarea
            rows={3}
            value={data.text || ""}
            onChange={(e) => updateData({ text: e.target.value })}
            placeholder="Alert or callout description..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      );
    }

    case "definition": {
      const data = block.data as DefinitionBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                TERM
              </label>
              <input
                type="text"
                value={data.term || ""}
                onChange={(e) => updateData({ term: e.target.value })}
                placeholder="e.g. Idempotency or SPI"
                className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                CONTEXT / DOMAIN
              </label>
              <input
                type="text"
                value={data.context || ""}
                onChange={(e) => updateData({ context: e.target.value })}
                placeholder="e.g. Distributed Systems or Embedded"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1">
              DEFINITION
            </label>
            <textarea
              rows={3}
              value={data.definition || ""}
              onChange={(e) => updateData({ definition: e.target.value })}
              placeholder="Precise technical definition explaining what this term means..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    case "concept": {
      const data = block.data as ConceptBlockData;
      const rawPoints = (data.keyPoints || []).join("\n");
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Concept Title (e.g. Containers vs Virtual Machines)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none font-bold"
          />
          <textarea
            rows={3}
            value={data.explanation || ""}
            onChange={(e) => updateData({ explanation: e.target.value })}
            placeholder="Deep technical explanation..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="text"
            value={data.analogy || ""}
            onChange={(e) => updateData({ analogy: e.target.value })}
            placeholder="Mental Model / Analogy (e.g. Think of a VM as a full house and a container as a furnished apartment)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-amber-200 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1">
              KEY POINTS (ONE PER LINE)
            </label>
            <textarea
              rows={3}
              value={rawPoints}
              onChange={(e) =>
                updateData({
                  keyPoints: e.target.value
                    .split("\n")
                    .map((p) => p.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Shares host OS kernel\nStarts in milliseconds\nIsolated user namespaces"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    case "step": {
      const data = block.data as StepBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                STEP #
              </label>
              <input
                type="number"
                value={data.stepNumber || 1}
                onChange={(e) => updateData({ stepNumber: Number(e.target.value) || 1 })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                STEP TITLE
              </label>
              <input
                type="text"
                value={data.title || ""}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. Install ESP-IDF Toolchain or Create Dockerfile"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <textarea
            rows={2}
            value={data.description || ""}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Step instructions and guidance..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-zinc-500">
                OPTIONAL STEP CODE / COMMAND
              </label>
              <select
                value={data.language || "bash"}
                onChange={(e) => updateData({ language: e.target.value })}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300 focus:outline-none"
              >
                {PROGRAMMING_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={3}
              value={data.code || ""}
              onChange={(e) => updateData({ code: e.target.value })}
              placeholder="e.g. git clone --recursive https://github.com/espressif/esp-idf.git"
              className="w-full font-mono rounded-xl border border-zinc-800 bg-black/70 p-2.5 text-xs text-cyan-300 placeholder-zinc-700 focus:border-cyan-400 focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>
      );
    }

    case "checklist": {
      const data = block.data as ChecklistBlockData;
      const items = data.items || [];

      const addItem = () => {
        updateData({
          items: [
            ...items,
            { id: Math.random().toString(36).substr(2, 9), text: "", done: false },
          ],
        });
      };

      const updateItem = (idx: number, patch: Partial<{ text: string; done: boolean }>) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], ...patch };
        updateData({ items: copy });
      };

      const removeItem = (idx: number) => {
        updateData({ items: items.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(item.done)}
                onChange={(e) => updateItem(idx, { done: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-400 focus:ring-0"
              />
              <input
                type="text"
                value={item.text || ""}
                onChange={(e) => updateItem(idx, { text: e.target.value })}
                placeholder={`Task / Requirement item #${idx + 1}`}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="h-7 w-7 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-cyan-500/40 hover:text-white transition"
          >
            + Add Checklist Item
          </button>
        </div>
      );
    }

    case "image": {
      const data = block.data as ImageBlockData;
      return (
        <div className="space-y-3">
          <DevVaultImageUploader
            currentUrl={data.url}
            onUploadSuccess={(url) => updateData({ url })}
            onRemove={() => updateData({ url: "" })}
            label="Content Image or Architecture Diagram"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={data.caption || ""}
              onChange={(e) => updateData({ caption: e.target.value })}
              placeholder="Caption (e.g. ESP32 DevKit V1 Pinout Diagram)"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={data.alt || ""}
              onChange={(e) => updateData({ alt: e.target.value })}
              placeholder="Alt text for accessibility"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      );
    }

    case "gallery": {
      const data = block.data as GalleryBlockData;
      const images = data.images || [];

      const addGalleryImage = () => {
        updateData({
          images: [
            ...images,
            { id: Math.random().toString(36).substr(2, 9), url: "", caption: "" },
          ],
        });
      };

      const updateGalleryImg = (
        idx: number,
        patch: Partial<{ url: string; caption: string }>
      ) => {
        const copy = [...images];
        copy[idx] = { ...copy[idx], ...patch };
        updateData({ images: copy });
      };

      const removeGalleryImg = (idx: number) => {
        updateData({ images: images.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-2"
              >
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>Image #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeGalleryImg(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <DevVaultImageUploader
                  currentUrl={img.url}
                  onUploadSuccess={(url) => updateGalleryImg(idx, { url })}
                  onRemove={() => updateGalleryImg(idx, { url: "" })}
                  label=""
                />
                <input
                  type="text"
                  value={img.caption || ""}
                  onChange={(e) => updateGalleryImg(idx, { caption: e.target.value })}
                  placeholder="Caption..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addGalleryImage}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-cyan-500/40 hover:text-white transition"
          >
            + Add Gallery Image
          </button>
        </div>
      );
    }

    case "link": {
      const data = block.data as LinkBlockData;
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Link Title (e.g. Official Docker Documentation)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="text"
            value={data.url || ""}
            onChange={(e) => updateData({ url: e.target.value })}
            placeholder="URL (e.g. https://docs.docker.com/engine/reference/)"
            className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-cyan-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="text"
            value={data.description || ""}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Short description of what the user will find at this link"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      );
    }

    case "reference": {
      const data = block.data as ReferenceBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="Title (e.g. RFC 7231: HTTP/1.1 Semantics and Content)"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={data.url || ""}
              onChange={(e) => updateData({ url: e.target.value })}
              placeholder="Citation link (e.g. https://datatracker.ietf.org/...)"
              className="font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-cyan-300 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={data.citation || ""}
            onChange={(e) => updateData({ citation: e.target.value })}
            placeholder="Citation text (e.g. Fielding, R., et al., IETF, June 2014)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      );
    }

    case "related": {
      const data = block.data as RelatedBlockData;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="Related Topic Title (e.g. Docker Compose Multi-Container)"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={data.slug || ""}
              onChange={(e) => updateData({ slug: e.target.value })}
              placeholder="Topic slug (e.g. docker-compose-intro)"
              className="font-mono rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={data.description || ""}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Why should the reader explore this next?"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      );
    }

    case "markdown": {
      const data = block.data as MarkdownBlockData;
      return (
        <textarea
          rows={6}
          value={data.markdown || ""}
          onChange={(e) => updateData({ markdown: e.target.value })}
          placeholder="Write raw markdown..."
          className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none leading-relaxed"
        />
      );
    }

    default:
      return (
        <div className="text-xs text-zinc-500">
          No specific editor for block type &quot;{block.type}&quot;.
        </div>
      );
  }
}

function getBlockPreviewSummary(block: DevVaultBlock): string {
  const d = block.data as Record<string, unknown>;
  if (block.type === "heading") return String(d.text || "");
  if (block.type === "paragraph") return String(d.text || "").slice(0, 60);
  if (block.type === "code") return `${d.language || "code"}: ${String(d.title || "").slice(0, 30)}`;
  if (block.type === "command") return `$ ${String(d.command || "").slice(0, 40)}`;
  if (block.type === "definition") return `${String(d.term || "")}`;
  if (block.type === "concept") return String(d.title || "");
  if (block.type === "step") return `Step ${d.stepNumber || 1}: ${String(d.title || "")}`;
  if (block.type === "image") return String(d.caption || d.url || "");
  if (block.type === "table") return String(d.caption || "Data Table");
  return "";
}

// ==========================================
// STRUCTURED DATA TABLE EDITOR
// ==========================================

function TableBlockEditor({
  data,
  updateData,
}: {
  data: TableBlockData;
  updateData: (data: Record<string, unknown>) => void;
}) {
  const headers =
    Array.isArray(data.headers) && data.headers.length > 0
      ? data.headers
      : ["Column 1", "Column 2"];
  const rows =
    Array.isArray(data.rows) && data.rows.length > 0
      ? data.rows
      : [new Array(headers.length).fill("")];

  const handleHeaderChange = (colIdx: number, val: string) => {
    const updated = [...headers];
    updated[colIdx] = val;
    updateData({ headers: updated });
  };

  const handleAddColumn = () => {
    const updatedHeaders = [...headers, `Column ${headers.length + 1}`];
    const updatedRows = rows.map((r) => [...r, ""]);
    updateData({ headers: updatedHeaders, rows: updatedRows });
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    const updatedHeaders = headers.filter((_, i) => i !== colIdx);
    const updatedRows = rows.map((r) => r.filter((_, i) => i !== colIdx));
    updateData({ headers: updatedHeaders, rows: updatedRows });
  };

  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const updatedRows = rows.map((r, rIndex) => {
      if (rIndex !== rowIdx) return r;
      const newRow = [...r];
      while (newRow.length < headers.length) {
        newRow.push("");
      }
      newRow[colIdx] = val;
      return newRow;
    });
    updateData({ rows: updatedRows });
  };

  const handleAddRow = () => {
    const newRow = new Array(headers.length).fill("");
    updateData({ rows: [...rows, newRow] });
  };

  const handleRemoveRow = (rowIdx: number) => {
    if (rows.length <= 1) {
      updateData({ rows: [new Array(headers.length).fill("")] });
      return;
    }
    const updatedRows = rows.filter((_, i) => i !== rowIdx);
    updateData({ rows: updatedRows });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
          TABLE CAPTION / TITLE (OPTIONAL)
        </label>
        <input
          type="text"
          value={data.caption || ""}
          onChange={(e) => updateData({ caption: e.target.value })}
          placeholder="e.g. HTTP Methods vs Idempotency & Safety"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-black/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Structured Table Matrix
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              ({headers.length} cols × {rows.length} rows)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddColumn}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition cursor-pointer"
            >
              <span>+</span>
              <span>Add Column</span>
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 transition cursor-pointer"
            >
              <span>+</span>
              <span>Add Row</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="w-10 px-3 py-2 text-center font-mono text-[10px] text-zinc-500 uppercase select-none">
                  #
                </th>
                {headers.map((h, colIdx) => (
                  <th key={colIdx} className="px-2 py-2 min-w-[140px]">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                        placeholder={`Column ${colIdx + 1}`}
                        className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                      />
                      {headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(colIdx)}
                          className="h-6 w-6 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs cursor-pointer"
                          title="Delete column"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-2 py-2 text-center font-mono text-[10px] text-zinc-500 select-none">
                  Del
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-900/30 transition">
                  <td className="px-3 py-2 text-center font-mono text-[11px] text-zinc-500 select-none">
                    {rowIdx + 1}
                  </td>
                  {headers.map((_, colIdx) => (
                    <td key={colIdx} className="px-2 py-1.5">
                      <input
                        type="text"
                        value={row[colIdx] || ""}
                        onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        placeholder="Cell value (commas allowed)..."
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:border-cyan-400 focus:bg-zinc-900 focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIdx)}
                      className="h-6 w-6 rounded inline-flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs cursor-pointer"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
          <span>
            Tip: Commas, quotes, and punctuation inside cell values are preserved cleanly.
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            + Add another row
          </button>
        </div>
      </div>
    </div>
  );
}

