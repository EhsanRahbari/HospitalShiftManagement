"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";

export function AuthDebug() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">Auth Debug:</div>
      <div>Mounted: {mounted ? "✅" : "❌"}</div>
      <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
      <div>Has User: {user ? "✅" : "❌"}</div>
      <div>Has Token: {token ? "✅" : "❌"}</div>
      <div>Role: {user?.role || "N/A"}</div>
      <div>Username: {user?.username || "N/A"}</div>
    </div>
  );
}
