"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

type UnitFormData = {
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareMeters: number | null;
  floor: number | null;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
};

type UnitFormProps = {
  initialData?: UnitFormData & { id: string };
  mode: "create" | "edit";
};

const defaultFormData: UnitFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  province: "",
  zipCode: "",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  squareMeters: null,
  floor: null,
  dailyRate: null,
  weeklyRate: null,
  monthlyRate: null,
  status: "DRAFT",
};

const provinces = [
  "Metro Manila",
  "Cebu",
  "Davao del Sur",
  "Pampanga",
  "Batangas",
  "Laguna",
  "Cavite",
  "Rizal",
  "Bulacan",
  "Iloilo",
];

const inputClass =
  "h-11 rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4 bg-white";
const selectTriggerClass =
  "h-11 rounded-xl border-[#E5E7EB] focus:border-[#222222] focus:ring-0 px-4 bg-white";

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#EBEBEB] bg-white p-6 md:p-7 space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E0484F] mb-1.5">
          {eyebrow}
        </p>
        <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#222222]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[#717171]">{description}</p>
        )}
      </div>
      <div className="pt-2 space-y-5">{children}</div>
    </section>
  );
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-[#222222]"
    >
      {children}
      {optional && (
        <span className="ml-1 text-[#9CA3AF] normal-case">(optional)</span>
      )}
    </Label>
  );
}

export function UnitForm({ initialData, mode }: UnitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UnitFormData>(
    initialData || defaultFormData,
  );

  const handleChange = (
    field: keyof UnitFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!formData.dailyRate && !formData.weeklyRate && !formData.monthlyRate) {
      toast.error("Set at least one rate (daily, weekly, or monthly)");
      return;
    }

    setIsLoading(true);
    try {
      const url =
        mode === "create" ? "/api/units" : `/api/units/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save unit");

      toast.success(
        mode === "create"
          ? "Unit created — nice."
          : "Changes saved.",
      );
      router.push("/owner/units");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        eyebrow="Step 1"
        title="The basics"
        description="What you'd tell a friend in two sentences."
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Unit name</FieldLabel>
          <Input
            id="name"
            placeholder="e.g., Skyline Studio at The Gramercy"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isLoading}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="Describe the unit, the neighborhood, and what makes it special."
            rows={5}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isLoading}
            className="rounded-xl border-[#E5E7EB] focus-visible:border-[#222222] focus-visible:ring-0 px-4 py-3 bg-white"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="status">Listing status</FieldLabel>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              handleChange("status", value as UnitFormData["status"])
            }
            disabled={isLoading}
          >
            <SelectTrigger id="status" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft — not visible to guests</SelectItem>
              <SelectItem value="ACTIVE">Active — visible and bookable</SelectItem>
              <SelectItem value="INACTIVE">Inactive — hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Step 2"
        title="Where it is"
        description="The address guests see after a booking is confirmed."
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="address">Building & street</FieldLabel>
          <Input
            id="address"
            placeholder="Building name, street, barangay"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            disabled={isLoading}
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              placeholder="e.g., Taguig"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={isLoading}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="province">Province</FieldLabel>
            <Select
              value={formData.province}
              onValueChange={(value) => handleChange("province", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="province" className={selectTriggerClass}>
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="zipCode" optional>
            ZIP code
          </FieldLabel>
          <Input
            id="zipCode"
            placeholder="e.g., 1630"
            value={formData.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </FormSection>

      <FormSection
        eyebrow="Step 3"
        title="The unit itself"
        description="Capacity, layout, and physical details."
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
            <Select
              value={formData.bedrooms.toString()}
              onValueChange={(value) =>
                handleChange("bedrooms", parseInt(value ?? "0"))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="bedrooms" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num === 0 ? "Studio" : num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="bathrooms">Bathrooms</FieldLabel>
            <Select
              value={formData.bathrooms.toString()}
              onValueChange={(value) =>
                handleChange("bathrooms", parseInt(value ?? "1"))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="bathrooms" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="maxGuests">Max guests</FieldLabel>
            <Select
              value={formData.maxGuests.toString()}
              onValueChange={(value) =>
                handleChange("maxGuests", parseInt(value ?? "1"))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="maxGuests" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="squareMeters" optional>
              Floor area (sqm)
            </FieldLabel>
            <Input
              id="squareMeters"
              type="number"
              placeholder="e.g., 45"
              value={formData.squareMeters || ""}
              onChange={(e) =>
                handleChange(
                  "squareMeters",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              disabled={isLoading}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="floor" optional>
              Floor number
            </FieldLabel>
            <Input
              id="floor"
              type="number"
              placeholder="e.g., 15"
              value={formData.floor || ""}
              onChange={(e) =>
                handleChange(
                  "floor",
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              disabled={isLoading}
              className={inputClass}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Step 4"
        title="Pricing"
        description="Set at least one rate. Leave the others blank if you don't offer them."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="dailyRate">
              Daily rate <span className="font-normal text-[#717171] normal-case">(₱)</span>
            </FieldLabel>
            <Input
              id="dailyRate"
              type="number"
              placeholder="2,500"
              value={formData.dailyRate || ""}
              onChange={(e) =>
                handleChange(
                  "dailyRate",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              disabled={isLoading}
              className={inputClass}
            />
            <p className="text-[11px] text-[#9CA3AF]">Per night</p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="weeklyRate">
              Weekly rate <span className="font-normal text-[#717171] normal-case">(₱)</span>
            </FieldLabel>
            <Input
              id="weeklyRate"
              type="number"
              placeholder="15,000"
              value={formData.weeklyRate || ""}
              onChange={(e) =>
                handleChange(
                  "weeklyRate",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              disabled={isLoading}
              className={inputClass}
            />
            <p className="text-[11px] text-[#9CA3AF]">Per 7 nights</p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="monthlyRate">
              Monthly rate <span className="font-normal text-[#717171] normal-case">(₱)</span>
            </FieldLabel>
            <Input
              id="monthlyRate"
              type="number"
              placeholder="50,000"
              value={formData.monthlyRate || ""}
              onChange={(e) =>
                handleChange(
                  "monthlyRate",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              disabled={isLoading}
              className={inputClass}
            />
            <p className="text-[11px] text-[#9CA3AF]">Per 30 nights</p>
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-20">
        <div className="flex flex-col-reverse sm:flex-row gap-3 rounded-2xl border border-[#EBEBEB] bg-white/95 backdrop-blur p-4 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="inline-flex items-center justify-center text-sm font-semibold text-[#222222] px-5 py-3 rounded-full border border-[#E5E7EB] bg-white hover:border-[#222222] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#E0484F] to-[#D5256E] text-white text-sm font-semibold hover:shadow-[0_10px_24px_-6px_rgba(224,72,79,0.55)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "create" ? "Create unit" : "Save changes"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
