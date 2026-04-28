import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Rates = {
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
};

const rows: { key: keyof Rates; suffix: string; label: string }[] = [
  { key: "dailyRate", suffix: "/ night", label: "Daily" },
  { key: "weeklyRate", suffix: "/ week", label: "Weekly" },
  { key: "monthlyRate", suffix: "/ month", label: "Monthly" },
];

export function PriceList({ rates, className }: { rates: Rates; className?: string }) {
  const available = rows.filter((r) => rates[r.key]);
  if (!available.length) {
    return <p className={cn("text-sm text-[#717171]", className)}>Pricing on request</p>;
  }
  return (
    <ul className={cn("space-y-2.5", className)}>
      {available.map((r) => (
        <li key={r.key} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-[#717171]">{r.label}</span>
          <span className="text-[#222222]">
            <span className="font-semibold">{formatCurrency(rates[r.key] as number)}</span>
            <span className="text-[#9CA3AF] ml-1">{r.suffix}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PriceTag({
  amount,
  suffix,
  size = "md",
  className,
}: {
  amount: number;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };
  return (
    <span className={cn("text-[#222222]", sizes[size], className)}>
      <span className="font-bold">{formatCurrency(amount)}</span>
      {suffix && <span className="text-[#9CA3AF] font-normal ml-1">{suffix}</span>}
    </span>
  );
}
