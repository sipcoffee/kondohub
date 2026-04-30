"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Building2, User, ArrowRight, Check } from "lucide-react";

export function SignupForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TENANT" as "TENANT" | "OWNER",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
        return;
      }

      toast.success("Account created!");

      if (formData.role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const RoleCard = ({
    value,
    icon: Icon,
    title,
    body,
  }: {
    value: "TENANT" | "OWNER";
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
  }) => {
    const active = formData.role === value;
    return (
      <button
        type="button"
        onClick={() => setFormData({ ...formData, role: value })}
        className={`relative text-left p-4 rounded-2xl border transition-all ${
          active
            ? "border-[#222222] bg-white shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
            : "border-[#EBEBEB] bg-white hover:border-[#222222]"
        }`}
      >
        {active && (
          <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#222222] text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${
            active
              ? "bg-gradient-to-br from-[#E0484F] to-[#D5256E] text-white"
              : "bg-[#FDE8E4] text-[#C13947]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-display text-base font-bold text-[#222222]">
          {title}
        </p>
        <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">{body}</p>
      </button>
    );
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-3">
        Join KondoHub
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#222222]">
        Create your account
      </h1>
      <p className="mt-3 text-[#717171]">
        Already a member?{" "}
        <Link
          href="/login"
          className="text-[#222222] font-semibold underline decoration-[#FDD3CB] decoration-[3px] underline-offset-4 hover:decoration-[#E0484F] transition-colors"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#222222] mb-3">
            I&apos;m signing up as a…
          </p>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              value="TENANT"
              icon={User}
              title="Tenant"
              body="Looking for a place to stay"
            />
            <RoleCard
              value="OWNER"
              icon={Building2}
              title="Owner"
              body="Listing my condo unit"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Cruz"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
            >
              Phone <span className="text-[#9CA3AF] normal-case">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+63 912 345 6789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isLoading}
              className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
            />
          </div>
        </div>

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
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
            >
              Confirm
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4"
            />
          </div>
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
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-xs text-[#9CA3AF] text-center">
        By creating an account you agree to our{" "}
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
