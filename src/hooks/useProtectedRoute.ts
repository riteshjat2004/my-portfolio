import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

/**
 * Checks if JWT string has a valid structure and is not expired
 */
const isTokenValid = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);
    if (!payload.exp) return false;
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
};

/**
 * Hook to protect admin routes - redirects to login if not authenticated or expired
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token || !isTokenValid(token)) {
      // Invalid or expired token - purge and redirect immediately
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  return isAuthenticated;
};

