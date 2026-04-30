import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  Settings as SettingsIcon,
  Mail,
  Shield,
  Database,
  ExternalLink,
} from "lucide-react";

export const metadata = { title: "Platform settings" };

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const settings = [
    {
      icon: SettingsIcon,
      title: "Service fees",
      description:
        "Set the platform service fee taken from each booking. Currently 0%.",
    },
    {
      icon: Mail,
      title: "Email & notifications",
      description:
        "Connect a transactional email provider (Resend, SES) to power booking and review notifications.",
    },
    {
      icon: Shield,
      title: "Identity verification",
      description:
        "Require government ID upload for owners before going active.",
    },
    {
      icon: Database,
      title: "Data export",
      description:
        "Download CSVs of users, units, and bookings for compliance and reporting.",
    },
  ];

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Platform configuration"
        title="Settings"
        highlight="Settings"
        subtitle="Configure how the platform behaves. Each card maps to a capability we'll wire up as the product matures."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-[#EBEBEB] bg-white p-6 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
            >
              <div className="h-10 w-10 rounded-xl bg-[#222222] text-white flex items-center justify-center mb-4">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-extrabold text-[#222222]">
                {s.title}
              </h2>
              <p className="mt-1.5 text-sm text-[#717171] leading-relaxed">
                {s.description}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-bold">
                Coming soon
              </span>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#EBEBEB] bg-[#FAFAFA] p-6 md:p-7">
        <div className="flex gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-[#EBEBEB] text-[#222222] flex items-center justify-center">
            <ExternalLink className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-lg md:text-xl font-extrabold text-[#222222]">
              Heads-up
            </h2>
            <p className="mt-1.5 text-sm text-[#717171] leading-relaxed">
              None of these settings are wired yet — they&apos;re placeholders
              for the next milestone. See PLAN.md for the roadmap.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
