"use client";

import React, { useState } from "react";
import { DevVaultBlock, DevVaultBlockType } from "@/types/devvault";
import DevVaultBlockEditor from "./DevVaultBlockEditor";

interface DevVaultBlockListProps {
  blocks: DevVaultBlock[];
  onChange: (blocks: DevVaultBlock[]) => void;
}

function createUniqueId(prefix = "block"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function DevVaultBlockList({
  blocks,
  onChange,
}: DevVaultBlockListProps) {
  const [activePickerLocation, setActivePickerLocation] = useState<"top" | "bottom" | number | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const openAddMenuAtTop = () => {
    setActivePickerLocation((prev) => (prev === "top" ? null : "top"));
  };

  const openAddMenuAtEnd = () => {
    setActivePickerLocation((prev) => (prev === "bottom" ? null : "bottom"));
  };

  const openAddMenuAfter = (index: number) => {
    setActivePickerLocation((prev) => (prev === index ? null : index));
  };

  const addBlock = (type: DevVaultBlockType) => {
    const newBlock: DevVaultBlock = {
      id: createUniqueId("block"),
      type,
      data: getDefaultDataForType(type),
    };

    let newBlocks: DevVaultBlock[];
    if (activePickerLocation === "top") {
      newBlocks = [newBlock, ...blocks];
    } else if (
      typeof activePickerLocation === "number" &&
      activePickerLocation >= 0 &&
      activePickerLocation < blocks.length
    ) {
      const copy = [...blocks];
      copy.splice(activePickerLocation + 1, 0, newBlock);
      newBlocks = copy;
    } else {
      newBlocks = [...blocks, newBlock];
    }

    onChange(newBlocks);
    setActivePickerLocation(null);

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(`devvault-block-${newBlock.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 60);
    }
  };

  const updateBlock = (index: number, updatedBlock: DevVaultBlock) => {
    const copy = [...blocks];
    copy[index] = updatedBlock;
    onChange(copy);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const copy = [...blocks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const duplicated: DevVaultBlock = {
      ...original,
      id: createUniqueId("block_copy"),
      data: JSON.parse(JSON.stringify(original.data)),
    };
    const copy = [...blocks];
    copy.splice(index + 1, 0, duplicated);
    onChange(copy);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateKey: string) => {
    const templateBlocks = getTemplateBlocks(templateKey);
    if (blocks.length > 0) {
      if (
        !confirm(
          "Apply this template? It will append structured sections to your topic."
        )
      ) {
        return;
      }
    }
    onChange([...blocks, ...templateBlocks]);
    setShowTemplateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Scaffolding bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Content Blocks</span>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Construct educational flow section by section. Add, reorder, or duplicate blocks freely.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-white"
          >
            <span>✨</span>
            <span>Load Pedagogical Template</span>
          </button>

          <button
            type="button"
            onClick={openAddMenuAtTop}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-cyan-300 active:scale-95 cursor-pointer"
          >
            <span>{activePickerLocation === "top" ? "✕" : "+"}</span>
            <span>{activePickerLocation === "top" ? "Cancel" : "Add Block"}</span>
          </button>
        </div>
      </div>

      {/* Inline Block Picker at Top */}
      {activePickerLocation === "top" && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-150">
          <InlineBlockPicker
            onSelect={(type) => addBlock(type)}
            onClose={() => setActivePickerLocation(null)}
            title="Add Block at Beginning"
          />
        </div>
      )}

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 text-2xl font-bold mb-3">
            📚
          </div>
          <h4 className="text-base font-bold text-white">This topic is empty</h4>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Technical knowledge is built block by block. Start with a definition, an overview concept, or load a pedagogical scaffold.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition"
            >
              ✨ Load Complete Template
            </button>
            <button
              type="button"
              onClick={openAddMenuAtEnd}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition cursor-pointer"
            >
              + Add First Block
            </button>
          </div>

          {activePickerLocation === "bottom" && (
            <div className="mt-6 text-left animate-in fade-in duration-150">
              <InlineBlockPicker
                onSelect={(type) => addBlock(type)}
                onClose={() => setActivePickerLocation(null)}
                title="Add First Block"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <React.Fragment key={block.id}>
              <div id={`devvault-block-${block.id}`}>
                <DevVaultBlockEditor
                  block={block}
                  index={idx}
                  totalBlocks={blocks.length}
                  onChange={(updated) => updateBlock(idx, updated)}
                  onMoveUp={() => moveBlock(idx, "up")}
                  onMoveDown={() => moveBlock(idx, "down")}
                  onDuplicate={() => duplicateBlock(idx)}
                  onDelete={() => deleteBlock(idx)}
                  onInsertBelow={() => openAddMenuAfter(idx)}
                />
              </div>

              {/* In-between block insertion control */}
              {idx < blocks.length - 1 && (
                <div className="py-1">
                  {activePickerLocation === idx ? (
                    <div className="my-2 animate-in fade-in duration-150">
                      <InlineBlockPicker
                        onSelect={(type) => addBlock(type)}
                        onClose={() => setActivePickerLocation(null)}
                        title={`Insert Block Below Section #${idx + 1}`}
                      />
                    </div>
                  ) : (
                    <div className="group/divider relative py-1 flex items-center justify-center">
                      <div className="absolute inset-x-0 h-px bg-zinc-800/40 group-hover/divider:bg-cyan-500/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => openAddMenuAfter(idx)}
                        className="relative z-10 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-0.5 text-[10px] font-mono text-zinc-500 opacity-40 hover:opacity-100 group-hover/divider:opacity-100 hover:border-cyan-500/40 hover:bg-zinc-900 hover:text-cyan-400 transition cursor-pointer shadow-sm"
                        title={`Insert section between #${idx + 1} and #${idx + 2}`}
                      >
                        <span>+</span>
                        <span>Insert Block Here</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Inline "+ Add Another Section Block" with small tab opening right above it */}
          <div className="pt-4 flex flex-col items-center">
            {activePickerLocation === "bottom" && (
              <div className="w-full mb-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <InlineBlockPicker
                  onSelect={(type) => addBlock(type)}
                  onClose={() => setActivePickerLocation(null)}
                  title="Add Section Block"
                />
              </div>
            )}

            <button
              type="button"
              onClick={openAddMenuAtEnd}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-6 py-2.5 text-xs font-semibold text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-zinc-900 transition cursor-pointer shadow-sm active:scale-95"
            >
              <span>{activePickerLocation === "bottom" ? "✕" : "+"}</span>
              <span>
                {activePickerLocation === "bottom"
                  ? "Close Section Picker"
                  : "Add Another Section Block"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pedagogical Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>✨ Pedagogical Templates</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Scaffold structured learning progressions in one click:
                  <span className="block text-zinc-300 font-mono mt-0.5">
                    What is it? → Why? → How it works → Practical usage → Gotchas → Quick Reference
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-zinc-500 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TemplateCard
                title="Universal Learning Scaffold"
                desc="Complete progression: What is it, Why, Architecture, Usage, Code, Common Pitfalls, and Quick Reference."
                icon="🎓"
                onClick={() => applyTemplate("universal")}
              />
              <TemplateCard
                title="Hardware & Firmware Guide"
                desc="Pinouts, schematic diagrams, wiring instructions, flashing CLI commands, C/C++ firmware, and troubleshooting."
                icon="⚡"
                onClick={() => applyTemplate("hardware")}
              />
              <TemplateCard
                title="API & Protocol Deep Dive"
                desc="Definition, HTTP basics, request/response structures, methods table, auth patterns, and Express implementation."
                icon="🔌"
                onClick={() => applyTemplate("api")}
              />
              <TemplateCard
                title="DevOps & Tool Cheatsheet"
                desc="Core commands, container/config manifests, production workflow, and quick reference cheatsheet."
                icon="🐳"
                onClick={() => applyTemplate("devops")}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface InlineBlockPickerProps {
  onSelect: (type: DevVaultBlockType) => void;
  onClose: () => void;
  title?: string;
}

type BlockCategory = "all" | "text" | "code" | "callouts" | "media";

const BLOCK_DEFINITIONS: Array<{
  type: DevVaultBlockType;
  icon: string;
  label: string;
  desc: string;
  category: "text" | "code" | "callouts" | "media";
}> = [
  // Text & Narrative
  { type: "heading", icon: "#", label: "Heading", desc: "H2, H3, H4 section title", category: "text" },
  { type: "paragraph", icon: "¶", label: "Paragraph", desc: "Core technical narrative", category: "text" },
  { type: "quote", icon: "“", label: "Quote", desc: "Notable quote or axiom", category: "text" },
  { type: "markdown", icon: "M↓", label: "Markdown", desc: "Freeform markdown text", category: "text" },

  // Technical & Code
  { type: "code", icon: "💻", label: "Code Block", desc: "Syntax-highlighted code", category: "code" },
  { type: "command", icon: "$", label: "Command", desc: "One-click copy CLI", category: "code" },
  { type: "terminal", icon: "⌨️", label: "Terminal", desc: "Console output display", category: "code" },
  { type: "table", icon: "▦", label: "Data Table", desc: "Structured rows & columns", category: "code" },

  // Educational Callouts
  { type: "concept", icon: "🧠", label: "Core Concept", desc: "Mental models & analogies", category: "callouts" },
  { type: "definition", icon: "📖", label: "Definition", desc: "Strict technical definition", category: "callouts" },
  { type: "step", icon: "🔢", label: "Numbered Step", desc: "Hands-on walkthrough", category: "callouts" },
  { type: "tip", icon: "💡", label: "Pro Tip", desc: "Best practices & wisdom", category: "callouts" },
  { type: "warning", icon: "⚠️", label: "Warning", desc: "Common bugs & pitfalls", category: "callouts" },
  { type: "note", icon: "📝", label: "Note", desc: "Contextual reminder", category: "callouts" },
  { type: "important", icon: "🚨", label: "Important", desc: "Critical requirement", category: "callouts" },
  { type: "checklist", icon: "☑️", label: "Checklist", desc: "Interactive verification", category: "callouts" },

  // Media & References
  { type: "image", icon: "🖼️", label: "Image / Diagram", desc: "Diagram or schematic", category: "media" },
  { type: "gallery", icon: "🗂️", label: "Image Gallery", desc: "Multiple photos/diagrams", category: "media" },
  { type: "link", icon: "🔗", label: "External Link", desc: "Official docs or repo", category: "media" },
  { type: "reference", icon: "📚", label: "Citation", desc: "Paper or RFC reference", category: "media" },
];

function InlineBlockPicker({
  onSelect,
  onClose,
  title = "Select Block Type",
}: InlineBlockPickerProps) {
  const [activeTab, setActiveTab] = useState<BlockCategory>("all");

  const filteredBlocks =
    activeTab === "all"
      ? BLOCK_DEFINITIONS
      : BLOCK_DEFINITIONS.filter((b) => b.category === activeTab);

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-zinc-950/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-400 text-xs font-bold">
            +
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            {title}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { key: "all", label: "All" },
              { key: "text", label: "Text" },
              { key: "code", label: "Code & Data" },
              { key: "callouts", label: "Callouts" },
              { key: "media", label: "Media" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === tab.key
                  ? "bg-cyan-400 text-black font-semibold shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
            title="Cancel"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Grid of block options */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
        {filteredBlocks.map((block) => (
          <button
            key={block.type}
            type="button"
            onClick={() => onSelect(block.type)}
            className="group flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-2.5 text-left transition hover:border-cyan-500/50 hover:bg-zinc-900 hover:shadow-lg hover:shadow-cyan-950/30 cursor-pointer"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-cyan-400 group-hover:border-cyan-500/50 group-hover:scale-105 transition-transform">
              {block.icon}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                {block.label}
              </span>
              <span className="block text-[10px] text-zinc-500 truncate group-hover:text-zinc-400">
                {block.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  title,
  desc,
  icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition hover:border-cyan-500/50 hover:bg-zinc-900/80 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      <span className="mt-4 text-xs font-bold text-cyan-400 flex items-center gap-1">
        <span>Insert Template</span>
        <span>→</span>
      </span>
    </button>
  );
}

function getDefaultDataForType(type: DevVaultBlockType): Record<string, unknown> {
  switch (type) {
    case "heading":
      return { level: 2, text: "" };
    case "paragraph":
      return { text: "" };
    case "quote":
      return { text: "", author: "", source: "" };
    case "code":
      return { language: "typescript", title: "", code: "", showLineNumbers: true };
    case "command":
      return { command: "", description: "", cwd: "" };
    case "terminal":
      return { command: "", output: "" };
    case "table":
      return { headers: ["Item", "Description", "Status"], rows: [["A", "Sample A", "Active"], ["B", "Sample B", "Pending"]], caption: "" };
    case "note":
    case "tip":
    case "warning":
    case "important":
      return { title: "", text: "" };
    case "definition":
      return { term: "", definition: "", context: "" };
    case "concept":
      return { title: "", explanation: "", analogy: "", keyPoints: [] };
    case "step":
      return { stepNumber: 1, title: "", description: "", code: "", language: "bash" };
    case "checklist":
      return { items: [{ id: "1", text: "Requirement 1", done: false }] };
    case "image":
      return { url: "", caption: "", alt: "" };
    case "gallery":
      return { images: [] };
    case "link":
      return { url: "", title: "", description: "" };
    case "reference":
      return { title: "", citation: "", url: "" };
    case "related":
      return { title: "", slug: "", description: "" };
    case "markdown":
      return { markdown: "" };
    default:
      return {};
  }
}

function getTemplateBlocks(templateKey: string): DevVaultBlock[] {
  const uid = () => createUniqueId("tmpl");

  if (templateKey === "universal") {
    return [
      { id: uid(), type: "heading", data: { level: 2, text: "What is it?" } },
      { id: uid(), type: "definition", data: { term: "Topic Definition", definition: "A precise technical definition explaining what this technology does and its fundamental abstraction.", context: "Core Concept" } },
      { id: uid(), type: "heading", data: { level: 2, text: "Why does it exist?" } },
      { id: uid(), type: "concept", data: { title: "The Problem It Solves", explanation: "Before this technology existed, developers struggled with particular bottlenecks. This tool simplifies those friction points.", analogy: "Think of it as...", keyPoints: ["Eliminates manual boilerplate", "Guarantees reproducibility", "Improves execution latency"] } },
      { id: uid(), type: "heading", data: { level: 2, text: "How does it work under the hood?" } },
      { id: uid(), type: "paragraph", data: { text: "Explain the underlying architecture, data flow, memory model, or protocols." } },
      { id: uid(), type: "heading", data: { level: 2, text: "Practical Implementation" } },
      { id: uid(), type: "step", data: { stepNumber: 1, title: "Initialize Setup", description: "First, configure the environment or install dependencies.", code: "npm install", language: "bash" } },
      { id: uid(), type: "code", data: { language: "typescript", title: "example.ts", code: "// Core working code snippet\nconsole.log('Operational');", showLineNumbers: true } },
      { id: uid(), type: "heading", data: { level: 2, text: "Common Pitfalls & Troubleshooting" } },
      { id: uid(), type: "warning", data: { title: "Frequent Misconfiguration", text: "Beware of missing environment variables or unhandled asynchronous exceptions in production." } },
      { id: uid(), type: "heading", data: { level: 2, text: "Quick Reference" } },
      { id: uid(), type: "command", data: { command: "npm run start", description: "Start the production execution" } },
    ];
  }

  if (templateKey === "hardware") {
    return [
      { id: uid(), type: "heading", data: { level: 2, text: "Hardware Overview" } },
      { id: uid(), type: "definition", data: { term: "Microcontroller Specifications", definition: "Dual-core Tensilica Xtensa 32-bit LX6 microprocessor with integrated Wi-Fi and Bluetooth.", context: "Embedded Systems" } },
      { id: uid(), type: "heading", data: { level: 2, text: "Pinout & Wiring" } },
      { id: uid(), type: "image", data: { url: "", caption: "Microcontroller DevKit Pinout Diagram", alt: "Pinout diagram" } },
      { id: uid(), type: "table", data: { headers: ["Pin", "Function", "Notes"], rows: [["GPIO 2", "Internal LED", "Boot strapping pin"], ["GPIO 21", "I2C SDA", "Pull-up required"], ["GPIO 22", "I2C SCL", "Pull-up required"]], caption: "Key GPIO Assignments" } },
      { id: uid(), type: "heading", data: { level: 2, text: "Firmware Implementation" } },
      { id: uid(), type: "code", data: { language: "cpp", title: "main.cpp", code: "#include <Arduino.h>\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  delay(1000);\n}", showLineNumbers: true } },
      { id: uid(), type: "heading", data: { level: 2, text: "Flashing & Monitoring" } },
      { id: uid(), type: "command", data: { command: "idf.py flash monitor", description: "Build, flash over UART, and start serial monitor" } },
      { id: uid(), type: "warning", data: { title: "Brownout Detector Triggered", text: "Ensure steady 3.3V power supply. Insufficient current during Wi-Fi transmission causes brownout restarts." } },
    ];
  }

  if (templateKey === "api") {
    return [
      { id: uid(), type: "heading", data: { level: 2, text: "API Architecture & Principles" } },
      { id: uid(), type: "concept", data: { title: "RESTful Resource Modeling", explanation: "Resources represent entities identifiable via URI paths, manipulated through standard HTTP methods.", analogy: "URIs are nouns (e.g. /users), and HTTP methods are verbs (GET, POST).", keyPoints: ["Stateless communication", "Idempotent mutations", "Uniform interface"] } },
      { id: uid(), type: "heading", data: { level: 2, text: "Endpoint Specification" } },
      { id: uid(), type: "table", data: { headers: ["Method", "Endpoint", "Idempotent", "Status Code"], rows: [["GET", "/api/v1/items", "Yes", "200 OK"], ["POST", "/api/v1/items", "No", "201 Created"], ["DELETE", "/api/v1/items/:id", "Yes", "204 No Content"]], caption: "REST Endpoints" } },
      { id: uid(), type: "heading", data: { level: 2, text: "Server Implementation" } },
      { id: uid(), type: "code", data: { language: "typescript", title: "routes.ts", code: "app.get('/api/v1/items', (req, res) => {\n  res.json({ items: [] });\n});", showLineNumbers: true } },
      { id: uid(), type: "tip", data: { title: "Cache-Control Headers", text: "Always return ETag or Cache-Control headers for read-heavy endpoints to save database roundtrips." } },
    ];
  }

  // DevOps / Tooling
  return [
    { id: uid(), type: "heading", data: { level: 2, text: "Overview & Mental Model" } },
    { id: uid(), type: "concept", data: { title: "Architecture & Workflow", explanation: "Encapsulates application state, dependencies, and environment configurations into immutable layers.", keyPoints: ["Predictable staging & prod parity", "Lightweight kernel-level process isolation"] } },
    { id: uid(), type: "heading", data: { level: 2, text: "Configuration Manifest" } },
    { id: uid(), type: "code", data: { language: "yaml", title: "compose.yaml", code: "services:\n  app:\n    image: node:20-alpine\n    ports:\n      - '3000:3000'", showLineNumbers: true } },
    { id: uid(), type: "heading", data: { level: 2, text: "Essential Commands" } },
    { id: uid(), type: "command", data: { command: "docker compose up -d --build", description: "Build images and start services in detached mode" } },
    { id: uid(), type: "terminal", data: { command: "docker ps", output: "CONTAINER ID   IMAGE      COMMAND    STATUS\na1b2c3d4e5f6   node:20    'node'     Up 2 hours" } },
    { id: uid(), type: "warning", data: { title: "Storage Volumes", text: "Ensure volumes are explicitly defined so database states persist through container restarts." } },
  ];
}
