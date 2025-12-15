"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("🔑 Attempting login with:", values.username);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid credentials");
      }

      const data = await response.json();
      console.log("✅ Login response received:", {
        username: data.user?.username,
        role: data.user?.role,
        hasToken: !!data.access_token,
      });

      // Validate response
      if (!data.access_token) {
        throw new Error("No access token received from server");
      }

      if (!data.user) {
        throw new Error("No user data received from server");
      }

      if (!data.user.role) {
        throw new Error("User role not received from server");
      }

      // Store auth
      setAuth(data.user, data.access_token);

      toast.success(`Welcome back, ${data.user.username}!`);

      // Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Verify auth was stored
      const authState = useAuthStore.getState();
      console.log("🔍 Auth state after login:", {
        hasUser: !!authState.user,
        username: authState.user?.username,
        role: authState.user?.role,
        hasToken: !!authState.token,
        isAuthenticated: authState.isAuthenticated,
      });

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        console.log("🔄 Redirecting admin to /dashboard/admin");
        window.location.href = "/dashboard/admin";
      } else {
        console.log("🔄 Redirecting user to /dashboard");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast.error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials:</p>
          <p className="mt-1">
            <strong>Admin:</strong> admin / admin123
          </p>
          <p>
            <strong>Doctor:</strong> doctor1 / doctor123
          </p>
          <p>
            <strong>Nurse:</strong> nurse1 / nurse123
          </p>
        </div>
      </form>
    </Form>
  );
}
