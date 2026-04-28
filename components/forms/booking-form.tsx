"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { format, differenceInCalendarDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarDays,
  Users,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react";

type DurationType = "DAILY" | "WEEKLY" | "MONTHLY";

type Props = {
  unitId: string;
  unitStatus: "DRAFT" | "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
  maxGuests: number;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  blockedDates?: Date[];
  isAuthenticated: boolean;
  isOwnUnit?: boolean;
  callbackUrl: string;
};

export function BookingForm({
  unitId,
  unitStatus,
  maxGuests,
  dailyRate,
  weeklyRate,
  monthlyRate,
  blockedDates,
  isAuthenticated,
  isOwnUnit,
  callbackUrl,
}: Props) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [duration, setDuration] = useState<DurationType>(() => {
    if (dailyRate) return "DAILY";
    if (weeklyRate) return "WEEKLY";
    return "MONTHLY";
  });
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDurations: DurationType[] = useMemo(() => {
    const out: DurationType[] = [];
    if (dailyRate) out.push("DAILY");
    if (weeklyRate) out.push("WEEKLY");
    if (monthlyRate) out.push("MONTHLY");
    return out;
  }, [dailyRate, weeklyRate, monthlyRate]);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(0, differenceInCalendarDays(range.to, range.from));
  }, [range]);

  const breakdown = useMemo(() => {
    if (!nights) return null;
    let units = 0;
    let unitLabel = "";
    let rate: number | null = null;
    if (duration === "DAILY") {
      units = nights;
      unitLabel = nights === 1 ? "night" : "nights";
      rate = dailyRate;
    } else if (duration === "WEEKLY") {
      units = Math.ceil(nights / 7);
      unitLabel = units === 1 ? "week" : "weeks";
      rate = weeklyRate;
    } else {
      units = Math.ceil(nights / 30);
      unitLabel = units === 1 ? "month" : "months";
      rate = monthlyRate;
    }
    if (!rate) return null;
    const base = rate * units;
    return { units, unitLabel, rate, base, fee: 0, total: base };
  }, [duration, nights, dailyRate, weeklyRate, monthlyRate]);

  const dateLabel = useMemo(() => {
    if (!range?.from) return "Add dates";
    if (!range.to) return format(range.from, "MMM d");
    return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`;
  }, [range]);

  async function handleSubmit() {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (!range?.from || !range?.to) {
      toast.error("Please choose check-in and check-out dates");
      return;
    }
    if (range.from >= range.to) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (guests < 1 || guests > maxGuests) {
      toast.error(`Guests must be between 1 and ${maxGuests}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          checkIn: range.from.toISOString(),
          checkOut: range.to.toISOString(),
          durationType: duration,
          guests,
          tenantNotes: notes || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Could not create booking");
        return;
      }
      toast.success("Booking request sent");
      router.push(`/bookings/${result.data.id}`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isUnavailable = unitStatus !== "ACTIVE";

  return (
    <div className="rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* From price strip */}
      <div className="px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <span
              className="text-2xl font-extrabold text-[#222222]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              {dailyRate
                ? formatCurrency(dailyRate)
                : weeklyRate
                  ? formatCurrency(weeklyRate)
                  : monthlyRate
                    ? formatCurrency(monthlyRate)
                    : "—"}
            </span>
            <span className="text-sm text-[#717171] ml-1.5">
              {dailyRate ? "/ night" : weeklyRate ? "/ week" : monthlyRate ? "/ month" : ""}
            </span>
          </div>
          <span className="text-xs text-[#717171]">No charge yet</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-3">
        <div className="rounded-xl border border-[#E5E7EB] divide-y divide-[#F0F0F0]">
          {/* Dates */}
          <Popover>
            <PopoverTrigger
              disabled={isUnavailable}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-left">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#222222]">
                  Dates
                </span>
                <span className="block text-sm text-[#222222]">{dateLabel}</span>
              </span>
              <CalendarDays className="h-4 w-4 text-[#717171] shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto rounded-2xl border-[#EBEBEB]" align="end">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={range}
                onSelect={setRange}
                disabled={[
                  { before: new Date() },
                  ...(blockedDates?.map((d) => ({ from: d, to: d })) ?? []),
                ]}
                className="p-4"
              />
            </PopoverContent>
          </Popover>

          {/* Duration */}
          {availableDurations.length > 1 && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#222222] mb-2">
                Stay type
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {availableDurations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      duration === d
                        ? "bg-[#222222] text-white"
                        : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EBEBEB]"
                    }`}
                  >
                    {d === "DAILY" ? "Per night" : d === "WEEKLY" ? "Per week" : "Per month"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guests */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#222222]">
                Guests
              </p>
              <p className="text-sm text-[#717171]">Max {maxGuests}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-[#E5E7EB] text-[#222222] hover:border-[#222222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrement guests"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center font-semibold text-[#222222]">
                <Users className="inline h-3.5 w-3.5 mr-0.5 text-[#717171]" />
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                disabled={guests >= maxGuests}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-[#E5E7EB] text-[#222222] hover:border-[#222222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Increment guests"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes (collapsible) */}
        <div className="mt-3">
          {showNotes ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A note for the host (arrival time, special requests…)"
              rows={3}
              className="rounded-xl border-[#E5E7EB] resize-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-xs text-[#717171] hover:text-[#222222] transition-colors"
            >
              + Add a note for the host
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isUnavailable || isOwnUnit}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isUnavailable
                ? "Unavailable"
                : isOwnUnit
                  ? "This is your unit"
                  : !isAuthenticated
                    ? "Sign in to reserve"
                    : !range?.from || !range?.to
                      ? "Choose dates"
                      : "Request to book"}
              {!isUnavailable && !isOwnUnit && <ArrowRight className="h-4 w-4" />}
            </>
          )}
        </button>

        {/* Breakdown */}
        {breakdown && (
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-baseline justify-between text-[#717171]">
              <span className="underline decoration-dotted">
                {formatCurrency(breakdown.rate)} × {breakdown.units} {breakdown.unitLabel}
              </span>
              <span>{formatCurrency(breakdown.base)}</span>
            </div>
            {breakdown.fee > 0 && (
              <div className="flex justify-between text-[#717171]">
                <span>Service fee</span>
                <span>{formatCurrency(breakdown.fee)}</span>
              </div>
            )}
            <div className="pt-3 mt-2 border-t border-[#F0F0F0] flex items-baseline justify-between">
              <span className="font-semibold text-[#222222]">Total</span>
              <span className="font-bold text-[#222222]">{formatCurrency(breakdown.total)}</span>
            </div>
          </div>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#717171]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1F6E3A]" />
          Owner reviews each request — typically within 24 hours
        </p>
      </div>
    </div>
  );
}
