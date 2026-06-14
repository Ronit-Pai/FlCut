import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - FLCut",
  description: "Login to manage your FLCut links.",
};

export default function LoginPage() {
  return <LoginForm />;
}
