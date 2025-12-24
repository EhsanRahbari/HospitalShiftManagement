"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();

  const fetchUnreadCount = async () => {
    // Only fetch for non-admin users
    if (!token || !user || user.role === "ADMIN") {
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📬 Unread count:", data.count);
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [token, user]);

  return {
    unreadCount,
    isLoading,
    refetch: fetchUnreadCount,
  };
}
