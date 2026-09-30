import mongoose from "mongoose";

const devVaultBrainTreasureSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: [true, "Question number is required"],
      min: [1, "Question number must be at least 1"],
    },

    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [1500, "Question cannot exceed 1500 characters"],
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },

    technicalBackground: {
      type: String,
      required: [true, "Technical background is required"],
      trim: true,
      maxlength: [100, "Technical background cannot exceed 100 characters"],
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
      index: true,
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

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and query indexes
devVaultBrainTreasureSchema.index({
  status: 1,
  visibility: 1,
  displayOrder: 1,
  createdAt: -1,
});
devVaultBrainTreasureSchema.index({ technicalBackground: 1 });
devVaultBrainTreasureSchema.index({ difficulty: 1 });
devVaultBrainTreasureSchema.index({ questionNumber: 1 });

const DevVaultBrainTreasure = mongoose.model(
  "DevVaultBrainTreasure",
  devVaultBrainTreasureSchema
);

export default DevVaultBrainTreasure;
