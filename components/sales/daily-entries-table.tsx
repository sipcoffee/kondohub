"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_META } from "@/lib/sales";
import type { DailyPoint } from "@/lib/sales";
import type { Platform } from "@/lib/generated/prisma";

const PLATFORM_VALUES: (Platform | "")[] = [
  "",
  "KONDOHUB",
  "AIRBNB",
  "FACEBOOK",
  "REFERRED",
  "DIRECT",
  "OTHER",
];

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Props {
  unitId: string;
  unitName: string;
  year: number;
  month: number;
  daily: DailyPoint[];
}

interface RowDraft {
  platform: Platform | "";
  revenue: string;
  bookings: string;
  remarks: string;
}

function rowFromPoint(d: DailyPoint): RowDraft {
  return {
    platform: (d.platform ?? "") as Platform | "",
    revenue: d.actual ? String(d.actual) : "",
    bookings: d.bookings ? String(d.bookings) : "",
    remarks: d.remarks ?? "",
  };
}

export function DailyEntriesTable({
  unitId,
  unitName,
  year,
  month,
  daily,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Parent re-mounts via `key` when the active month changes, so initial
  // state from props is correct without a derived-state effect.
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>(() =>
    Object.fromEntries(daily.map((d) => [d.date, rowFromPoint(d)])),
  );
  const [savingRow, setSavingRow] = useState<string | null>(null);

  const setField = <K extends keyof RowDraft>(
    date: string,
    key: K,
    value: RowDraft[K],
  ) => {
    setDrafts((d) => ({ ...d, [date]: { ...d[date], [key]: value } }));
  };

  // Saves the current draft for a date. The optional `override` lets callers
  // (notably Select.onValueChange) save a new value without waiting for
  // React's state update to commit.
  const persist = async (date: string, override?: Partial<RowDraft>) => {
    const base = drafts[date];
    if (!base) return;
    const draft = { ...base, ...override };
    setSavingRow(date);
    try {
      const res = await fetch("/api/owner/sales/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          date,
          platform: draft.platform || null,
          bookings: draft.bookings === "" ? 0 : Number(draft.bookings),
          revenue: draft.revenue === "" ? 0 : Number(draft.revenue),
          remarks: draft.remarks || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save");
      }
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingRow(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Date</TableHead>
            <TableHead className="w-[64px]">Day</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead className="w-[140px]">Platform</TableHead>
            <TableHead className="w-[100px] text-right">
              Target ₱
            </TableHead>
            <TableHead className="w-[140px] text-right">Actual ₱</TableHead>
            <TableHead className="w-[100px] text-right">Variance</TableHead>
            <TableHead className="min-w-[180px]">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {daily.map((d) => {
            const draft = drafts[d.date] ?? rowFromPoint(d);
            const variance = d.target - d.actual;
            const isSaving = savingRow === d.date;
            const meta = draft.platform
              ? PLATFORM_META[draft.platform as Platform]
              : null;
            return (
              <TableRow key={d.date}>
                <TableCell className="font-medium whitespace-nowrap">
                  {MONTH_FULL[month - 1]} {d.day}, {year}
                </TableCell>
                <TableCell className="text-[#717171]">{d.weekday}</TableCell>
                <TableCell className="text-[#717171]">{unitName}</TableCell>
                <TableCell>
                  <Select
                    value={draft.platform || "__none"}
                    onValueChange={(v) => {
                      const raw = String(v);
                      const next: Platform | "" =
                        raw === "__none" ? "" : (raw as Platform);
                      setField(d.date, "platform", next);
                      void persist(d.date, { platform: next });
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue>
                        {meta ? (
                          <Badge
                            className={`${meta.bg} ${meta.fg} border-transparent`}
                          >
                            {meta.label}
                          </Badge>
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_VALUES.map((p) => (
                        <SelectItem
                          key={p || "__none"}
                          value={p || "__none"}
                        >
                          {p
                            ? PLATFORM_META[p as Platform].label
                            : "— None —"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right tabular-nums text-[#717171]">
                  {d.target ? formatCurrency(d.target) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={draft.revenue}
                    onChange={(e) =>
                      setField(d.date, "revenue", e.target.value)
                    }
                    onBlur={() => persist(d.date)}
                    className="h-8 text-right tabular-nums"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    variance > 0
                      ? "text-[#C13947]"
                      : variance < 0
                        ? "text-[#1F5E58]"
                        : "text-[#9CA3AF]"
                  }`}
                >
                  {d.target || d.actual
                    ? formatCurrency(Math.abs(variance))
                    : "—"}
                  {variance < 0 && (
                    <span className="ml-1 text-[10px]">over</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      value={draft.remarks}
                      onChange={(e) =>
                        setField(d.date, "remarks", e.target.value)
                      }
                      onBlur={() => persist(d.date)}
                      className="h-8"
                      placeholder="Promo Rate, Slow Day, …"
                    />
                    {isSaving && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9CA3AF] shrink-0" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
