export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#FDE8E4]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#E0484F] animate-spin" />
        </div>
        <p className="text-sm text-[#717171]">Loading…</p>
      </div>
    </div>
  );
}
