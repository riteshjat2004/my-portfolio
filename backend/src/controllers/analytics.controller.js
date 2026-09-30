import Analytics from "../models/Analytics.model.js";
import VisitorSession from "../models/VisitorSession.model.js";
import { sendError } from "../utils/errorHandler.js";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Check if request originates from automated crawlers, scrapers, or monitors
const isBot = (userAgent = "") => {
  const bots = [
    "bot",
    "spider",
    "crawl",
    "slurp",
    "facebookexternalhit",
    "whatsapp",
    "telegram",
    "twitterbot",
    "pinterest",
    "linkedinbot",
    "curl",
    "wget",
    "python",
    "postman",
    "headless",
    "uptime",
    "render",
  ];
  const ua = userAgent.toLowerCase();
  return bots.some((b) => ua.includes(b));
};

export const getStats = async (req, res) => {
  try {
    let stats = await Analytics.findOne().select("-__v");

    if (!stats) {
      stats = await Analytics.create({});
    }

    res.json(stats);
  } catch (error) {
    sendError(res, error, "Failed to retrieve analytics stats");
  }
};

export const trackVisitor = async (req, res) => {
  try {
    // Skip tracking if request is from a known bot/crawler
    const userAgent = req.headers["user-agent"] || "";
    if (isBot(userAgent)) {
      return res.json({ success: true, ignored: true });
    }

    // Skip tracking if owner cookie is present and valid
    if (req.cookies?.ownerToken && req.cookies.ownerToken === process.env.OWNER_SECRET) {
      return res.json({ success: true, ignored: true });
    }

    const { visitorId, page } = req.body;

    // Validate visitorId
    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Valid visitorId is required",
      });
    }

    // Sanitize visitorId and page name
    const sanitizedVisitorId = visitorId.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedVisitorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitorId format",
      });
    }

    // Determine if visitor is unique via dedicated VisitorSession collection
    const existingSession = await VisitorSession.findOneAndUpdate(
      { visitorId: sanitizedVisitorId },
      { $setOnInsert: { visitorId: sanitizedVisitorId } },
      { upsert: true, new: false }
    );
    const isNewUnique = !existingSession;

    const today = getTodayDate();
    const safePage = typeof page === "string"
      ? page.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50)
      : null;

    // Build atomic update operations
    const incOperations = {
      totalVisitors: 1,
      ...(isNewUnique ? { uniqueVisitors: 1 } : {}),
      ...(safePage ? { [`pageViews.${safePage}`]: 1 } : {}),
    };

    // Atomic update of daily visitors and global counters
    const updated = await Analytics.findOneAndUpdate(
      { "dailyVisitors.date": today },
      {
        $inc: {
          ...incOperations,
          "dailyVisitors.$.count": 1,
        },
      },
      { new: true }
    );

    // If today's date entry doesn't exist yet, push new date atomically
    if (!updated) {
      await Analytics.findOneAndUpdate(
        {},
        {
          $inc: incOperations,
          $push: {
            dailyVisitors: {
              date: today,
              count: 1,
            },
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
    });
  } catch (error) {
    sendError(res, error, "Failed to record visitor");
  }
};

export const trackResumeDownload = async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    if (isBot(userAgent)) {
      return res.json({ success: true, ignored: true });
    }

    // Skip tracking if owner cookie is valid
    if (req.cookies?.ownerToken && req.cookies.ownerToken === process.env.OWNER_SECRET) {
      return res.json({
        success: true,
        ignored: true,
      });
    }

    await Analytics.findOneAndUpdate(
      {},
      { $inc: { resumeDownloads: 1 } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    sendError(res, error, "Failed to record resume download");
  }
};

export const trackProjectClick = async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    if (isBot(userAgent)) {
      return res.json({ success: true, ignored: true });
    }

    // Skip tracking if owner cookie is valid
    if (req.cookies?.ownerToken && req.cookies.ownerToken === process.env.OWNER_SECRET) {
      return res.json({
        success: true,
        ignored: true,
      });
    }

    const { projectId } = req.body;

    if (!projectId || typeof projectId !== "string" || projectId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Valid projectId is required",
      });
    }

    const safeProjectId = projectId.replace(/[^a-zA-Z0-9_-]/g, "");

    await Analytics.findOneAndUpdate(
      {},
      { $inc: { [`projectClicks.${safeProjectId}`]: 1 } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    sendError(res, error, "Failed to record project click");
  }
};

export const getTopPages = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    const topPages = Array.from(stats.pageViews?.entries?.() || [])
      .map(([page, views]) => ({
        page,
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    res.json(topPages);
  } catch (error) {
    sendError(res, error, "Failed to retrieve top pages");
  }
};

export const getTopProjects = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    const topProjects = Array.from(stats.projectClicks?.entries?.() || [])
      .map(([projectId, clicks]) => ({
        projectId,
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    res.json(topProjects);
  } catch (error) {
    sendError(res, error, "Failed to retrieve top projects");
  }
};