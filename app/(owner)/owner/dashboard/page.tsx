import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Building2,
  CalendarDays,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Owner Dashboard" };

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const user = session.user;
  const userId = user.id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    unitGroups,
    totalBookings,
    pendingCount,
    earningsAgg,
    recentRequests,
    myUnits,
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
    prisma.booking.aggregate({
      where: {
        unit: { ownerId: userId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    prisma.booking.findMany({
      where: { unit: { ownerId: userId }, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        unit: { select: { name: true } },
        tenant: { select: { name: true, email: true } },
      },
    }),
    prisma.unit.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        photos: { where: { isPrimary: true }, take: 1 },
        _count: { select: { bookings: true } },
      },
    }),
  ]);

  const totalUnits = unitGroups.reduce((s, g) => s + g._count._all, 0);
  const activeUnits =
    unitGroups.find((g) => g.status === "ACTIVE")?._count._all ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Owner dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your units and bookings.
          </p>
        </div>
        <Button asChild>
          <Link href="/owner/units/new">
            <Plus className="mr-2 h-4 w-4" />
            Add new unit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={Building2}
          label="Total units"
          value={totalUnits}
          sub={`${activeUnits} active`}
        />
        <Stat
          icon={CalendarDays}
          label="Total bookings"
          value={totalBookings}
          sub="All time"
        />
        <Stat
          icon={Clock}
          label="Pending requests"
          value={pendingCount}
          sub="Awaiting your response"
        />
        <Stat
          icon={TrendingUp}
          label="Earnings (MTD)"
          value={formatCurrency(earningsAgg._sum.totalPrice ?? 0)}
          sub="Confirmed + completed"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My units</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/owner/units">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myUnits.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No units yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/owner/units/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first unit
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {myUnits.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-4 rounded-xl border border-[#EBEBEB] p-3"
                  >
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                      {u.photos[0] ? (
                        <Image
                          src={u.photos[0].url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {u._count.bookings} bookings
                      </p>
                    </div>
                    <StatusBadge status={u.status} />
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/owner/units/${u.id}`}>Edit</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/owner/bookings">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No pending requests.</p>
                <p className="text-sm mt-1">
                  Requests from guests show up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentRequests.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl border border-[#EBEBEB] p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{b.unit.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.tenant.name} · {formatDateShort(b.checkIn)} →{" "}
                        {formatDateShort(b.checkOut)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatCurrency(b.totalPrice)}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/bookings/${b.id}`}>Review</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
