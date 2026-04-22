import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
