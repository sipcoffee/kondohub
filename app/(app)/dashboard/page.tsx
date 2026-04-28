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
  CalendarDays,
  Home,
  Clock,
  CreditCard,
  Building2,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function TenantDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
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
        take: 4,
        include: {
          unit: {
            include: {
              photos: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your stays.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={CalendarDays} label="Total bookings" value={allBookings} sub="All time" />
        <Stat icon={Clock} label="Upcoming" value={upcoming} sub="Pending + confirmed" />
        <Stat icon={Home} label="Completed" value={completed} sub="Past stays" />
        <Stat
          icon={CreditCard}
          label="Total spent"
          value={formatCurrency(totalSpentAgg._sum.totalPrice ?? 0)}
          sub="Confirmed + completed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/units">Browse condos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bookings">My bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">Account settings</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent bookings</CardTitle>
          {recent.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No bookings yet.</p>
              <p className="text-sm mt-1">
                Start browsing condos and book your first stay.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/units">Browse condos</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-4 rounded-xl border border-[#EBEBEB] p-3 hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                    {b.unit.photos[0] ? (
                      <Image
                        src={b.unit.photos[0].url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.unit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateShort(b.checkIn)} – {formatDateShort(b.checkOut)}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1.5">
                    <StatusBadge status={b.status} />
                    <span className="text-sm font-semibold">
                      {formatCurrency(b.totalPrice)}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/bookings/${b.id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
