import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CalendarDays, MapPin, Building2 } from "lucide-react";

export const metadata = {
  title: "My Bookings",
};

export default async function BookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      tenantId: session.user.id,
    },
    include: {
      unit: {
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) =>
      ["PENDING", "CONFIRMED"].includes(b.status) && new Date(b.checkIn) >= now
  );
  const pastBookings = bookings.filter(
    (b) =>
      ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status) ||
      new Date(b.checkOut) < now
  );

  const BookingCard = ({
    booking,
  }: {
    booking: (typeof bookings)[0];
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {booking.unit.photos[0] ? (
              <Image
                src={booking.unit.photos[0].url}
                alt={booking.unit.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{booking.unit.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {booking.unit.city}, {booking.unit.province}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-2 text-sm">
              <p className="flex items-center text-muted-foreground">
                <CalendarDays className="h-3 w-3 mr-1" />
                {formatDateShort(booking.checkIn)} -{" "}
                {formatDateShort(booking.checkOut)}
              </p>
              <p className="font-medium mt-1">
                {formatCurrency(booking.totalPrice)} ({booking.durationType.toLowerCase()})
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/bookings/${booking.id}`}>View Details</Link>
              </Button>
              {booking.status === "COMPLETED" && !booking.review && (
                <Button size="sm" asChild>
                  <Link href={`/bookings/${booking.id}/review`}>
                    Leave Review
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your booking requests
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  No upcoming bookings
                </h2>
                <p className="text-muted-foreground mb-4">
                  Start exploring units and book your next stay!
                </p>
                <Button asChild>
                  <Link href="/units">Browse Units</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No past bookings</h2>
                <p className="text-muted-foreground">
                  Your completed and cancelled bookings will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
