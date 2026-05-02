"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Lock, CalendarRange } from "lucide-react";

type Props = {
  unitId: string;
  initiallyBlocked: string[]; // ISO YYYY-MM-DD
  bookingHolds: string[]; // dates locked by active bookings (display-only)
};

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AvailabilityEditor({
  unitId,
  initiallyBlocked,
  bookingHolds,
}: Props) {
  const router = useRouter();
  const [blocked, setBlocked] = useState<Set<string>>(
    () => new Set(initiallyBlocked)
  );
  const [saving, setSaving] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCalendarMonths(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const initial = useMemo(() => new Set(initiallyBlocked), [initiallyBlocked]);
  const holds = useMemo(() => new Set(bookingHolds), [bookingHolds]);

  const isDirty = useMemo(() => {
    if (blocked.size !== initial.size) return true;
    for (const d of blocked) if (!initial.has(d)) return true;
    return false;
  }, [blocked, initial]);

  // Convert sets to Date arrays for the picker
  const selectedDates = useMemo(
    () => Array.from(blocked).map((s) => new Date(s)),
    [blocked]
  );
  const holdDates = useMemo(
    () => Array.from(holds).map((s) => new Date(s)),
    [holds]
  );

  function onSelect(dates: Date[] | undefined) {
    if (!dates) {
      setBlocked(new Set());
      return;
    }
    const next = new Set<string>();
    for (const d of dates) {
      const key = isoDay(d);
      if (holds.has(key)) continue; // can't toggle booking-locked dates
      next.add(key);
    }
    setBlocked(next);
  }

  async function save() {
    const toBlock = [...blocked].filter((d) => !initial.has(d));
    const toUnblock = [...initial].filter((d) => !blocked.has(d));
    if (!toBlock.length && !toUnblock.length) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/units/${unitId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: toBlock, unblocked: toUnblock }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Could not save");
        return;
      }
      toast.success("Availability updated");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-4 sm:p-6">
        <Calendar
          mode="multiple"
          numberOfMonths={calendarMonths}
          selected={selectedDates}
          onSelect={onSelect}
          disabled={[
            { before: new Date() },
            ...holdDates.map((d) => ({ from: d, to: d })),
          ]}
          modifiers={{ booked: holdDates }}
          modifiersClassNames={{
            booked:
              "relative !bg-[#FDE8E4] !text-[#C13947] before:absolute before:inset-0 before:rounded-md",
          }}
          className="mx-auto"
        />

        <div className="mt-6 pt-5 border-t border-[#F0F0F0] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#717171]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[#FDE8E4]" />
            Held by booking
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[#222222]" />
            You blocked
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#E5E7EB]" />
            Available
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EBEBEB] bg-white p-4">
        <div className="text-sm text-[#717171]">
          <p className="text-[#222222] font-semibold">
            {blocked.size} {blocked.size === 1 ? "date" : "dates"} blocked
          </p>
          <p className="text-xs">Click any future date to toggle. Held dates are read-only.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBlocked(initial)}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save changes
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] p-4 flex gap-3">
        <Lock className="h-4 w-4 text-[#717171] shrink-0 mt-0.5" />
        <div className="text-xs text-[#717171] leading-relaxed">
          <p className="text-[#222222] font-semibold flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5" />
            How blocking works
          </p>
          Blocked dates won&apos;t accept new bookings. Existing bookings (shown
          in coral) cannot be overridden — to free those dates, cancel or
          decline the booking first.
        </div>
      </div>
    </div>
  );
}
