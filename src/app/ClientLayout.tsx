"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/utils/visitorTracking";
import { trackVisit } from "@/api/analyticsApi";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Visitor Tracking
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    if (visitorId) {
      let pageName = pathname.split("/").filter(Boolean)[0] || "home";

      const pageMap: Record<string, string> = {
        "": "home",
        about: "about",
        projects: "projects",
        blogs: "blogs",
        contact: "contact",
        admin: "admin",
      };

      pageName = pageMap[pageName] || pageName;
      trackVisit(visitorId, pageName);
    }
  }, [pathname]);

  // Global Owner Shortcut: Ctrl + Shift + A / Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "A" || e.key === "a")
      ) {
        e.preventDefault();
        router.push("/admin/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
