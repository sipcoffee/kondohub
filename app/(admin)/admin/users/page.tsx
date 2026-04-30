import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRoleSelect } from "./role-select";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Users, ShieldCheck, Building2, Home } from "lucide-react";

export const metadata = { title: "Users" };

type SearchParams = Promise<{ role?: string; search?: string }>;

const ROLE_TONES: Record<
  "ADMIN" | "OWNER" | "TENANT",
  { bubble: string; pill: string }
> = {
  ADMIN: {
    bubble: "bg-[#222222] text-white",
    pill: "bg-[#222222] text-white",
  },
  OWNER: {
    bubble: "bg-[#DFF0EE] text-[#1F5E58]",
    pill: "bg-[#DFF0EE] text-[#1F5E58]",
  },
  TENANT: {
    bubble: "bg-[#FDE8E4] text-[#C13947]",
    pill: "bg-[#FDE8E4] text-[#C13947]",
  },
};

export default async function AdminUsersPage(props: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/dashboard");

  const sp = await props.searchParams;
  const where: Record<string, unknown> = {};
  if (sp.role && ["ADMIN", "OWNER", "TENANT"].includes(sp.role)) {
    where.role = sp.role;
  }
  if (sp.search) {
    where.OR = [
      { name: { contains: sp.search, mode: "insensitive" } },
      { email: { contains: sp.search, mode: "insensitive" } },
    ];
  }

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { units: true, bookings: true } },
      },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const totals = {
    ADMIN: counts.find((c) => c.role === "ADMIN")?._count._all ?? 0,
    OWNER: counts.find((c) => c.role === "OWNER")?._count._all ?? 0,
    TENANT: counts.find((c) => c.role === "TENANT")?._count._all ?? 0,
  };
  const totalAll = totals.ADMIN + totals.OWNER + totals.TENANT;

  const filterPills = [
    { value: "", label: "All", count: totalAll },
    { value: "ADMIN", label: "Admins", count: totals.ADMIN, tone: "ADMIN" as const },
    { value: "OWNER", label: "Owners", count: totals.OWNER, tone: "OWNER" as const },
    { value: "TENANT", label: "Tenants", count: totals.TENANT, tone: "TENANT" as const },
  ];

  return (
    <div className="space-y-10">
      <DashboardHero
        tone="admin"
        eyebrow="Platform people"
        title="All users"
        highlight="users"
        subtitle={`${totalAll} accounts on the platform · ${totals.OWNER} owners · ${totals.TENANT} tenants`}
      />

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((p) => {
          const active = (sp.role ?? "") === p.value;
          const href = p.value
            ? `/admin/users?role=${p.value}`
            : "/admin/users";
          return (
            <Link
              key={p.label}
              href={href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                active
                  ? "bg-[#222222] text-white border-[#222222]"
                  : "bg-white text-[#222222] border-[#E5E7EB] hover:border-[#222222]"
              }`}
            >
              {p.tone &&
                (() => {
                  const Icon =
                    p.tone === "ADMIN"
                      ? ShieldCheck
                      : p.tone === "OWNER"
                        ? Building2
                        : Home;
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
              {p.label}
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-[#F7F7F7] text-[#717171]"
                }`}
              >
                {p.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User list */}
      {users.length === 0 ? (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center mb-4">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#222222]">
            No users match
          </h3>
          <p className="mt-2 text-sm text-[#717171] max-w-sm mx-auto">
            Try clearing the role filter to see everyone on the platform.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.9fr] gap-4 px-5 py-3 bg-[#FAFAFA] border-b border-[#EBEBEB] text-[10px] uppercase tracking-wider text-[#717171] font-bold">
            <span>Account</span>
            <span>Role</span>
            <span className="text-right">Units</span>
            <span className="text-right">Bookings</span>
            <span>Joined</span>
          </div>

          <ul>
            {users.map((u) => {
              const roleKey = u.role as "ADMIN" | "OWNER" | "TENANT";
              const tone = ROLE_TONES[roleKey] ?? ROLE_TONES.TENANT;
              return (
                <li
                  key={u.id}
                  className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.9fr] gap-4 px-5 py-4 border-b border-[#EBEBEB] last:border-b-0 hover:bg-[#FAFAFA] transition-colors items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.image || undefined} />
                      <AvatarFallback className={`${tone.bubble} text-sm font-semibold`}>
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#222222] truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-[#717171] truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <UserRoleSelect
                      userId={u.id}
                      currentRole={roleKey}
                      isSelf={u.id === session.user.id}
                    />
                  </div>
                  <div className="md:text-right text-sm">
                    <span className="md:hidden text-[10px] uppercase tracking-wider text-[#717171] font-semibold mr-2">
                      Units
                    </span>
                    <span className="font-display font-bold text-[#222222] tabular-nums">
                      {u._count.units}
                    </span>
                  </div>
                  <div className="md:text-right text-sm">
                    <span className="md:hidden text-[10px] uppercase tracking-wider text-[#717171] font-semibold mr-2">
                      Bookings
                    </span>
                    <span className="font-display font-bold text-[#222222] tabular-nums">
                      {u._count.bookings}
                    </span>
                  </div>
                  <div className="text-sm text-[#717171]">
                    <span className="md:hidden text-[10px] uppercase tracking-wider font-semibold mr-2">
                      Joined
                    </span>
                    {formatDateShort(u.createdAt)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
