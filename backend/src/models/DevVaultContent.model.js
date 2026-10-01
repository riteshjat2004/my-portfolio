import mongoose from "mongoose";

const devVaultContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DevVaultCategory",
      required: [true, "Category reference is required"],
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    contentType: {
      type: String,
      default: "article",
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
      index: true,
    },

    coverImage: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    ordering: {
      type: Number,
      default: 0,
    },

    readingTime: {
      type: Number,
      default: 5,
      min: [1, "Reading time must be at least 1 minute"],
    },

    author: {
      type: String,
      default: "Ritesh Jat",
      trim: true,
    },

    hasDraft: {
      type: Boolean,
      default: false,
    },

    draft: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes
devVaultContentSchema.index({
  status: 1,
  visibility: 1,
  featured: 1,
  ordering: 1,
  createdAt: -1,
});

devVaultContentSchema.index({
  title: "text",
  shortDescription: "text",
  tags: "text",
});

const DevVaultContent = mongoose.model(
  "DevVaultContent",
  devVaultContentSchema
);

export default DevVaultContent;
