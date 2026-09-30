import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    technologies: [String],

    github: {
      type: String,
      default: "",
    },

    demo: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      default: "Full Stack",
    },

    highlights: [String],

    architecture: {
      client: { type: String, default: "" },
      api: { type: String, default: "" },
      database: { type: String, default: "" },
      caching: { type: String, default: "" },
      deployment: { type: String, default: "" },
      notes: [String],
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ featured: 1, createdAt: -1 });

const Project = mongoose.model(
  "Project",
  projectSchema
);

export default Project;