"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  description: string;
}

interface Manufacturer {
  id: number;
  description: string;
}

interface AssetSpec {
  id: number;
  description: string;
  model: string;
  yearMake: number;
  assetCategory: Category;
  manufacturer: Manufacturer;
}

export default function SetupPage() {
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Manufacturers
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [newManufacturer, setNewManufacturer] = useState("");
  const [manufacturerLoading, setManufacturerLoading] = useState(false);

  // Asset Specs
  const [assetSpecs, setAssetSpecs] = useState<AssetSpec[]>([]);
  const [specForm, setSpecForm] = useState({
    assetCategoryId: "",
    manufacturerId: "",
    yearMake: "",
    model: "",
    description: "",
  });
  const [specLoading, setSpecLoading] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
    fetchAssetSpecs();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Category functions
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/asset-categories");
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setCategoryLoading(true);
    try {
      const response = await fetch("/api/asset-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newCategory }),
      });

      if (response.ok) {
        setNewCategory("");
        fetchCategories();
        showMessage("success", "Category added successfully");
      } else {
        showMessage("error", "Failed to add category");
      }
    } catch (error) {
      showMessage("error", "An error occurred");
    } finally {
      setCategoryLoading(false);
    }
  };

  // Manufacturer functions
  const fetchManufacturers = async () => {
    try {
      const response = await fetch("/api/manufacturers");
      if (response.ok) {
        setManufacturers(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch manufacturers:", error);
    }
  };

  const addManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManufacturer.trim()) return;

    setManufacturerLoading(true);
    try {
      const response = await fetch("/api/manufacturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newManufacturer }),
      });

      if (response.ok) {
        setNewManufacturer("");
        fetchManufacturers();
        showMessage("success", "Manufacturer added successfully");
      } else {
        showMessage("error", "Failed to add manufacturer");
      }
    } catch (error) {
      showMessage("error", "An error occurred");
    } finally {
      setManufacturerLoading(false);
    }
  };

  // Asset Spec functions
  const fetchAssetSpecs = async () => {
    try {
      const response = await fetch("/api/asset-specs");
      if (response.ok) {
        setAssetSpecs(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch asset specs:", error);
    }
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecForm((prev) => ({ ...prev, [name]: value }));
  };

  const addAssetSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specForm.assetCategoryId || !specForm.manufacturerId || !specForm.yearMake || !specForm.model || !specForm.description) {
      showMessage("error", "All fields are required");
      return;
    }

    setSpecLoading(true);
    try {
      const response = await fetch("/api/asset-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specForm),
      });

      if (response.ok) {
        setSpecForm({
          assetCategoryId: "",
          manufacturerId: "",
          yearMake: "",
          model: "",
          description: "",
        });
        fetchAssetSpecs();
        showMessage("success", "Asset specification added successfully");
      } else {
        showMessage("error", "Failed to add asset specification");
      }
    } catch (error) {
      showMessage("error", "An error occurred");
    } finally {
      setSpecLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <header className="page-header">
        <h1>Setup & Configuration</h1>
        <p>Configure categories, manufacturers, and asset specifications</p>
      </header>

      {message && (
        <div className={`global-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="setup-grid">
        {/* Asset Categories */}
        <section className="setup-section">
          <h2>Asset Categories</h2>
          <form onSubmit={addCategory} className="inline-form">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              disabled={categoryLoading}
            />
            <button type="submit" disabled={categoryLoading || !newCategory.trim()}>
              {categoryLoading ? "Adding..." : "Add"}
            </button>
          </form>
          <div className="items-list">
            {categories.length === 0 ? (
              <p className="no-data">No categories yet</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="item-row">
                  <span className="item-id">#{cat.id}</span>
                  <span className="item-desc">{cat.description}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Manufacturers */}
        <section className="setup-section">
          <h2>Manufacturers</h2>
          <form onSubmit={addManufacturer} className="inline-form">
            <input
              type="text"
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
              placeholder="Enter manufacturer name"
              disabled={manufacturerLoading}
            />
            <button type="submit" disabled={manufacturerLoading || !newManufacturer.trim()}>
              {manufacturerLoading ? "Adding..." : "Add"}
            </button>
          </form>
          <div className="items-list">
            {manufacturers.length === 0 ? (
              <p className="no-data">No manufacturers yet</p>
            ) : (
              manufacturers.map((mfr) => (
                <div key={mfr.id} className="item-row">
                  <span className="item-id">#{mfr.id}</span>
                  <span className="item-desc">{mfr.description}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Asset Specifications */}
        <section className="setup-section wide">
          <h2>Asset Specifications</h2>
          <form onSubmit={addAssetSpec} className="spec-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assetCategoryId">Category *</label>
                <select
                  id="assetCategoryId"
                  name="assetCategoryId"
                  value={specForm.assetCategoryId}
                  onChange={handleSpecChange}
                  disabled={specLoading}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="manufacturerId">Manufacturer *</label>
                <select
                  id="manufacturerId"
                  name="manufacturerId"
                  value={specForm.manufacturerId}
                  onChange={handleSpecChange}
                  disabled={specLoading}
                >
                  <option value="">Select manufacturer</option>
                  {manufacturers.map((mfr) => (
                    <option key={mfr.id} value={mfr.id}>
                      {mfr.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearMake">Year *</label>
                <input
                  type="number"
                  id="yearMake"
                  name="yearMake"
                  value={specForm.yearMake}
                  onChange={handleSpecChange}
                  placeholder="e.g., 2024"
                  min="1900"
                  max="2100"
                  disabled={specLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="model">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={specForm.model}
                  onChange={handleSpecChange}
                  placeholder="e.g., XL500"
                  disabled={specLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <input
                type="text"
                id="description"
                name="description"
                value={specForm.description}
                onChange={handleSpecChange}
                placeholder="e.g., Heavy Duty Excavator"
                disabled={specLoading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={specLoading}>
              {specLoading ? "Adding..." : "Add Asset Specification"}
            </button>
          </form>

          <div className="specs-list">
            {assetSpecs.length === 0 ? (
              <p className="no-data">No asset specifications yet. Add categories and manufacturers first.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Year</th>
                    <th>Model</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {assetSpecs.map((spec) => (
                    <tr key={spec.id}>
                      <td>#{spec.id}</td>
                      <td>{spec.assetCategory?.description}</td>
                      <td>{spec.manufacturer?.description}</td>
                      <td>{spec.yearMake}</td>
                      <td>{spec.model}</td>
                      <td>{spec.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .setup-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #333;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #666;
          margin: 0;
        }

        .global-message {
          max-width: 600px;
          margin: 0 auto 24px;
          padding: 12px 16px;
          border-radius: 4px;
          text-align: center;
          font-weight: 500;
        }

        .global-message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .global-message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .setup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .setup-grid {
            grid-template-columns: 1fr;
          }
        }

        .setup-section {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .setup-section.wide {
          grid-column: 1 / -1;
        }

        .setup-section h2 {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          color: #333;
          border-bottom: 2px solid #0070f3;
          padding-bottom: 8px;
        }

        .inline-form {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .inline-form input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .inline-form input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .inline-form button {
          padding: 8px 16px;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .inline-form button:hover:not(:disabled) {
          background-color: #0060df;
        }

        .inline-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .items-list {
          max-height: 250px;
          overflow-y: auto;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: #fafafa;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .item-id {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          min-width: 30px;
        }

        .item-desc {
          color: #333;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 20px;
          font-size: 14px;
        }

        .spec-form {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
          font-size: 13px;
          color: #333;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0070f3;
        }

        .btn-primary {
          padding: 10px 20px;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0060df;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .specs-list {
          overflow-x: auto;
        }

        .specs-list table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .specs-list th,
        .specs-list td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .specs-list th {
          background: #f5f5f5;
          font-weight: 600;
          color: #333;
        }

        .specs-list tr:hover {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}
