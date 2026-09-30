import { Project, ProjectArchitecture } from "@/types/project";

export const PROJECT_CATEGORIES = [
  "Full Stack",
  "AI / ML",
  "Firmware / Embedded",
  "Systems & Cloud",
  "Frontend",
] as const;

export function normalizeCategory(raw?: string): string {
  if (!raw) return "Full Stack";
  const s = raw.trim().toLowerCase();
  if (
    s.includes("ai") ||
    s.includes("ml") ||
    s.includes("machine learning") ||
    s === "aiml"
  ) {
    return "AI / ML";
  }
  if (
    s.includes("firmware") ||
    s.includes("embedded") ||
    s.includes("iot") ||
    s.includes("hardware") ||
    s.includes("microcontroller")
  ) {
    return "Firmware / Embedded";
  }
  if (s.includes("system") || s.includes("cloud") || s.includes("devops")) {
    return "Systems & Cloud";
  }
  if (s.includes("frontend") || s.includes("ui") || s.includes("web client")) {
    return "Frontend";
  }
  if (s.includes("full") || s.includes("stack")) {
    return "Full Stack";
  }
  return raw.trim();
}

export function resolveProjectArchitecture(project: Project): {
  architecture: ProjectArchitecture;
  category: string;
  highlights: string[];
} {
  const techs = (project.technologies || []).map((t) => t.toLowerCase());

  // 1. If project has an explicit category, normalize and respect it 100%!
  let category: string;
  if (project.category && project.category.trim() !== "") {
    category = normalizeCategory(project.category);
  } else {
    // 2. Only infer if NO category exists
    if (
      techs.some((t) =>
        [
          "firmware",
          "embedded",
          "arduino",
          "esp32",
          "stm32",
          "microcontroller",
          "rtos",
          "freertos",
          "iot",
          "hardware",
          "verilog",
          "vhdl",
          "arm",
          "i2c",
          "spi",
          "uart",
          "c/c++",
          "sensors",
          "sensor",
          "driver",
        ].some((keyword) => t.includes(keyword))
      )
    ) {
      category = "Firmware / Embedded";
    } else if (
      techs.some((t) =>
        [
          "ai",
          "python",
          "machine learning",
          "tensorflow",
          "pytorch",
          "gemini",
          "openai",
          "langchain",
          "nlp",
          "deep learning",
          "computer vision",
          "llm",
          "rag",
          "pandas",
          "scikit",
        ].some((keyword) => t.includes(keyword))
      )
    ) {
      category = "AI / ML";
    } else if (
      techs.some((t) =>
        [
          "rust",
          "go",
          "golang",
          "docker",
          "kubernetes",
          "linux",
          "system",
          "distributed",
        ].some((keyword) => t.includes(keyword))
      )
    ) {
      category = "Systems & Cloud";
    } else if (
      techs.some((t) =>
        ["react", "next.js", "nextjs", "vue", "tailwind", "frontend"].some(
          (keyword) => t.includes(keyword)
        )
      ) &&
      !techs.some((t) =>
        [
          "node",
          "express",
          "mongodb",
          "postgres",
          "sql",
          "django",
          "flask",
        ].some((keyword) => t.includes(keyword))
      )
    ) {
      category = "Frontend";
    } else {
      category = "Full Stack";
    }
  }

  const isFirmware =
    category.toLowerCase().includes("firmware") ||
    category.toLowerCase().includes("embedded");

  const isAi =
    category.toLowerCase().includes("ai") ||
    category.toLowerCase().includes("ml");

  // Detect Client / Interface Layer
  let client = project.architecture?.client;
  if (!client) {
    if (isFirmware) {
      const hwTechs = (project.technologies || []).filter((t) =>
        [
          "esp32",
          "stm32",
          "arduino",
          "arm",
          "hardware",
          "sensor",
          "sensors",
          "actuator",
          "gpio",
          "microcontroller",
        ].some((k) => t.toLowerCase().includes(k))
      );
      client = hwTechs.length
        ? hwTechs.join(", ")
        : "Microcontroller / Hardware Interface";
    } else if (isAi) {
      const aiClientTechs = (project.technologies || []).filter((t) =>
        [
          "react",
          "next.js",
          "streamlit",
          "gradio",
          "python",
          "tailwind",
        ].some((k) => t.toLowerCase().includes(k))
      );
      client = aiClientTechs.length
        ? aiClientTechs.join(", ")
        : "User Interface / Inference Client";
    } else {
      const clientTechs = (project.technologies || []).filter((t) =>
        [
          "react",
          "next.js",
          "nextjs",
          "tailwind",
          "tailwindcss",
          "typescript",
          "javascript",
          "html",
          "css",
          "redux",
          "zustand",
        ].some((k) => t.toLowerCase().includes(k))
      );
      client = clientTechs.length
        ? clientTechs.join(", ")
        : "Modern Web Client (React / Next.js)";
    }
  }

  // Detect Core Processing / API Layer
  let api = project.architecture?.api;
  if (!api) {
    if (isFirmware) {
      const fwTechs = (project.technologies || []).filter((t) =>
        [
          "c",
          "c++",
          "rtos",
          "freertos",
          "driver",
          "drivers",
          "firmware",
          "i2c",
          "spi",
          "uart",
          "ble",
        ].some((k) => t.toLowerCase().includes(k))
      );
      api = fwTechs.length
        ? fwTechs.join(", ")
        : "Bare-Metal C/C++ Firmware / FreeRTOS";
    } else if (isAi) {
      const modelTechs = (project.technologies || []).filter((t) =>
        [
          "python",
          "fastapi",
          "flask",
          "pytorch",
          "tensorflow",
          "langchain",
          "gemini",
          "openai",
        ].some((k) => t.toLowerCase().includes(k))
      );
      api = modelTechs.length
        ? modelTechs.join(", ")
        : "FastAPI / Model Serving Engine";
    } else {
      const apiTechs = (project.technologies || []).filter((t) =>
        [
          "node",
          "express",
          "rest",
          "graphql",
          "fastapi",
          "flask",
          "django",
          "python",
        ].some((k) => t.toLowerCase().includes(k))
      );
      api = apiTechs.length
        ? apiTechs.join(", ")
        : "Node.js & Express REST API";
    }
  }

  // Detect Persistence / Communication Layer
  let database = project.architecture?.database;
  if (!database) {
    if (isFirmware) {
      database = "Flash Memory / EEPROM & Protocols (I2C/SPI/UART/BLE)";
    } else if (isAi) {
      const vectorTechs = (project.technologies || []).filter((t) =>
        [
          "chroma",
          "pinecone",
          "faiss",
          "qdrant",
          "vector",
          "mongodb",
          "postgres",
        ].some((k) => t.toLowerCase().includes(k))
      );
      database = vectorTechs.length
        ? vectorTechs.join(", ")
        : "Vector Database & Embeddings Store";
    } else {
      const dbTechs = (project.technologies || []).filter((t) =>
        [
          "mongodb",
          "mongoose",
          "postgres",
          "postgresql",
          "mysql",
          "redis",
          "firebase",
          "sqlite",
          "prisma",
        ].some((k) => t.toLowerCase().includes(k))
      );
      database = dbTechs.length
        ? dbTechs.join(", ")
        : "MongoDB & Mongoose Store";
    }
  }

  // Detect Deployment / Target Platform
  let deployment = project.architecture?.deployment;
  if (!deployment) {
    if (isFirmware) {
      deployment = "Embedded Hardware Target / Custom PCB";
    } else if (isAi) {
      deployment = "Cloud Inference Endpoint (HuggingFace / GCP / Docker)";
    } else {
      const cloudTechs = (project.technologies || []).filter((t) =>
        [
          "vercel",
          "render",
          "aws",
          "docker",
          "cloudinary",
          "firebase",
          "netlify",
        ].some((k) => t.toLowerCase().includes(k))
      );
      deployment = cloudTechs.length
        ? cloudTechs.join(", ")
        : "Vercel / Render Cloud Infrastructure";
    }
  }

  // Highlights
  const highlights =
    project.highlights && project.highlights.length > 0
      ? project.highlights
      : isFirmware
      ? [
          `Engineered bare-metal firmware and peripheral drivers using ${api}.`,
          `Configured real-time sensor polling and communication via ${database}.`,
          `Verified hardware execution and memory constraints on ${deployment}.`,
        ]
      : isAi
      ? [
          `Architected machine learning and inference pipeline using ${api}.`,
          `Integrated high-dimensional similarity retrieval and persistence with ${database}.`,
          `Deployed low-latency inference endpoint to ${deployment}.`,
        ]
      : [
          `Engineered responsive client architecture using ${client}.`,
          `Implemented resilient backend endpoints and data persistence via ${api} & ${database}.`,
          `Deployed with automated CI/CD and production hardening on ${deployment}.`,
        ];

  return {
    architecture: {
      client,
      api,
      database,
      deployment,
      notes: project.architecture?.notes || [],
    },
    category,
    highlights,
  };
}
