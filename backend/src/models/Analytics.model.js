import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    totalVisitors: {
      type: Number,
      default: 0,
    },

    uniqueVisitors: {
      type: Number,
      default: 0,
    },

    resumeDownloads: {
      type: Number,
      default: 0,
    },

    contactSubmissions: {
      type: Number,
      default: 0,
    },

    visitorIds: [String],

    dailyVisitors: [
      {
        date: String,
        count: Number,
      },
    ],

    pageViews: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    projectClicks: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Analytics",
  analyticsSchema
);