import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/profile-form";
import { formatDate } from "@/lib/utils";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="tenant"
        eyebrow="Account settings"
        title="Your account"
        highlight="account"
        subtitle="Update your profile, see what's on file, and contact support if anything looks off."
      />

      <div className="max-w-3xl space-y-6">
        <section className="rounded-2xl border border-[#EBEBEB] bg-white p-6 md:p-7 space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-1.5">
              Profile
            </p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#222222]">
              How others see you
            </h2>
            <p className="mt-1 text-sm text-[#717171]">
              This is what hosts see on bookings and what guests see on reviews.
            </p>
          </div>
          <ProfileForm user={user} />
        </section>

        <section className="rounded-2xl border border-[#EBEBEB] bg-white p-6 md:p-7 space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-1.5">
              Account info
            </p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#222222]">
              On file
            </h2>
            <p className="mt-1 text-sm text-[#717171]">
              Read-only details about your account.
            </p>
          </div>
          <div className="space-y-1">
            <Row
              icon={Mail}
              label="Email verification"
              value={
                user.emailVerified ? "Verified" : "Pending — check your inbox"
              }
            />
            <Row
              icon={Lock}
              label="Account type"
              value={(user.role as string).toLowerCase()}
            />
            <Row
              icon={Lock}
              label="Member since"
              value={formatDate(user.createdAt)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#FDD3CB] bg-[#FFF4F0] p-6 md:p-7">
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white text-[#C13947] flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg md:text-xl font-extrabold text-[#222222]">
                Need to delete your account?
              </h2>
              <p className="mt-1.5 text-sm text-[#717171] leading-relaxed">
                Account deletion is handled by support — drop us a line and
                we&apos;ll take care of it within 24 hours.
              </p>
              <Link
                href="mailto:support@kondohub.example"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#C13947] hover:underline"
              >
                Email support@kondohub.example
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#EBEBEB] py-3 last:border-0">
      <span className="inline-flex items-center gap-2 text-[#717171] text-sm">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-[#222222] capitalize text-sm">
        {value}
      </span>
    </div>
  );
}
