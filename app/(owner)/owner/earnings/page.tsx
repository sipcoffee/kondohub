import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendingUp, Wallet, Calendar, ArrowRight } from "lucide-react";

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

  const [units, completedTotal, confirmedPending, monthRows, recent] =
    await Promise.all([
      prisma.unit.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true },
      }),
      prisma.booking.aggregate({
        where: { unit: { ownerId: userId }, status: "COMPLETED" },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      prisma.booking.aggregate({
        where: { unit: { ownerId: userId }, status: "CONFIRMED" },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      prisma.booking.findMany({
        where: {
          unit: { ownerId: userId },
          status: { in: ["CONFIRMED", "COMPLETED"] },
          createdAt: { gte: since },
        },
        select: { createdAt: true, totalPrice: true, unitId: true },
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

  const unitTotals = new Map<string, number>();
  for (const r of monthRows) {
    unitTotals.set(r.unitId, (unitTotals.get(r.unitId) ?? 0) + r.totalPrice);
  }
  const unitBreakdown = units
    .map((u) => ({ ...u, total: unitTotals.get(u.id) ?? 0 }))
    .sort((a, b) => b.total - a.total);
  const maxUnit = Math.max(1, ...unitBreakdown.map((u) => u.total));
  const trailing12Total = months.reduce((s, m) => s + m.total, 0);

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="owner"
        eyebrow="Earnings"
        title="Your payouts"
        highlight="payouts"
        subtitle="Confirmed and completed bookings across every unit you host."
        cta={
          <Link
            href="/owner/sales"
            className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-[#1F5E58] transition-colors"
          >
            <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
            View sales tracker
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          tone="owner"
          icon={TrendingUp}
          label="All-time payouts"
          value={formatCurrency(completedTotal._sum.totalPrice ?? 0)}
          sub={`${completedTotal._count._all} completed stays`}
        />
        <KpiCard
          tone="owner"
          icon={Wallet}
          label="Confirmed (upcoming)"
          value={formatCurrency(confirmedPending._sum.totalPrice ?? 0)}
          sub={`${confirmedPending._count._all} bookings`}
        />
        <KpiCard
          tone="owner"
          icon={Calendar}
          label="Last 12 months"
          value={formatCurrency(trailing12Total)}
          sub="Confirmed + completed"
        />
      </div>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Trend"
          title="Monthly revenue"
          description="Booked revenue per month, last 12 months."
        />
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-4 sm:p-6 md:p-8">
          <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
            <div className="grid grid-cols-12 gap-2 items-end h-56 min-w-[560px]">
              {months.map((m) => (
                <div
                  key={m.key}
                  className="flex flex-col items-center justify-end gap-2"
                >
                  <div className="text-[10px] font-semibold text-[#222222] tabular-nums leading-none h-3">
                    {m.total > 0
                      ? formatCurrency(m.total).replace(".00", "")
                      : ""}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#E0484F] to-[#D5256E]"
                    style={{
                      height: `${m.total === 0 ? 4 : Math.max(8, (m.total / maxMonth) * 160)}px`,
                      opacity: m.total === 0 ? 0.15 : 1,
                    }}
                  />
                  <span className="text-[10px] text-[#717171] uppercase tracking-wider font-semibold">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-5">
          <SectionHeading
            eyebrow="Per unit"
            title="Earnings by listing"
            description="Last 12 months · click to edit."
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6">
            {unitBreakdown.length === 0 ? (
              <p className="text-sm text-[#717171] py-6 text-center">
                No units yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {unitBreakdown.map((u) => (
                  <li key={u.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm gap-3">
                      <Link
                        href={`/owner/units/${u.id}`}
                        className="font-medium text-[#222222] hover:text-[#E0484F] transition-colors truncate"
                      >
                        {u.name}
                      </Link>
                      <span className="font-display font-extrabold tabular-nums text-[#222222] whitespace-nowrap">
                        {formatCurrency(u.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F4F4F4] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E0484F] to-[#D5256E]"
                        style={{
                          width: `${u.total === 0 ? 0 : Math.max(2, (u.total / maxUnit) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Latest payouts"
            title="Recent bookings"
            description="Most recent confirmed and completed stays."
            cta={
              <Link
                href="/owner/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
              >
                All
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
            {recent.length === 0 ? (
              <p className="text-sm text-[#717171] py-10 text-center">
                No bookings yet.
              </p>
            ) : (
              <ul>
                {recent.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#222222] text-sm truncate">
                        {b.unit.name}
                      </p>
                      <p className="text-xs text-[#717171] truncate">
                        {b.tenant.name} · {formatDateShort(b.checkIn)}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                    <span className="font-display text-sm font-extrabold tabular-nums text-[#222222] whitespace-nowrap">
                      {formatCurrency(b.totalPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
