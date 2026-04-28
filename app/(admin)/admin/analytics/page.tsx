import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Platform health at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          icon={Users}
          label="Total users"
          value={totalUsers.toLocaleString()}
          sub={`${totals.owners} owners · ${totals.tenants} tenants`}
        />
        <KPI
          icon={Building2}
          label="Active units"
          value={totals.activeUnits.toLocaleString()}
          sub={`of ${totals.totalUnits.toLocaleString()} total`}
        />
        <KPI
          icon={CalendarDays}
          label="Bookings (30d)"
          value={last30Bookings.toLocaleString()}
          sub={`${totals.pending} pending · ${totals.confirmed} confirmed`}
        />
        <KPI
          icon={TrendingUp}
          label="Revenue (MTD)"
          value={formatCurrency(monthRev)}
          sub={`${formatCurrency(totalRevenue)} all-time`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top cities by inventory</CardTitle>
            <CardDescription>Where the units are.</CardDescription>
          </CardHeader>
          <CardContent>
            {topCities.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No units yet.
              </p>
            ) : (
              <div className="space-y-3">
                {topCities.map((c) => (
                  <div key={c.city} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.city}
                      </span>
                      <span className="text-muted-foreground">
                        {c._count._all} {c._count._all === 1 ? "unit" : "units"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F4F4F4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] rounded-full"
                        style={{ width: `${(c._count._all / maxCity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking funnel</CardTitle>
            <CardDescription>Status distribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelRow label="Pending" value={totals.pending} />
            <FunnelRow label="Confirmed" value={totals.confirmed} />
            <FunnelRow label="Completed" value={totals.completed} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function FunnelRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
