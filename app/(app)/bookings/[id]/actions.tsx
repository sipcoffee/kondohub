"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  Star,
  CheckCheck,
} from "lucide-react";

type Props = {
  bookingId: string;
  status: string;
  isOwner: boolean;
  isTenant: boolean;
  isAdmin: boolean;
  canCancel: boolean;
  canConfirm: boolean;
  canReject: boolean;
  canComplete: boolean;
  canReview: boolean;
  checkoutPassed: boolean;
};

export function BookingActions({
  bookingId,
  isOwner,
  isTenant,
  canCancel,
  canConfirm,
  canReject,
  canComplete,
  canReview,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "confirm" | "reject" | "cancel" | "complete">(
    null
  );

  async function patch(status: "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED") {
    const action = status.toLowerCase() as typeof pending;
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
      const verb =
        status === "CONFIRMED"
          ? "confirmed"
          : status === "REJECTED"
            ? "declined"
            : status === "CANCELLED"
              ? "cancelled"
              : "marked complete";
      toast.success(`Booking ${verb}`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  }

  const anyAction =
    canCancel || canConfirm || canReject || canComplete || canReview;
  if (!anyAction) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-[#717171] font-semibold">
        Actions
      </p>

      {canConfirm && (
        <button
          onClick={() => patch("CONFIRMED")}
          disabled={!!pending}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-50 transition-shadow"
        >
          {pending === "confirm" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm booking
            </>
          )}
        </button>
      )}

      {canReject && (
        <button
          onClick={() => patch("REJECTED")}
          disabled={!!pending}
          className="w-full inline-flex items-center justify-center gap-2 border border-[#FDE8E4] bg-white text-[#C13947] py-3 rounded-full text-sm font-semibold hover:bg-[#FDE8E4] disabled:opacity-50 transition-colors"
        >
          {pending === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Decline
            </>
          )}
        </button>
      )}

      {canComplete && (
        <button
          onClick={() => patch("COMPLETED")}
          disabled={!!pending}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#222222] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#3A3A3A] disabled:opacity-50 transition-colors"
        >
          {pending === "complete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCheck className="h-4 w-4" />
              Mark as completed
            </>
          )}
        </button>
      )}

      {canReview && (
        <Link
          href={`/bookings/${bookingId}/review`}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white py-3 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] transition-shadow"
        >
          <Star className="h-4 w-4" />
          Leave a review
        </Link>
      )}

      {canCancel && (
        <button
          onClick={() => {
            if (!confirm("Are you sure you want to cancel this booking?")) return;
            patch("CANCELLED");
          }}
          disabled={!!pending}
          className="w-full inline-flex items-center justify-center gap-2 text-[#717171] py-3 rounded-full text-sm font-semibold hover:bg-[#F7F7F7] hover:text-[#C13947] disabled:opacity-50 transition-colors"
        >
          {pending === "cancel" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Ban className="h-4 w-4" />
              Cancel booking
            </>
          )}
        </button>
      )}

      {(isOwner || isTenant) && (
        <p className="text-[11px] text-[#9CA3AF] pt-1 border-t border-[#F0F0F0] mt-3">
          {isOwner
            ? "You can confirm or decline within 24 hours of the request."
            : "You can cancel until your host confirms — afterwards cancellation policies may apply."}
        </p>
      )}
    </div>
  );
}
