//This file contains the data for the projects section of the portfolio. Each project has a title, description, technologies used, and links to GitHub and demo.But this method is static and not dynamic. I will implement a backend API to fetch the projects data from a database in the future.so this file willbe useless for cuurently but I will keep it for future reference.


export const projects = [
  {
    title: "AI Teaching Assistant",
    description:
      "RAG-based assistant capable of answering questions from custom documents using embeddings and semantic search.",
    technologies: ["Python", "NLP", "LLM", "RAG"],
    github: "#",
    demo: "#",
  },

  {
    title: "Speaker Recognition System",
    description:
      "MFCC-based speaker identification system developed using machine learning and signal processing techniques.",
    technologies: ["Python", "DSP", "MFCC", "Machine Learning"],
    github: "#",
    demo: "#",
  },

  {
    title: "Criminal Face Recognition",
    description:
      "Web-based application for criminal face generation and recognition using computer vision techniques.",
    technologies: ["Python", "OpenCV", "Computer Vision"],
    github: "#",
    demo: "#",
  },

  {
    title: "IoT Monitoring System",
    description:
      "ESP32-based environmental monitoring system with cloud connectivity and real-time sensor tracking.",
    technologies: ["ESP32", "Arduino", "IoT", "ThingSpeak"],
    github: "#",
    demo: "#",
  },

  {
    title: "Digital Traffic Controller",
    description:
      "Finite State Machine based traffic controller designed and simulated using Verilog and Xilinx Vivado.",
    technologies: ["Verilog", "Vivado", "FSM"],
    github: "#",
    demo: "#",
  },
];