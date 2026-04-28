"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  unitId: string;
  year: number;
  month: number;
  current: { dailyTargetRate: number; notes: string | null } | null;
  /** Suggested rate (e.g., the unit's published dailyRate) */
  suggested?: number | null;
}

export function TargetEditor({
  unitId,
  year,
  month,
  current,
  suggested,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState<string>(
    current ? String(current.dailyTargetRate) : suggested ? String(suggested) : "",
  );
  const [notes, setNotes] = useState(current?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const dailyTargetRate = Number(rate);
    if (!Number.isFinite(dailyTargetRate) || dailyTargetRate < 0) {
      toast.error("Enter a valid daily target rate");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/owner/sales/targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          year,
          month,
          dailyTargetRate,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save");
      }
      toast.success("Target updated");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant={current ? "outline" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Target className="mr-2 h-4 w-4" />
        {current
          ? `Target: ${formatCurrency(current.dailyTargetRate)}/day`
          : "Set monthly target"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set monthly target</DialogTitle>
          <DialogDescription>
            One booking-day at this rate is the goal for every day in the month.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="rate">Daily target rate (₱)</Label>
            <Input
              id="rate"
              inputMode="decimal"
              type="number"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="1500"
            />
            {suggested != null && !current && (
              <p className="text-xs text-[#717171]">
                Suggested from listing: {formatCurrency(suggested)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. peak season, holiday surcharge"
            />
          </div>
        </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
