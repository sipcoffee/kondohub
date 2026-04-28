"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

export function UnitForm({ initialData, mode }: UnitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UnitFormData>(
    initialData || defaultFormData
  );

  const handleChange = (
    field: keyof UnitFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.description || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.dailyRate && !formData.weeklyRate && !formData.monthlyRate) {
      toast.error("Please set at least one rate (daily, weekly, or monthly)");
      return;
    }

    setIsLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/units"
          : `/api/units/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save unit");
      }

      toast.success(
        mode === "create"
          ? "Unit created successfully!"
          : "Unit updated successfully!"
      );

      router.push("/owner/units");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the basic details about your unit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Unit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Cozy Studio in BGC"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your unit, its features, and what makes it special..."
              rows={5}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleChange("status", value as UnitFormData["status"])
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft (not visible)</SelectItem>
                <SelectItem value="ACTIVE">Active (visible to tenants)</SelectItem>
                <SelectItem value="INACTIVE">Inactive (hidden)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where is your unit located?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="Building name, street, barangay"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g., Taguig"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => handleChange("province", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
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
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="e.g., 1630"
              value={formData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Unit Details */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Details</CardTitle>
          <CardDescription>
            Specify the capacity and features of your unit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Select
                value={formData.bedrooms.toString()}
                onValueChange={(value) =>
                  handleChange("bedrooms", parseInt(value ?? "0"))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
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
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Select
                value={formData.bathrooms.toString()}
                onValueChange={(value) =>
                  handleChange("bathrooms", parseInt(value ?? "1"))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
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
              <Label htmlFor="maxGuests">Max Guests *</Label>
              <Select
                value={formData.maxGuests.toString()}
                onValueChange={(value) =>
                  handleChange("maxGuests", parseInt(value ?? "1"))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squareMeters">Floor Area (sqm)</Label>
              <Input
                id="squareMeters"
                type="number"
                placeholder="e.g., 45"
                value={formData.squareMeters || ""}
                onChange={(e) =>
                  handleChange(
                    "squareMeters",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor Number</Label>
              <Input
                id="floor"
                type="number"
                placeholder="e.g., 15"
                value={formData.floor || ""}
                onChange={(e) =>
                  handleChange(
                    "floor",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>
            Set your rates for different stay durations. Set at least one rate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate (PHP)</Label>
              <Input
                id="dailyRate"
                type="number"
                placeholder="e.g., 2500"
                value={formData.dailyRate || ""}
                onChange={(e) =>
                  handleChange(
                    "dailyRate",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Per night</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyRate">Weekly Rate (PHP)</Label>
              <Input
                id="weeklyRate"
                type="number"
                placeholder="e.g., 15000"
                value={formData.weeklyRate || ""}
                onChange={(e) =>
                  handleChange(
                    "weeklyRate",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Per 7 nights</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRate">Monthly Rate (PHP)</Label>
              <Input
                id="monthlyRate"
                type="number"
                placeholder="e.g., 50000"
                value={formData.monthlyRate || ""}
                onChange={(e) =>
                  handleChange(
                    "monthlyRate",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Per 30 nights</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Unit" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
