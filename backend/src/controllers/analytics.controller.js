import Analytics from "../models/Analytics.model.js";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const getStats = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const trackVisitor = async (req, res) => {
  try {
    const { visitorId, page } = req.body;

    if (!visitorId) {
      return res.status(400).json({
        message: "visitorId is required",
      });
    }

    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    // Always increment total visitors
    stats.totalVisitors += 1;

    // Check if this is a new unique visitor
    if (!stats.visitorIds.includes(visitorId)) {
      stats.visitorIds.push(visitorId);
      stats.uniqueVisitors = stats.visitorIds.length;
    }

    // Track page views
    if (page) {
      stats.pageViews.set(
        page,
        (stats.pageViews.get(page) || 0) + 1
      );
    }

    // Update daily visitors
    const today = getTodayDate();
    const dailyEntry = stats.dailyVisitors.find(
      (entry) => entry.date === today
    );

    if (dailyEntry) {
      dailyEntry.count += 1;
    } else {
      stats.dailyVisitors.push({
        date: today,
        count: 1,
      });
    }

    await stats.save();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const trackResumeDownload = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    stats.resumeDownloads += 1;

    await stats.save();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const trackProjectClick = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        message: "projectId is required",
      });
    }

    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    stats.projectClicks.set(
      projectId,
      (stats.projectClicks.get(projectId) || 0) + 1
    );

    await stats.save();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTopPages = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    // Convert Map to array and sort by count
    const topPages = Array.from(
      stats.pageViews.entries()
    )
      .map(([page, views]) => ({
        page,
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    res.json(topPages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTopProjects = async (req, res) => {
  try {
    let stats = await Analytics.findOne();

    if (!stats) {
      stats = await Analytics.create({});
    }

    // Convert Map to array and sort by count
    const topProjects = Array.from(
      stats.projectClicks.entries()
    )
      .map(([projectId, clicks]) => ({
        projectId,
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    res.json(topProjects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};