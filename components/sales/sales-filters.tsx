"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const MONTHS = [
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

interface UnitOption {
  id: string;
  name: string;
}

interface Props {
  units: UnitOption[];
  unitId: string;
  year: number;
  month: number;
}

export function SalesFilters({ units, unitId, year, month }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  const setParam = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(key, value);
    start(() => {
      router.replace(`${pathname}?${sp.toString()}`);
    });
  };

  // Year window: current year ±2
  const years = Array.from({ length: 5 }, (_, i) => year - 2 + i);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#717171]">
          Unit
        </label>
        <Select
          value={unitId}
          onValueChange={(v) => setParam("unitId", String(v))}
        >
          <SelectTrigger className="min-w-[220px]">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#717171]">
          Month
        </label>
        <Select
          value={String(month)}
          onValueChange={(v) => setParam("month", String(v))}
        >
          <SelectTrigger className="min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#717171]">
          Year
        </label>
        <Select
          value={String(year)}
          onValueChange={(v) => setParam("year", String(v))}
        >
          <SelectTrigger className="min-w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pending && (
        <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF] mt-5" />
      )}
    </div>
  );
}
