import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/profile-form";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Wallet, Bell, ShieldCheck } from "lucide-react";

export const metadata = { title: "Owner settings" };

export default async function OwnerSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/owner/settings");

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
        tone="owner"
        eyebrow="Host settings"
        title="Owner account"
        highlight="account"
        subtitle="Profile, payouts, notifications, and verification — everything that powers your hosting."
      />

      <div className="max-w-3xl space-y-6">
        <section className="rounded-2xl border border-[#EBEBEB] bg-white p-6 md:p-7 space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-1.5">
              Public profile
            </p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#222222]">
              How guests see you
            </h2>
            <p className="mt-1 text-sm text-[#717171]">
              This appears on your listings and on every booking confirmation.
            </p>
          </div>
          <ProfileForm user={user} />
        </section>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-1.5">
            Coming soon
          </p>
          <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#222222]">
            Host capabilities
          </h2>
          <p className="mt-1 text-sm text-[#717171]">
            We&apos;re rolling these out as the platform grows.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <PlaceholderTile
            icon={Wallet}
            title="Payouts"
            body="Add a bank account or e-wallet for monthly payouts."
          />
          <PlaceholderTile
            icon={Bell}
            title="Notifications"
            body="Email, SMS, and push alerts for new bookings."
          />
          <PlaceholderTile
            icon={ShieldCheck}
            title="Verification"
            body="Upload IDs to earn the verified host badge."
          />
        </div>
      </div>
    </div>
  );
}

function PlaceholderTile({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-5">
      <div className="h-9 w-9 rounded-xl bg-white border border-[#EBEBEB] text-[#717171] flex items-center justify-center mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-base font-bold text-[#222222]">{title}</p>
      <p className="text-xs text-[#717171] mt-1 leading-relaxed">{body}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-bold">
        Coming soon
      </p>
    </div>
  );
}
