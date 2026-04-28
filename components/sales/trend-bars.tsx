import type { TrendBucket } from "@/lib/sales";
import { formatCurrency } from "@/lib/utils";

interface Props {
  trend: TrendBucket[];
  highlightYear: number;
  highlightMonth: number;
}

/**
 * 12-month trend: paired bars per month (target backdrop, actual foreground).
 * The currently-selected month gets a highlighted accent.
 */
export function TrendBars({ trend, highlightYear, highlightMonth }: Props) {
  const W = 720;
  const H = 160;
  const padL = 12;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const cellW = innerW / trend.length;
  const barW = Math.min(28, cellW * 0.55);

  const max = Math.max(
    1,
    ...trend.map((t) => Math.max(t.target, t.actual)),
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* baseline */}
      <line
        x1={padL}
        x2={W - padR}
        y1={padT + innerH}
        y2={padT + innerH}
        stroke="#EBEBEB"
      />
      {trend.map((t, i) => {
        const cx = padL + cellW * (i + 0.5);
        const targetH = (innerH * t.target) / max;
        const actualH = (innerH * t.actual) / max;
        const isCurrent =
          t.year === highlightYear && t.month === highlightMonth;
        return (
          <g key={`${t.year}-${t.month}`}>
            {/* target backdrop */}
            <rect
              x={cx - barW / 2}
              y={padT + innerH - targetH}
              width={barW}
              height={targetH}
              rx="3"
              fill="#F3F4F6"
            />
            {/* actual */}
            <rect
              x={cx - barW / 2}
              y={padT + innerH - actualH}
              width={barW}
              height={actualH}
              rx="3"
              fill={isCurrent ? "#E0484F" : "#222222"}
              opacity={isCurrent ? 1 : 0.78}
            />
            <text
              x={cx}
              y={H - 12}
              textAnchor="middle"
              fontSize="10"
              fill={isCurrent ? "#E0484F" : "#9CA3AF"}
              fontWeight={isCurrent ? "600" : "400"}
              fontFamily="var(--font-geist-sans)"
            >
              {t.label}
            </text>
            {isCurrent && t.actual > 0 && (
              <text
                x={cx}
                y={padT + innerH - actualH - 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#E0484F"
                fontFamily="var(--font-geist-sans)"
              >
                {t.actual >= 1000
                  ? `₱${(t.actual / 1000).toFixed(0)}k`
                  : formatCurrency(t.actual)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
