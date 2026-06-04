import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

/**
 * Hook to protect admin routes - redirects to login if not authenticated
 * Usage: Call this at the top of any admin page component
 */
export const useProtectedRoute = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
};
