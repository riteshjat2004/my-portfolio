import api from "./axios";
import {
  AnalyticsStats,
  LiveUsersData,
  PageView,
  ProjectClick,
} from "@/types/analytics";

/**
 * Get live online users count
 */
export const getLiveUsers = async (): Promise<LiveUsersData> => {
  const response = await api.get("/analytics/live-users");
  return response.data;
};

/**
 * Send presence heartbeat ping
 */
export const sendHeartbeat = async (visitorId: string) => {
  try {
    await api.post("/analytics/heartbeat", { visitorId });
  } catch {
    // Non-blocking background error
  }
};

/**
 * Send immediate presence leave beacon on tab unload/close
 */
export const sendLeaveBeacon = (visitorId: string) => {
  if (!visitorId || typeof window === "undefined") return;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://portfolio-backend-9y68.onrender.com/api";

  const url = `${apiUrl}/analytics/heartbeat`;
  const payload = JSON.stringify({ visitorId, isLeaving: true });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking silent fallback
  }
};

/**
 * Get analytics statistics
 */
export const getAnalyticsStats =
  async (): Promise<AnalyticsStats> => {
    const response = await api.get(
      "/analytics/stats"
    );
    return response.data;
  };

/**
 * Track a visitor on a specific page
 */
export const trackVisit = async (
  visitorId: string,
  page: string
) => {
  try {
    await api.post("/analytics/visit", {
      visitorId,
      page,
    });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
};

/**
 * Track a resume download
 */
export const trackResumeDownload = async () => {
  try {
    await api.post(
      "/analytics/resume-download",
      {}
    );
  } catch (error) {
    console.error(
      "Failed to track resume download:",
      error
    );
  }
};

/**
 * Track a project click
 */
export const trackProjectClick = async (
  projectId: string
) => {
  try {
    await api.post("/analytics/project-click", {
      projectId,
    });
  } catch (error) {
    console.error(
      "Failed to track project click:",
      error
    );
  }
};

/**
 * Get top pages
 */
export const getTopPages =
  async (): Promise<PageView[]> => {
    const response = await api.get(
      "/analytics/top-pages"
    );
    return response.data;
  };

/**
 * Get top projects
 */
export const getTopProjects =
  async (): Promise<ProjectClick[]> => {
    const response = await api.get(
      "/analytics/top-projects"
    );
    return response.data;
  };
