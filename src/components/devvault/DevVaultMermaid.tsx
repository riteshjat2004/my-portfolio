"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Code2,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Download,
} from "lucide-react";

interface DevVaultMermaidProps {
  chart: string;
  title?: string;
}

let mermaidInitialized = false;

export default function DevVaultMermaid({ chart, title }: DevVaultMermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Clean raw chart string
  const cleanChart = chart.trim();

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            themeVariables: {
              darkMode: true,
              background: "#09090b",
              primaryColor: "#0284c7",
              primaryTextColor: "#f8fafc",
              primaryBorderColor: "#38bdf8",
              lineColor: "#38bdf8",
              secondaryColor: "#312e81",
              tertiaryColor: "#18181b",
              mainBkg: "#18181b",
              nodeBorder: "#3f3f46",
              clusterBkg: "#0f172a90",
              clusterBorder: "#334155",
              titleColor: "#38bdf8",
              edgeLabelBackground: "#18181b",
              actorTextColor: "#f8fafc",
              actorBkg: "#18181b",
              actorBorder: "#38bdf8",
              signalColor: "#38bdf8",
              signalTextColor: "#f8fafc",
            },
          });
          mermaidInitialized = true;
        }

        // Generate valid, unique element ID
        const uniqueId = `mermaid_${Math.random().toString(36).slice(2, 10)}`;

        const { svg } = await mermaid.render(uniqueId, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Mermaid rendering error:", err);
          const errorMsg =
            err instanceof Error ? err.message : "Syntax error in diagram definition";
          setError(errorMsg);
          setLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [cleanChart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanChart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title || "architecture-diagram").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`my-6 rounded-2xl border border-zinc-800/90 bg-zinc-950 overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 flex flex-col bg-zinc-950/98 backdrop-blur-xl border-cyan-500/40 shadow-cyan-950/50"
          : ""
      }`}
    >
      {/* Diagram Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900/70 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase">
            {title || "Architecture & Workflow Diagram"}
          </span>
          <span className="rounded bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300 font-sans">
            Mermaid
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls (only in visual mode) */}
          {!showCode && !error && (
            <div className="hidden sm:flex items-center gap-1 border-r border-zinc-800 pr-2 mr-1">
              <button
                type="button"
                onClick={handleZoomIn}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono text-zinc-500 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          )}

          {/* Toggle Code / Visual */}
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition ${
              showCode
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700"
            }`}
            title={showCode ? "View visual diagram" : "View diagram source code"}
          >
            {showCode ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Diagram</span>
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5" />
                <span>Source</span>
              </>
            )}
          </button>

          {/* Download SVG */}
          {!showCode && svgContent && (
            <button
              type="button"
              onClick={handleDownloadSVG}
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              title="Download SVG diagram"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-xs font-mono text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            title="Copy diagram markup"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div
        className={`relative w-full overflow-auto p-6 sm:p-8 flex items-center justify-center transition-all bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 ${
          isFullscreen ? "flex-1 max-h-none" : "min-h-[260px] max-h-[700px]"
        }`}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="text-xs font-mono tracking-wider">Rendering system diagram...</span>
          </div>
        )}

        {error && (
          <div className="w-full max-w-xl rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-left text-sm text-red-200">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Diagram Rendering Error</span>
            </div>
            <p className="mt-2 text-xs font-mono text-red-300/80 overflow-x-auto whitespace-pre-wrap">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setShowCode(true)}
              className="mt-3 text-xs font-mono text-cyan-400 hover:underline"
            >
              Click to inspect raw diagram code →
            </button>
          </div>
        )}

        {!loading && !error && showCode && (
          <div className="w-full text-left">
            <pre className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs sm:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
              <code>{cleanChart}</code>
            </pre>
          </div>
        )}

        {!loading && !error && !showCode && (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="w-full flex items-center justify-center transition-transform duration-200 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:filter [&_svg]:drop-shadow-lg"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Diagram Footer Status */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span>Interactive Vector Diagram</span>
        <span className="hidden sm:inline">Use zoom or expand to inspect nodes</span>
      </div>
    </div>
  );
}
