import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Building2,
  CalendarDays,
  TrendingUp,
  Clock,
  ArrowRight,
  LineChart,
} from "lucide-react";

export const metadata = { title: "Owner Dashboard" };

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role !== "OWNER") redirect("/dashboard");
  const user = session.user;
  const userId = user.id;

  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = today.getUTCMonth();
  const startOfMonth = new Date(Date.UTC(yyyy, mm, 1));
  const startOfNextMonth = new Date(Date.UTC(yyyy, mm + 1, 1));
  const startOfYear = new Date(Date.UTC(yyyy, 0, 1));
  const startOfNextYear = new Date(Date.UTC(yyyy + 1, 0, 1));
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const [
    unitGroups,
    totalBookings,
    pendingCount,
    mtdSales,
    ytdSales,
    currentBookings,
  ] = await Promise.all([
    prisma.unit.groupBy({
      by: ["status"],
      where: { ownerId: userId },
      _count: { _all: true },
    }),
    prisma.booking.count({ where: { unit: { ownerId: userId } } }),
    prisma.booking.count({
      where: { unit: { ownerId: userId }, status: "PENDING" },
    }),
    prisma.salesEntry.aggregate({
      where: {
        unit: { ownerId: userId },
        date: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { revenue: true },
    }),
    prisma.salesEntry.aggregate({
      where: {
        unit: { ownerId: userId },
        date: { gte: startOfYear, lt: startOfNextYear },
      },
      _sum: { revenue: true },
    }),
    prisma.booking.findMany({
      where: {
        unit: { ownerId: userId },
        status: { in: ["PENDING", "CONFIRMED"] },
        checkOut: { gte: startOfDay },
      },
      orderBy: { checkIn: "asc" },
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
        tenant: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
  ]);

  const totalUnits = unitGroups.reduce((s, g) => s + g._count._all, 0);
  const activeUnits =
    unitGroups.find((g) => g.status === "ACTIVE")?._count._all ?? 0;

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="owner"
        eyebrow="Owner panel"
        title={user.name || "Welcome"}
        highlight={user.name?.split(" ")[0]}
        subtitle="Today's bookings, this month's pacing, this year's totals — for the condos under your care."
        cta={
          <Link
            href="/owner/sales"
            className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-[#1F5E58] transition-colors"
          >
            <LineChart className="h-4 w-4" strokeWidth={2.5} />
            View sales tracker
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          tone="owner"
          icon={Building2}
          label="Total units"
          value={totalUnits}
          sub={`${activeUnits} active`}
        />
        <KpiCard
          tone="owner"
          icon={CalendarDays}
          label="Total bookings"
          value={totalBookings}
          sub="All time"
        />
        <KpiCard
          tone="owner"
          icon={Clock}
          label="Pending"
          value={pendingCount}
          sub="Awaiting your response"
        />
        <KpiCard
          tone="owner"
          icon={TrendingUp}
          label="MTD sales"
          value={formatCurrency(mtdSales._sum.revenue ?? 0)}
          sub="Logged this month"
        />
        <KpiCard
          tone="owner"
          icon={TrendingUp}
          label="YTD sales"
          value={formatCurrency(ytdSales._sum.revenue ?? 0)}
          sub={`${yyyy} year-to-date`}
        />
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Today's operations"
          title="Bookings to manage"
          description="Upcoming and in-progress stays across all your units."
          cta={
            <Link
              href="/owner/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {currentBookings.length === 0 ? (
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-[#DFF0EE] text-[#1F5E58] flex items-center justify-center mb-4">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#222222]">
              No current bookings
            </h3>
            <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
              New requests and confirmed stays will appear here as they come in.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentBookings.map((b) => {
              const inProgress =
                b.checkIn <= today &&
                b.checkOut >= today &&
                b.status === "CONFIRMED";
              return (
                <div
                  key={b.id}
                  className="group flex flex-col rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
                >
                  <div className="relative aspect-[16/9] bg-[#F7F7F7]">
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
                    <div className="absolute top-3 right-3 flex gap-2">
                      {inProgress && (
                        <Badge className="bg-[#1F5E58] text-white border-transparent">
                          In progress
                        </Badge>
                      )}
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <div className="flex-1 p-5 flex flex-col gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#222222] line-clamp-1">
                        {b.unit.name}
                      </h3>
                      <p className="text-xs text-[#717171] mt-0.5 line-clamp-1">
                        {b.unit.city}, {b.unit.province}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#FAFAFA] px-3 py-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={b.tenant.image || undefined} />
                        <AvatarFallback className="bg-[#222222] text-white text-[10px] font-semibold">
                          {b.tenant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#222222] truncate">
                          {b.tenant.name}
                        </p>
                        <p className="text-[11px] text-[#717171] truncate">
                          {b.tenant.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#717171] font-semibold">
                          Stay
                        </p>
                        <p className="text-sm text-[#222222] mt-0.5">
                          {formatDateShort(b.checkIn)} →{" "}
                          {formatDateShort(b.checkOut)}
                        </p>
                      </div>
                      <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums">
                        {formatCurrency(b.totalPrice)}
                      </p>
                    </div>
                    <Link
                      href={`/bookings/${b.id}`}
                      className="inline-flex items-center justify-center gap-2 mt-1 bg-[#222222] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#1F5E58] transition-colors"
                    >
                      {b.status === "PENDING" ? "Review request" : "Manage stay"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
