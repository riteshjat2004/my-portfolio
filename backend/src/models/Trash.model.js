import mongoose from "mongoose";

const trashSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["project", "blog", "contact"],
    },
    action: {
      type: String,
      required: true,
      enum: ["delete", "edit"],
    },
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trash = mongoose.model("Trash", trashSchema);

export default Trash;
