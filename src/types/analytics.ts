export interface DailyVisitor {
  date: string;
  count: number;
}

export interface PageView {
  page: string;
  views: number;
}

export interface ProjectClick {
  projectId: string;
  clicks: number;
}

export interface AnalyticsStats {
  _id: string;
  totalVisitors: number;
  uniqueVisitors: number;
  resumeDownloads: number;
  contactSubmissions: number;
  visitorIds: string[];
  dailyVisitors: DailyVisitor[];
  pageViews: Record<string, number>;
  projectClicks: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}
