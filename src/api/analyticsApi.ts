import api from "./axios";
import {
  AnalyticsStats,
  PageView,
  ProjectClick,
} from "@/types/analytics";

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
