"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/utils/visitorTracking";
import { trackVisit, sendHeartbeat, sendLeaveBeacon } from "@/api/analyticsApi";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Silent Background Backend Warmup (Render Free-Tier Spin-Up Eliminator)
  useEffect(() => {
    // Fire only once per browser session
    const hasWarmedUp = sessionStorage.getItem("backend_warmed_up");
    if (!hasWarmedUp) {
      sessionStorage.setItem("backend_warmed_up", "true");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://portfolio-backend-9y68.onrender.com/api";

      // Fire-and-forget: wake up Render container and pre-populate DevVault in-memory cache
      fetch(`${apiUrl}/health`, { method: "GET" }).catch(() => {});
      fetch(`${apiUrl}/devvault/home-feed`, { method: "GET" }).catch(() => {});
    }
  }, []);

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

  // Live Presence Heartbeat & Leave Beacon
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    // Send immediate heartbeat on mount
    sendHeartbeat(visitorId);

    // Periodic heartbeat every 25 seconds
    const interval = setInterval(() => {
      sendHeartbeat(visitorId);
    }, 25000);

    // Refresh immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat(visitorId);
      }
    };

    // Send instant leave beacon when tab is closed or navigated away
    const handleUnload = () => {
      sendLeaveBeacon(visitorId);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

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
