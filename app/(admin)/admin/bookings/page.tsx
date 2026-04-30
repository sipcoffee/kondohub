import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CalendarDays, Clock, Wallet, ArrowRight } from "lucide-react";

export const metadata = { title: "All bookings" };

export default async function AdminBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      unit: { select: { id: true, name: true, city: true, slug: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  });

  const totalRevenue = bookings
    .filter((b) => ["CONFIRMED", "COMPLETED"].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Activity feed"
        title="All bookings"
        highlight="bookings"
        subtitle="Cross-platform booking activity across every owner and tenant."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          tone="admin"
          icon={CalendarDays}
          label="Total bookings"
          value={bookings.length}
          sub="Most recent 200"
        />
        <KpiCard
          tone="admin"
          icon={Clock}
          label="Pending review"
          value={pendingCount}
          sub="Awaiting owner response"
        />
        <KpiCard
          tone="admin"
          icon={Wallet}
          label="Confirmed value"
          value={formatCurrency(totalRevenue)}
          sub="Confirmed + completed"
        />
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center mb-4">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#222222]">
            No bookings yet
          </h3>
          <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
            Once tenants start booking, activity rolls in here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          <div className="hidden md:grid grid-cols-[100px_1.4fr_1.2fr_1fr_140px_120px_60px] gap-4 px-5 py-3 bg-[#FAFAFA] border-b border-[#EBEBEB] text-[10px] uppercase tracking-wider text-[#717171] font-bold">
            <span>Ref</span>
            <span>Unit</span>
            <span>Guest</span>
            <span>Stay dates</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span></span>
          </div>

          <ul>
            {bookings.map((b) => (
              <li
                key={b.id}
                className="grid grid-cols-1 md:grid-cols-[100px_1.4fr_1.2fr_1fr_140px_120px_60px] gap-4 px-5 py-4 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors items-center"
              >
                <span className="font-mono text-xs text-[#717171] truncate">
                  {b.id.slice(0, 8).toUpperCase()}
                </span>

                <div className="min-w-0">
                  <p className="font-semibold text-[#222222] truncate">
                    {b.unit.name}
                  </p>
                  <p className="text-xs text-[#717171] truncate">
                    {b.unit.city}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] text-xs font-semibold">
                      {b.tenant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-[#222222] text-sm truncate">
                      {b.tenant.name}
                    </p>
                    <p className="text-xs text-[#717171] truncate">
                      {b.tenant.email}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-[#222222]">{formatDateShort(b.checkIn)}</p>
                  <p className="text-xs text-[#717171]">
                    → {formatDateShort(b.checkOut)}
                  </p>
                </div>

                <div>
                  <StatusBadge status={b.status} />
                </div>

                <p className="md:text-right font-display text-sm font-extrabold text-[#222222] tabular-nums">
                  {formatCurrency(b.totalPrice)}
                </p>

                <Link
                  href={`/bookings/${b.id}`}
                  className="md:justify-self-end inline-flex items-center gap-1.5 text-xs font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
                  aria-label="View booking"
                >
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
