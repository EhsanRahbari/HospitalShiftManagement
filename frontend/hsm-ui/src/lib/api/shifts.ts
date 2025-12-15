import { Shift, ShiftStats } from "@/types/shift";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getMyShifts(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<Shift[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const url = `${API_URL}/shifts/my-shifts${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }

  return response.json();
}

export async function getShiftStats(token: string): Promise<ShiftStats> {
  const response = await fetch(`${API_URL}/shifts/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shift stats");
  }

  return response.json();
}

export async function getAllShifts(
  token: string,
  params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.append("userId", params.userId);
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const url = `${API_URL}/shifts${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }

  return response.json();
}
