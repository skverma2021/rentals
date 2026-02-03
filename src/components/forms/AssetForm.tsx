"use client";

import { useState, useEffect } from "react";

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
    <form onSubmit={handleSubmit} className="asset-form">
      <div className="form-group">
        <label htmlFor="specId">Asset Specification *</label>
        <select
          id="specId"
          name="specId"
          value={formData.specId}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.specId ? "error" : ""}
        >
          <option value="">Select an asset specification</option>
          {assetSpecs.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.description} - {spec.model}
            </option>
          ))}
        </select>
        {errors.specId && <span className="error-message">{errors.specId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="acquiredDate">Acquired Date *</label>
        <input
          type="date"
          id="acquiredDate"
          name="acquiredDate"
          value={formData.acquiredDate}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.acquiredDate ? "error" : ""}
        />
        {errors.acquiredDate && (
          <span className="error-message">{errors.acquiredDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="purchasePrice">Purchase Price *</label>
        <input
          type="number"
          id="purchasePrice"
          name="purchasePrice"
          value={formData.purchasePrice}
          onChange={handleChange}
          disabled={isLoading}
          min="0"
          step="0.01"
          placeholder="0.00"
          className={errors.purchasePrice ? "error" : ""}
        />
        {errors.purchasePrice && (
          <span className="error-message">{errors.purchasePrice}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saving..." : "Save Asset"}
        </button>
        <button
          type="button"
          onClick={() => setFormData(defaultFormData)}
          disabled={isLoading}
          className="btn-secondary"
        >
          Reset
        </button>
      </div>

      <style jsx>{`
        .asset-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #e53e3e;
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #e53e3e;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #0070f3;
          color: #fff;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0060df;
        }

        .btn-secondary {
          background-color: #eee;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #ddd;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
