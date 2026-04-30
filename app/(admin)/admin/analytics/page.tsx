import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Building2,
  CalendarDays,
  Users,
  TrendingUp,
  MapPin,
} from "lucide-react";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [
    userGroups,
    unitGroups,
    bookingGroups,
    revenue,
    monthRevenue,
    last30Bookings,
    topCities,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.unit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count({ where: { createdAt: { gte: last30 } } }),
    prisma.unit.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 6,
    }),
  ]);

  const totals = {
    admins: userGroups.find((u) => u.role === "ADMIN")?._count._all ?? 0,
    owners: userGroups.find((u) => u.role === "OWNER")?._count._all ?? 0,
    tenants: userGroups.find((u) => u.role === "TENANT")?._count._all ?? 0,
    activeUnits:
      unitGroups.find((u) => u.status === "ACTIVE")?._count._all ?? 0,
    totalUnits: unitGroups.reduce((s, g) => s + g._count._all, 0),
    pending: bookingGroups.find((b) => b.status === "PENDING")?._count._all ?? 0,
    confirmed:
      bookingGroups.find((b) => b.status === "CONFIRMED")?._count._all ?? 0,
    completed:
      bookingGroups.find((b) => b.status === "COMPLETED")?._count._all ?? 0,
  };

  const totalUsers = totals.admins + totals.owners + totals.tenants;
  const totalRevenue = revenue._sum.totalPrice ?? 0;
  const monthRev = monthRevenue._sum.totalPrice ?? 0;
  const maxCity = Math.max(...topCities.map((c) => c._count._all), 1);
  const totalFunnel = totals.pending + totals.confirmed + totals.completed || 1;

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Platform pulse"
        title="Analytics"
        highlight="Analytics"
        subtitle="Health of the platform — users, inventory, bookings, and revenue at a glance."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          tone="admin"
          icon={Users}
          label="Total users"
          value={totalUsers.toLocaleString()}
          sub={`${totals.owners} owners · ${totals.tenants} tenants`}
        />
        <KpiCard
          tone="admin"
          icon={Building2}
          label="Active units"
          value={totals.activeUnits.toLocaleString()}
          sub={`of ${totals.totalUnits.toLocaleString()} total`}
        />
        <KpiCard
          tone="admin"
          icon={CalendarDays}
          label="Bookings (30d)"
          value={last30Bookings.toLocaleString()}
          sub={`${totals.pending} pending · ${totals.confirmed} confirmed`}
        />
        <KpiCard
          tone="admin"
          icon={TrendingUp}
          label="Revenue (MTD)"
          value={formatCurrency(monthRev)}
          sub={`${formatCurrency(totalRevenue)} all-time`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-5">
          <SectionHeading
            eyebrow="Inventory map"
            title="Top cities by inventory"
            description="Where the units are concentrated."
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6">
            {topCities.length === 0 ? (
              <p className="text-[#717171] py-8 text-center text-sm">
                No units yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topCities.map((c) => (
                  <div key={c.city} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#222222]">
                        <MapPin className="h-3.5 w-3.5 text-[#717171]" />
                        {c.city}
                      </span>
                      <span className="text-[#717171] tabular-nums">
                        {c._count._all}{" "}
                        {c._count._all === 1 ? "unit" : "units"}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F4F4F4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] rounded-full"
                        style={{
                          width: `${(c._count._all / maxCity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Booking funnel"
            title="Status breakdown"
            description="Across all bookings."
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 space-y-4">
            {[
              {
                label: "Pending",
                value: totals.pending,
                color: "bg-[#FDE8E4]",
              },
              {
                label: "Confirmed",
                value: totals.confirmed,
                color: "bg-[#DFF0EE]",
              },
              {
                label: "Completed",
                value: totals.completed,
                color: "bg-[#222222]",
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#222222]">
                    {row.label}
                  </span>
                  <span className="font-display font-extrabold tabular-nums text-[#222222]">
                    {row.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-[#F4F4F4] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{
                      width: `${(row.value / totalFunnel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
