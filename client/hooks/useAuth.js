"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "../store/authStore";

export default function useAuth(requireAuth = true) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user && pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      } else if (!requireAuth && user && (pathname === "/login" || pathname === "/register")) {
        router.push("/chat");
      }
    }
  }, [user, loading, requireAuth, pathname, router]);

  return { user, loading };
}
