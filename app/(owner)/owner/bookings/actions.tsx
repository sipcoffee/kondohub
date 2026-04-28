"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "confirm" | "reject">(null);

  async function patch(status: "CONFIRMED" | "REJECTED") {
    const action = status === "CONFIRMED" ? "confirm" : "reject";
    setPending(action);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Could not update booking");
        return;
      }
      toast.success(action === "confirm" ? "Booking confirmed" : "Booking declined");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => patch("CONFIRMED")}
        disabled={!!pending}
      >
        {pending === "confirm" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => patch("REJECTED")}
        disabled={!!pending}
      >
        {pending === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Decline"}
      </Button>
    </>
  );
}
