import type { DailyPoint } from "@/lib/sales";
import { formatCurrency } from "@/lib/utils";

interface Props {
  daily: DailyPoint[];
  /** 1-based day-of-month for "today" marker; 0 hides the marker */
  todayDay: number;
  height?: number;
}

/**
 * Cumulative target vs actual area chart, plus per-day actual bars at the
 * bottom. Pure SVG, renders on the server. The viewBox keeps it responsive.
 */
export function CumulativeChart({ daily, todayDay, height = 280 }: Props) {
  if (daily.length === 0) return null;

  const W = 800;
  const H = height;
  const padL = 56;
  const padR = 24;
  const padT = 16;
  const padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const lastTarget = daily[daily.length - 1].cumulativeTarget;
  const lastActual = daily[daily.length - 1].cumulativeActual;
  const peakActual = Math.max(...daily.map((d) => d.actual));
  const yMax = Math.max(lastTarget, lastActual, 1);

  const x = (i: number) =>
    padL + (innerW * i) / Math.max(daily.length - 1, 1);
  const y = (v: number) => padT + innerH - (innerH * v) / yMax;

  const targetPath =
    `M ${x(0)},${y(0)} ` +
    daily
      .map((d, i) => `L ${x(i)},${y(d.cumulativeTarget)}`)
      .join(" ");

  const actualPath =
    `M ${x(0)},${y(0)} ` +
    daily.map((d, i) => `L ${x(i)},${y(d.cumulativeActual)}`).join(" ");

  const actualArea =
    actualPath +
    ` L ${x(daily.length - 1)},${y(0)} L ${x(0)},${y(0)} Z`;

  // Per-day actual bars sit at the bottom 22% of inner height
  const barH = innerH * 0.22;
  const barTop = padT + innerH - barH;
  const barW = Math.max(1, innerW / daily.length - 2);
  const barY = (v: number) =>
    barTop + barH - (barH * v) / Math.max(peakActual, 1);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (yMax * i) / ticks);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Cumulative target vs actual revenue"
    >
      <defs>
        <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0484F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E0484F" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* y gridlines + labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(v)}
            y2={y(v)}
            stroke="#EBEBEB"
            strokeDasharray={i === 0 ? "" : "3 4"}
          />
          <text
            x={padL - 8}
            y={y(v) + 4}
            textAnchor="end"
            fontSize="10"
            fill="#9CA3AF"
            fontFamily="var(--font-geist-sans)"
          >
            {v >= 1000 ? `₱${Math.round(v / 1000)}k` : `₱${Math.round(v)}`}
          </text>
        </g>
      ))}

      {/* x labels — every ~5 days */}
      {daily.map((d, i) => {
        const showLabel =
          i === 0 ||
          i === daily.length - 1 ||
          (i + 1) % 5 === 0;
        if (!showLabel) return null;
        return (
          <text
            key={i}
            x={x(i)}
            y={H - 16}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
            fontFamily="var(--font-geist-sans)"
          >
            {d.day}
          </text>
        );
      })}

      {/* per-day actual bars */}
      {daily.map((d, i) => (
        <rect
          key={`bar-${i}`}
          x={x(i) - barW / 2}
          y={barY(d.actual)}
          width={barW}
          height={Math.max(0, barTop + barH - barY(d.actual))}
          fill="#E0484F"
          opacity={d.actual > 0 ? 0.55 : 0}
          rx="1.5"
        />
      ))}

      {/* actual area */}
      <path d={actualArea} fill="url(#actualFill)" />

      {/* target line */}
      <path
        d={targetPath}
        fill="none"
        stroke="#222222"
        strokeWidth="1.6"
        strokeDasharray="5 4"
      />
      {/* actual line */}
      <path d={actualPath} fill="none" stroke="#E0484F" strokeWidth="2.2" />

      {/* today marker */}
      {todayDay > 0 && todayDay <= daily.length && (
        <g>
          <line
            x1={x(todayDay - 1)}
            x2={x(todayDay - 1)}
            y1={padT}
            y2={padT + innerH}
            stroke="#9CA3AF"
            strokeDasharray="2 3"
          />
          <text
            x={x(todayDay - 1)}
            y={padT + 12}
            textAnchor="middle"
            fontSize="9"
            fill="#717171"
            fontFamily="var(--font-geist-sans)"
          >
            today
          </text>
        </g>
      )}

      {/* end-of-month labels */}
      <g>
        <circle cx={x(daily.length - 1)} cy={y(lastActual)} r="3.5" fill="#E0484F" />
        <text
          x={x(daily.length - 1) - 8}
          y={y(lastActual) - 8}
          textAnchor="end"
          fontSize="11"
          fontWeight="600"
          fill="#222222"
          fontFamily="var(--font-geist-sans)"
        >
          {formatCurrency(lastActual)}
        </text>
        <text
          x={x(daily.length - 1) - 8}
          y={y(lastTarget) - 8}
          textAnchor="end"
          fontSize="10"
          fill="#717171"
          fontFamily="var(--font-geist-sans)"
        >
          target {formatCurrency(lastTarget)}
        </text>
      </g>
    </svg>
  );
}
