import mongoose from "mongoose";

const visitorSessionSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const VisitorSession = mongoose.model(
  "VisitorSession",
  visitorSessionSchema
);

export default VisitorSession;
