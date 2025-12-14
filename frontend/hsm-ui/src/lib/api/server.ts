import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Server-side fetch with automatic token from cookies
 * Use this in Server Components
 */
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    // Next.js 16 caching options
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: [endpoint], // For on-demand revalidation
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get users (Server Component)
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.role) queryParams.append("role", params.role);

  const query = queryParams.toString();
  const endpoint = `/users${query ? `?${query}` : ""}`;

  return serverFetch(endpoint, {
    next: {
      revalidate: 30, // Revalidate every 30 seconds
      tags: ["users"],
    },
  });
}

/**
 * Get user stats (Server Component)
 */
export async function getUserStats(): Promise<any> {
  return serverFetch("/users/stats", {
    next: {
      revalidate: 60,
      tags: ["user-stats"],
    },
  });
}
