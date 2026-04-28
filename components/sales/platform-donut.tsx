import type { PlatformSlice } from "@/lib/sales";
import { PLATFORM_META } from "@/lib/sales";
import { formatCurrency } from "@/lib/utils";

interface Props {
  slices: PlatformSlice[];
}

export function PlatformDonut({ slices }: Props) {
  const total = slices.reduce((s, p) => s + p.revenue, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-[#9CA3AF]">
        No revenue logged yet for this month
      </div>
    );
  }

  const cx = 90;
  const cy = 90;
  const r = 70;
  const inner = 46;
  let acc = 0;

  const arcs = slices.map((slice, i) => {
    const startA = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += slice.revenue;
    const endA = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = endA - startA > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy + r * Math.sin(endA);
    const x3 = cx + inner * Math.cos(endA);
    const y3 = cy + inner * Math.sin(endA);
    const x4 = cx + inner * Math.cos(startA);
    const y4 = cy + inner * Math.sin(startA);
    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");
    return { d, slice, i };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="h-[180px] w-[180px] shrink-0">
        {arcs.map(({ d, slice, i }) => (
          <path
            key={i}
            d={d}
            fill={PLATFORM_META[slice.platform].color}
            opacity={0.92}
          />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#9CA3AF"
          fontFamily="var(--font-geist-sans)"
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#222222"
          fontFamily="var(--font-display)"
        >
          {total >= 1000
            ? `₱${(total / 1000).toFixed(1)}k`
            : `₱${Math.round(total)}`}
        </text>
      </svg>

      <ul className="flex-1 space-y-2 text-sm">
        {slices.map((s) => {
          const meta = PLATFORM_META[s.platform];
          return (
            <li key={s.platform} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              <span className="font-medium text-[#222222]">{meta.label}</span>
              <span className="ml-auto text-[#717171] tabular-nums">
                {formatCurrency(s.revenue)}
              </span>
              <span className="w-12 text-right tabular-nums text-[#9CA3AF]">
                {(s.share * 100).toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
