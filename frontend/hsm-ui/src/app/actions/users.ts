"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

/**
 * Create user (Server Action)
 */
export async function createUser(data: {
  username: string;
  password: string;
  role: string;
  isActive?: boolean;
}) {
  const token = await getToken();

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create user");
  }

  // Revalidate cache
  revalidateTag("users");
  revalidateTag("user-stats");

  return response.json();
}

/**
 * Update user (Server Action)
 */
export async function updateUser(
  id: string,
  data: {
    username?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  const token = await getToken();

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }

  // Revalidate cache
  revalidateTag("users");
  revalidateTag("user-stats");

  return response.json();
}

/**
 * Delete user (Server Action)
 */
export async function deleteUser(id: string) {
  const token = await getToken();

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }

  // Revalidate cache
  revalidateTag("users");
  revalidateTag("user-stats");

  return response.json();
}
