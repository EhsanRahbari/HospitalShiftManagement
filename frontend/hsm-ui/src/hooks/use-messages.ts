"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Message, CreateMessageDto, MessageFilters } from "@/types/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";

  /**
   * Fetch messages based on user role
   * Admin: GET /messages/sent
   * User: GET /messages/received
   */
  const fetchMessages = async (filters?: MessageFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      // Choose endpoint based on role
      const endpoint = isAdmin ? "/messages/sent" : "/messages/received";

      console.log("🔵 Fetching messages from:", `${API_URL}${endpoint}`);
      console.log("🔵 User role:", user?.role);
      console.log("🔵 Token exists:", !!token);

      // Build query params for admin filters
      const queryParams = new URLSearchParams();
      if (isAdmin && filters) {
        if (filters.department)
          queryParams.append("department", filters.department);
        if (filters.section) queryParams.append("section", filters.section);
        if (filters.priority) queryParams.append("priority", filters.priority);
        if (filters.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);
      }

      const url = `${API_URL}${endpoint}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      console.log("🔵 Full URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("🔵 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);

        if (response.status === 404) {
          throw new Error("Messages endpoint not found");
        }
        if (response.status === 401) {
          throw new Error("Unauthorized. Please check your authentication.");
        }
        if (response.status === 403) {
          throw new Error(
            "Forbidden. You don't have permission to access this resource."
          );
        }

        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Messages fetched:", data.length, "messages");

      setMessages(data);
      return data;
    } catch (err: any) {
      console.error("❌ Fetch messages error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create and send a message (Admin only)
   * POST /messages
   */
  const createMessage = async (data: CreateMessageDto) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔵 Creating message:", data);

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("🔵 Create response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create message" }));
        console.error("❌ Create error response:", errorData);

        throw new Error(errorData.message || "Failed to create message");
      }

      const newMessage = await response.json();
      console.log("✅ Message created:", newMessage);

      // Refresh messages list
      await fetchMessages();

      return newMessage;
    } catch (err: any) {
      console.error("❌ Create message error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get message by ID based on role
   * Admin: GET /messages/sent/:id
   * User: GET /messages/received/:id
   */
  const getMessageById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = isAdmin
        ? `/messages/sent/${id}`
        : `/messages/received/${id}`;

      console.log("🔵 Fetching message by ID:", id);
      console.log("🔵 Endpoint:", endpoint);

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error:", errorText);
        throw new Error("Failed to fetch message details");
      }

      const data = await response.json();
      console.log("✅ Message details:", data);

      return data;
    } catch (err: any) {
      console.error("❌ Fetch message by ID error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mark a message as read
   * PATCH /messages/:id/read
   */
  const markAsRead = async (messageId: string) => {
    try {
      console.log("🔵 Marking message as read:", messageId);

      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Mark as read error:", errorText);
        throw new Error("Failed to mark message as read");
      }

      const data = await response.json();
      console.log("✅ Message marked as read:", data);

      return data;
    } catch (err: any) {
      console.error("❌ Mark as read error:", err);
      throw err;
    }
  };

  /**
   * Get user's received messages (for compatibility)
   * Same as fetchMessages() for non-admin users
   */
  const getMyMessages = async () => {
    console.log("🔵 getMyMessages called, redirecting to fetchMessages");
    return fetchMessages();
  };

  /**
   * Get unread message count
   * GET /messages/unread-count
   */
  const getUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();
      return data.count || 0;
    } catch (err: any) {
      console.error("❌ Get unread count error:", err);
      return 0;
    }
  };

  /**
   * Get message statistics (Admin only)
   * GET /messages/stats
   */
  const getStats = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch message stats");
      }

      return await response.json();
    } catch (err: any) {
      console.error("❌ Get stats error:", err);
      return null;
    }
  };

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    createMessage,
    getMessageById,
    markAsRead,
    getMyMessages,
    getUnreadCount,
    getStats,
  };
}
