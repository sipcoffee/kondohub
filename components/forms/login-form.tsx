"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        toast.error(result.error.message || "Invalid credentials");
        return;
      }
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-3">
        Welcome back
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222]">
        Sign in to KondoHub
      </h1>
      <p className="mt-3 text-[#717171]">
        New here?{" "}
        <Link
          href="/signup"
          className="text-[#222222] font-semibold underline decoration-[#FDD3CB] decoration-[3px] underline-offset-4 hover:decoration-[#E0484F] transition-colors"
        >
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#717171] hover:text-[#E0484F] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-xs text-[#9CA3AF] text-center">
        By signing in you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[#222222]">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="underline hover:text-[#222222]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
