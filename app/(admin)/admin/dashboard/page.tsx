import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Users,
  Shield,
  Building2,
  UserRound,
  Trophy,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role === "OWNER") redirect("/owner/dashboard");
  if (role !== "ADMIN") redirect("/dashboard");

  const [
    userGroups,
    unitGroups,
    topTenantsRaw,
    recentUsers,
    recentBookings,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.unit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.groupBy({
      by: ["tenantId"],
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
      _count: { _all: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
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

  const admins = userGroups.find((g) => g.role === "ADMIN")?._count._all ?? 0;
  const owners = userGroups.find((g) => g.role === "OWNER")?._count._all ?? 0;
  const tenants = userGroups.find((g) => g.role === "TENANT")?._count._all ?? 0;
  const totalUsers = admins + owners + tenants;
  const activeUnits =
    unitGroups.find((g) => g.status === "ACTIVE")?._count._all ?? 0;
  const totalUnits = unitGroups.reduce((s, g) => s + g._count._all, 0);

  const topTenantUsers = topTenantsRaw.length
    ? await prisma.user.findMany({
        where: { id: { in: topTenantsRaw.map((t) => t.tenantId) } },
        select: { id: true, name: true, email: true, image: true, role: true },
      })
    : [];
  const userMap = new Map(topTenantUsers.map((u) => [u.id, u]));
  const topTenants = topTenantsRaw
    .map((t) => ({
      user: userMap.get(t.tenantId),
      total: t._sum.totalPrice ?? 0,
      bookings: t._count._all,
    }))
    .filter((t) => t.user);

  const ROLE_BG: Record<string, string> = {
    ADMIN: "bg-[#222222] text-white",
    OWNER: "bg-[#DFF0EE] text-[#1F5E58]",
    TENANT: "bg-[#FDE8E4] text-[#C13947]",
  };

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Platform control"
        title="Admin overview"
        highlight="overview"
        subtitle="Who's on KondoHub, where revenue is coming from, and what's happening this week."
        cta={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-[#3A2520] transition-colors"
            >
              Manage users
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center text-sm font-semibold text-[#222222] px-5 py-3 rounded-full border border-[#E5E7EB] bg-white hover:border-[#222222] transition-colors"
            >
              Analytics
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          tone="admin"
          icon={Users}
          label="Total users"
          value={totalUsers}
          sub="All accounts on the platform"
        />
        <KpiCard
          tone="admin"
          icon={Building2}
          label="Owners"
          value={owners}
          sub={`${activeUnits} active / ${totalUnits} listings`}
        />
        <KpiCard
          tone="admin"
          icon={UserRound}
          label="Tenants"
          value={tenants}
          sub="Booking-side accounts"
        />
        <KpiCard
          tone="admin"
          icon={Shield}
          label="Admins"
          value={admins}
          sub="Platform staff"
        />
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Revenue leaders"
          title="Tenants who book the most"
          description="Lifetime spend across confirmed and completed stays."
          cta={
            <Link
              href="/admin/users?role=TENANT"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
            >
              View all tenants
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {topTenants.length === 0 ? (
          <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-[#FDE8E4] text-[#C13947] flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#222222]">
              No spend recorded yet
            </h3>
            <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
              Once tenants confirm or complete bookings, the leaderboard
              populates automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
            <ol>
              {topTenants.map((t, i) => (
                <li
                  key={t.user!.id}
                  className="flex items-center gap-4 px-5 py-4 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                >
                  <span className="font-display text-2xl font-extrabold text-[#E0484F] tabular-nums w-8 text-center">
                    {i + 1}
                  </span>
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={t.user!.image || undefined} />
                    <AvatarFallback className="bg-[#222222] text-white text-sm font-semibold">
                      {t.user!.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#222222] truncate">
                      {t.user!.name}
                    </p>
                    <p className="text-xs text-[#717171] truncate">
                      {t.user!.email} · {t.bookings}{" "}
                      {t.bookings === 1 ? "booking" : "bookings"}
                    </p>
                  </div>
                  <p className="font-display text-lg font-extrabold text-[#222222] tabular-nums whitespace-nowrap">
                    {formatCurrency(t.total)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-5">
          <SectionHeading
            eyebrow="New on KondoHub"
            title="Recent users"
            cta={
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
              >
                All
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
            {recentUsers.length === 0 ? (
              <p className="text-[#717171] py-10 text-center text-sm">
                No users yet.
              </p>
            ) : (
              <ul>
                {recentUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image || undefined} />
                      <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] font-semibold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#222222] truncate text-sm">
                        {u.name}
                      </p>
                      <p className="text-xs text-[#717171] truncate">
                        {u.email}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${ROLE_BG[u.role as string] ?? "bg-[#F7F7F7] text-[#222222]"}`}
                    >
                      {(u.role as string).toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading
            eyebrow="Latest activity"
            title="Recent bookings"
            cta={
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#E0484F] transition-colors"
              >
                All
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
            {recentBookings.length === 0 ? (
              <p className="text-[#717171] py-10 text-center text-sm">
                No bookings yet.
              </p>
            ) : (
              <ul>
                {recentBookings.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#222222] truncate text-sm">
                        {b.unit.name}
                      </p>
                      <p className="text-xs text-[#717171] truncate">
                        {b.tenant.name} · {formatDateShort(b.createdAt)}
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
