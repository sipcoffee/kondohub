import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { UserRoleSelect } from "./role-select";
import { Users, ShieldCheck, Building2, Home } from "lucide-react";

export const metadata = { title: "Users" };

type SearchParams = Promise<{ role?: string; search?: string }>;

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
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const totals = {
    ADMIN: counts.find((c) => c.role === "ADMIN")?._count._all ?? 0,
    OWNER: counts.find((c) => c.role === "OWNER")?._count._all ?? 0,
    TENANT: counts.find((c) => c.role === "TENANT")?._count._all ?? 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage roles and accounts across the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RoleStatCard
          icon={ShieldCheck}
          label="Admins"
          count={totals.ADMIN}
          href="/admin/users?role=ADMIN"
        />
        <RoleStatCard
          icon={Building2}
          label="Owners"
          count={totals.OWNER}
          href="/admin/users?role=OWNER"
        />
        <RoleStatCard
          icon={Home}
          label="Tenants"
          count={totals.TENANT}
          href="/admin/users?role=TENANT"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All users
            {sp.role && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · filtered by {sp.role.toLowerCase()}
              </span>
            )}
          </CardTitle>
          <CardDescription>Click a role to change it.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No users match.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.image || undefined} />
                          <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] font-semibold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserRoleSelect
                        userId={u.id}
                        currentRole={u.role as "ADMIN" | "OWNER" | "TENANT"}
                        isSelf={u.id === session.user.id}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {u._count.units}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {u._count.bookings}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(u.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RoleStatCard({
  icon: Icon,
  label,
  count,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-[#EBEBEB] bg-white p-5 hover:border-[#222222] transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </a>
  );
}
