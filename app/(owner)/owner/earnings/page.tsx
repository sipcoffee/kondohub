import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Wallet, BarChart3, Calendar } from "lucide-react";

export const metadata = { title: "Earnings" };

const MONTHS = 12;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function OwnerEarningsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const since = startOfMonth(new Date());
  since.setMonth(since.getMonth() - (MONTHS - 1));

  const [
    units,
    completedTotal,
    confirmedPending,
    monthRows,
    recent,
  ] = await Promise.all([
    prisma.unit.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
    }),
    prisma.booking.aggregate({
      where: {
        unit: { ownerId: userId },
        status: "COMPLETED",
      },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: {
        unit: { ownerId: userId },
        status: "CONFIRMED",
      },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      where: {
        unit: { ownerId: userId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        totalPrice: true,
        unitId: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        unit: { ownerId: userId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        unit: { select: { name: true } },
        tenant: { select: { name: true } },
      },
    }),
  ]);

  // Build month buckets
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = startOfMonth(new Date());
    d.setMonth(d.getMonth() - i);
    months.push({
      key: monthKey(d),
      label: d.toLocaleString("en-PH", { month: "short" }),
      total: 0,
    });
  }
  for (const r of monthRows) {
    const k = monthKey(r.createdAt);
    const idx = months.findIndex((m) => m.key === k);
    if (idx >= 0) months[idx].total += r.totalPrice;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // Per-unit summary
  const unitTotals = new Map<string, number>();
  for (const r of monthRows) {
    unitTotals.set(r.unitId, (unitTotals.get(r.unitId) ?? 0) + r.totalPrice);
  }
  const unitBreakdown = units
    .map((u) => ({ ...u, total: unitTotals.get(u.id) ?? 0 }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Confirmed and completed bookings across all your units.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPI
          icon={TrendingUp}
          label="All-time payouts"
          value={formatCurrency(completedTotal._sum.totalPrice ?? 0)}
          sub={`${completedTotal._count._all} completed stays`}
        />
        <KPI
          icon={Wallet}
          label="Confirmed (upcoming)"
          value={formatCurrency(confirmedPending._sum.totalPrice ?? 0)}
          sub={`${confirmedPending._count._all} bookings`}
        />
        <KPI
          icon={Calendar}
          label="Last 12 months"
          value={formatCurrency(months.reduce((s, m) => s + m.total, 0))}
          sub="Confirmed + completed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Monthly trend
          </CardTitle>
          <CardDescription>Revenue booked per month, last 12.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2 items-end h-48">
            {months.map((m) => (
              <div
                key={m.key}
                className="flex flex-col items-center justify-end gap-2"
              >
                <div className="text-[10px] font-semibold text-[#222222] leading-none h-3">
                  {m.total > 0 ? formatCurrency(m.total).replace(".00", "") : ""}
                </div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#E0484F] to-[#D5256E]"
                  style={{
                    height: `${m.total === 0 ? 4 : Math.max(8, (m.total / maxMonth) * 130)}px`,
                    opacity: m.total === 0 ? 0.15 : 1,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>By unit</CardTitle>
            <CardDescription>Last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {unitBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6">
                No units yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {unitBreakdown.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/owner/units/${u.id}`}
                      className="hover:text-[#E0484F] transition-colors truncate"
                    >
                      {u.name}
                    </Link>
                    <span className="font-semibold">
                      {formatCurrency(u.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent payouts</CardTitle>
            <CardDescription>Latest confirmed and completed.</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6">No bookings yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-sm">
                        <p className="font-medium truncate">{b.unit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(b.checkIn)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.tenant.name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(b.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
