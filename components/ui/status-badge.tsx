import { cn } from "@/lib/utils";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";
type UnitStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

const palette: Record<BookingStatus | UnitStatus, { bg: string; fg: string; label?: string }> = {
  // Booking statuses
  PENDING: { bg: "bg-[#FFF4E6]", fg: "text-[#A56300]" },
  CONFIRMED: { bg: "bg-[#E6F7EC]", fg: "text-[#1F6E3A]" },
  CANCELLED: { bg: "bg-[#F4F4F4]", fg: "text-[#717171]" },
  REJECTED: { bg: "bg-[#FDE8E4]", fg: "text-[#C13947]" },
  COMPLETED: { bg: "bg-[#E6EFFB]", fg: "text-[#234B8A]" },
  // Unit statuses
  DRAFT: { bg: "bg-[#F4F4F4]", fg: "text-[#717171]" },
  ACTIVE: { bg: "bg-[#E6F7EC]", fg: "text-[#1F6E3A]" },
  INACTIVE: { bg: "bg-[#FFF4E6]", fg: "text-[#A56300]" },
  UNDER_MAINTENANCE: { bg: "bg-[#FDE8E4]", fg: "text-[#C13947]", label: "Maintenance" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus | UnitStatus;
  className?: string;
}) {
  const tone = palette[status];
  const label = tone.label ?? status.replace("_", " ").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider",
        tone.bg,
        tone.fg,
        className
      )}
    >
      {label}
    </span>
  );
}
