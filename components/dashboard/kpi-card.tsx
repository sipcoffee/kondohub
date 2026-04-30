import * as React from "react";

type Tone = "tenant" | "owner" | "admin" | "neutral";

const TONE_BUBBLE: Record<Tone, string> = {
  tenant: "bg-[#FDE8E4] text-[#C13947]",
  owner: "bg-[#DFF0EE] text-[#1F5E58]",
  admin: "bg-[#222222] text-white",
  neutral: "bg-[#F7F7F7] text-[#222222]",
};

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: Tone;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "tenant",
}: KpiCardProps) {
  return (
    <div className="group relative rounded-2xl border border-[#EBEBEB] bg-white p-5 transition-all hover:border-[#222222] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#717171]">
          {label}
        </p>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${TONE_BUBBLE[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4 font-display text-3xl font-extrabold text-[#222222] tabular-nums leading-none">
        {value}
      </div>
      {sub && (
        <p className="mt-2 text-xs text-[#717171] leading-relaxed">{sub}</p>
      )}
    </div>
  );
}
