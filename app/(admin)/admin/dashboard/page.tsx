import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Building2,
  CalendarDays,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    userGroups,
    unitGroups,
    monthBookings,
    monthRevenueAgg,
    recentUsers,
    recentBookings,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.unit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        unit: { select: { name: true } },
        tenant: { select: { name: true } },
      },
    }),
  ]);

  const totalUsers = userGroups.reduce((s, g) => s + g._count._all, 0);
  const owners = userGroups.find((g) => g.role === "OWNER")?._count._all ?? 0;
  const tenants = userGroups.find((g) => g.role === "TENANT")?._count._all ?? 0;
  const totalUnits = unitGroups.reduce((s, g) => s + g._count._all, 0);
  const activeUnits =
    unitGroups.find((g) => g.status === "ACTIVE")?._count._all ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={Users}
          label="Total users"
          value={totalUsers}
          sub={`${owners} owners · ${tenants} tenants`}
        />
        <Stat
          icon={Building2}
          label="Total units"
          value={totalUnits}
          sub={`${activeUnits} active`}
        />
        <Stat
          icon={CalendarDays}
          label="Bookings (MTD)"
          value={monthBookings}
          sub="This month"
        />
        <Stat
          icon={TrendingUp}
          label="Revenue (MTD)"
          value={formatCurrency(monthRevenueAgg._sum.totalPrice ?? 0)}
          sub="Confirmed + completed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/users">Manage users</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/units">All units</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/bookings">All bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No users yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border border-[#EBEBEB] p-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image || undefined} />
                      <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] font-semibold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {(u.role as string).toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/bookings">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No bookings yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentBookings.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl border border-[#EBEBEB] p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {b.unit.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.tenant.name} · {formatDateShort(b.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatCurrency(b.totalPrice)}
                    </span>
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
