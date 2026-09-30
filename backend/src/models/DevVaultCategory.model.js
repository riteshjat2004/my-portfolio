import mongoose from "mongoose";

const devVaultCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    icon: {
      type: String,
      default: "",
      trim: true,
    },

    coverImage: {
      type: String,
      default: "",
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    visibility: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
devVaultCategorySchema.index({ visibility: 1, displayOrder: 1, createdAt: -1 });

const DevVaultCategory = mongoose.model(
  "DevVaultCategory",
  devVaultCategorySchema
);

export default DevVaultCategory;
