"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, RotateCcw } from "lucide-react";

interface AssetSpec {
  id: number;
  description: string;
  model: string;
}

interface AssetFormData {
  specId: number | "";
  acquiredDate: string;
  purchasePrice: number | "";
}

interface AssetFormProps {
  assetSpecs: AssetSpec[];
  onSubmit: (data: AssetFormData) => void;
  initialData?: AssetFormData;
  isLoading?: boolean;
}

const defaultFormData: AssetFormData = {
  specId: "",
  acquiredDate: "",
  purchasePrice: "",
};

export default function AssetForm({
  assetSpecs,
  onSubmit,
  initialData,
  isLoading = false,
}: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssetFormData, string>> = {};

    if (!formData.specId) {
      newErrors.specId = "Asset specification is required";
    }

    if (!formData.acquiredDate) {
      newErrors.acquiredDate = "Acquired date is required";
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));

    // Clear error when field is modified
    if (errors[name as keyof AssetFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="specId" className="text-sm font-semibold">
          Asset Specification *
        </Label>
        <select
          id="specId"
          name="specId"
          value={formData.specId}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full h-10 px-3 rounded-md border bg-background text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${errors.specId ? "border-destructive" : "border-border"}`}
        >
          <option value="">Select an asset specification</option>
          {assetSpecs.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.description} - {spec.model}
            </option>
          ))}
        </select>
        {errors.specId && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.specId}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="acquiredDate" className="text-sm font-semibold">
          Acquired Date *
        </Label>
        <Input
          type="date"
          id="acquiredDate"
          name="acquiredDate"
          value={formData.acquiredDate}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.acquiredDate ? "border-destructive" : ""}
        />
        {errors.acquiredDate && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.acquiredDate}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchasePrice" className="text-sm font-semibold">
          Purchase Price *
        </Label>
        <Input
          type="number"
          id="purchasePrice"
          name="purchasePrice"
          value={formData.purchasePrice}
          onChange={handleChange}
          disabled={isLoading}
          min="0"
          step="0.01"
          placeholder="0.00"
          className={errors.purchasePrice ? "border-destructive" : ""}
        />
        {errors.purchasePrice && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.purchasePrice}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Asset"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData(defaultFormData)}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </form>
  );
}
