"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles = [
  { value: "TENANT", label: "Tenant" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
];

export function UserRoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: "ADMIN" | "OWNER" | "TENANT";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<typeof currentRole>(currentRole);
  const [pending, setPending] = useState(false);

  async function onChange(next: string | null) {
    if (!next || next === role) return;
    if (isSelf && next !== "ADMIN") {
      toast.error("You can't demote your own admin account");
      return;
    }
    setPending(true);
    const previous = role;
    setRole(next as typeof currentRole);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Failed to update role");
        setRole(previous);
        return;
      }
      toast.success(`Role updated to ${next.toLowerCase()}`);
      router.refresh();
    } catch {
      toast.error("Network error");
      setRole(previous);
    } finally {
      setPending(false);
    }
  }

  return (
    <Select value={role} onValueChange={onChange} disabled={pending || isSelf}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
