import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

/**
 * Hook to protect admin routes - redirects to login if not authenticated
 * Returns boolean - true if authenticated, false while checking or if no token
 * Usage: const isAuthenticated = useProtectedRoute();
 *        if (!isAuthenticated) return null; // Prevents FOPC
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      // No token - redirect immediately without rendering
      router.replace("/admin/login");
      return;
    }

    // Token exists - mark as authenticated
    setIsAuthenticated(true);
  }, [router]);

  return isAuthenticated;
};
