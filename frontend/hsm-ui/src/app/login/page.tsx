"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  //TODO: handling error
  //TODO: handling redirect if login was successful
  //TODO: decide whether use this method or form submit method
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userName: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    if (response.status === 200) {
      const data = await response.json();
      router.push("/dashboard");
    } else {
      // showing an error popup
      console.error("there was an error!");
    }
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
