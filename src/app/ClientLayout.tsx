"use client";

import { useEffect } from "react";
import {
  getOrCreateVisitorId,
} from "@/utils/visitorTracking";
import { trackVisit } from "@/api/analyticsApi";
import { usePathname } from "next/navigation";

export default function ClientLayout() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize visitor ID and track visit
    const visitorId =
      getOrCreateVisitorId();

    if (visitorId) {
      // Determine page name from pathname
      let pageName = pathname
        .split("/")
        .filter(Boolean)[0] || "home";

      // Map paths to readable names
      const pageMap: Record<
        string,
        string
      > = {
        "": "home",
        about: "about",
        projects: "projects",
        blogs: "blogs",
        contact: "contact",
        admin: "admin",
      };

      pageName =
        pageMap[pageName] || pageName;

      trackVisit(visitorId, pageName);
    }
  }, [pathname]);

  return null;
}
