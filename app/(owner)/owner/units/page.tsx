import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";

export const metadata = {
  title: "My Units",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  UNDER_MAINTENANCE: "bg-red-100 text-red-800",
};

export default async function OwnerUnitsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const units = await prisma.unit.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      photos: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Units</h1>
          <p className="text-muted-foreground mt-1">
            Manage your condo unit listings
          </p>
        </div>
        <Button asChild>
          <Link href="/owner/units/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Unit
          </Link>
        </Button>
      </div>

      {/* Units List */}
      {units.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Units ({units.length})</CardTitle>
            <CardDescription>
              Click on a unit to edit its details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rates</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                          {unit.photos[0] ? (
                            <Image
                              src={unit.photos[0].url}
                              alt={unit.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{unit.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {unit.bedrooms}BR / {unit.bathrooms}BA / {unit.maxGuests} guests
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {unit.city}, {unit.province}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[unit.status]}>
                        {unit.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {unit.dailyRate && (
                          <div>{formatCurrency(unit.dailyRate)}/day</div>
                        )}
                        {unit.monthlyRate && (
                          <div className="text-muted-foreground">
                            {formatCurrency(unit.monthlyRate)}/mo
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{unit._count.bookings}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateShort(unit.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/units/${unit.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/owner/units/${unit.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Unit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Unit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No units yet</h2>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first condo unit
            </p>
            <Button asChild>
              <Link href="/owner/units/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Unit
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
