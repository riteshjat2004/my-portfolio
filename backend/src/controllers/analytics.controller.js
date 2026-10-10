import jwt from "jsonwebtoken";
import Analytics from "../models/Analytics.model.js";
import VisitorSession from "../models/VisitorSession.model.js";
import { sendError } from "../utils/errorHandler.js";

// In-Memory Live Presence Tracker (45 seconds timeout)
// Key: visitorId -> { lastSeen: timestamp, isAdmin: boolean }
const activePresences = new Map();
const PRESENCE_TTL_MS = 45 * 1000;

// Helper to sweep expired presences and calculate current live stats
const calculateLiveUsers = () => {
  const now = Date.now();
  let totalOnline = 0;
  let visitorsOnline = 0;
  let adminsOnline = 0;

  for (const [id, presence] of activePresences.entries()) {
    if (now - presence.lastSeen > PRESENCE_TTL_MS) {
      activePresences.delete(id);
    } else {
      totalOnline++;
      if (presence.isAdmin) {
        adminsOnline++;
      } else {
        visitorsOnline++;
      }
    }
  }

  return {
    totalOnline,
    visitorsOnline,
    adminsOnline,
    lastUpdated: new Date().toISOString(),
  };
};

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

    const liveUsers = calculateLiveUsers();
    const statsObj = stats.toObject ? stats.toObject() : { ...stats };
    statsObj.liveUsers = liveUsers;

    res.json(statsObj);
  } catch (error) {
    sendError(res, error, "Failed to retrieve analytics stats");
  }
};

export const getLiveUsers = (req, res) => {
  try {
    const liveStats = calculateLiveUsers();
    res.json(liveStats);
  } catch (error) {
    sendError(res, error, "Failed to retrieve live online users");
  }
};

export const trackHeartbeat = (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    if (isBot(userAgent)) {
      return res.json({ success: true, ignored: true });
    }

    const { visitorId, isLeaving } = req.body || {};

    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Valid visitorId is required",
      });
    }

    const sanitizedVisitorId = visitorId.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedVisitorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitorId format",
      });
    }

    // Immediate drop on tab/window unload beacon
    if (isLeaving) {
      activePresences.delete(sanitizedVisitorId);
      return res.json({ success: true, left: true });
    }

    // Determine if session is an authenticated admin/owner
    let isAdmin = Boolean(
      req.cookies?.ownerToken && req.cookies.ownerToken === process.env.OWNER_SECRET
    );

    if (!isAdmin && req.headers.authorization) {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : null;
        if (token && process.env.JWT_SECRET) {
          jwt.verify(token, process.env.JWT_SECRET);
          isAdmin = true;
        }
      } catch {
        isAdmin = false;
      }
    }

    activePresences.set(sanitizedVisitorId, {
      lastSeen: Date.now(),
      isAdmin,
    });

    res.json({ success: true });
  } catch (error) {
    sendError(res, error, "Failed to record heartbeat");
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