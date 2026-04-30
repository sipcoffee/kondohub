import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  CalendarDays,
  Home,
  Clock,
  CreditCard,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function TenantDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "OWNER") redirect("/owner/dashboard");
  const user = session.user;
  const userId = user.id;

  const now = new Date();

  const [allBookings, upcoming, completed, totalSpentAgg, recent] =
    await Promise.all([
      prisma.booking.count({ where: { tenantId: userId } }),
      prisma.booking.count({
        where: {
          tenantId: userId,
          status: { in: ["PENDING", "CONFIRMED"] },
          checkIn: { gte: now },
        },
      }),
      prisma.booking.count({
        where: { tenantId: userId, status: "COMPLETED" },
      }),
      prisma.booking.aggregate({
        where: {
          tenantId: userId,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.booking.findMany({
        where: { tenantId: userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          unit: {
            select: {
              id: true,
              name: true,
              city: true,
              province: true,
              photos: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      }),
    ]);

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="tenant"
        eyebrow="Your stays"
        title={`Welcome back, ${firstName}`}
        highlight={firstName}
        subtitle="Your bookings, recent stays, and what's lined up next — all in one place."
        cta={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/units"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              Browse condos
            </Link>
            <Link
              href="/bookings"
              className="inline-flex items-center text-sm font-semibold text-[#222222] px-5 py-3 rounded-full border border-[#E5E7EB] bg-white hover:border-[#222222] transition-colors"
            >
              My bookings
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          tone="tenant"
          icon={CalendarDays}
          label="Total bookings"
          value={allBookings}
          sub="Every stay you've ever booked"
        />
        <KpiCard
          tone="tenant"
          icon={Clock}
          label="Upcoming"
          value={upcoming}
          sub="Pending + confirmed stays"
        />
        <KpiCard
          tone="tenant"
          icon={Home}
          label="Completed"
          value={completed}
          sub="Past stays you wrapped up"
        />
        <KpiCard
          tone="tenant"
          icon={CreditCard}
          label="Total spent"
          value={formatCurrency(totalSpentAgg._sum.totalPrice ?? 0)}
          sub="Confirmed + completed"
        />
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="On your calendar"
          title="Your latest trips"
          description="Most recent bookings, newest first."
          cta={
            recent.length > 0 ? (
              <Link
                href="/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null
          }
        />

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-4">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#222222]">
              No bookings yet
            </h3>
            <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
              Find your next condo stay — by the night, week, or month.
            </p>
            <Link
              href="/units"
              className="inline-flex items-center gap-2 mt-5 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              Browse condos
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="group block rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
              >
                <div className="relative aspect-[4/3] bg-[#F7F7F7]">
                  {b.unit.photos[0] ? (
                    <Image
                      src={b.unit.photos[0].url}
                      alt={b.unit.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-8 w-8 text-[#9CA3AF]" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3">
                    <StatusBadge status={b.status} />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-[#222222] line-clamp-1">
                    {b.unit.name}
                  </h3>
                  <p className="text-sm text-[#717171] mt-0.5 line-clamp-1">
                    {b.unit.city}, {b.unit.province}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#EBEBEB] flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#717171] font-semibold">
                        Stay
                      </p>
                      <p className="text-sm text-[#222222] mt-0.5">
                        {formatDateShort(b.checkIn)} –{" "}
                        {formatDateShort(b.checkOut)}
                      </p>
                    </div>
                    <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
                      {formatCurrency(b.totalPrice)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
