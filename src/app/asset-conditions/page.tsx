"use client";

import { useState, useEffect } from "react";

interface AssetCategory {
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
  manufacturer: Manufacturer;
  assetCategory: AssetCategory;
}

interface Asset {
  id: number;
  specId: number;
  acquiredDate: string;
  purchasePrice: number;
  assetSpec: AssetSpec;
}

interface DefinedCondition {
  id: number;
  description: string;
}

interface AssetCurrentCondition {
  id: number;
  assetId: number;
  definedConditionId: number;
  asOnDate: string;
  assets: Asset;
  definedCondition: DefinedCondition;
}

interface AssetCurrentValue {
  id: number;
  assetId: number;
  theCurrentValue: number;
  asOnDate: string;
}

export default function AssetConditionsPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [definedConditions, setDefinedConditions] = useState<DefinedCondition[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [assetConditions, setAssetConditions] = useState<AssetCurrentCondition[]>([]);
  const [assetValues, setAssetValues] = useState<AssetCurrentValue[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | "">("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<number | "">("");
  const [conditionDate, setConditionDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [newValue, setNewValue] = useState<string>("");
  const [valueDate, setValueDate] = useState(new Date().toISOString().split("T")[0]);
  const [isValueLoading, setIsValueLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
    fetchDefinedConditions();
    fetchAssets();
    fetchAssetConditions();
    fetchAssetValues();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [selectedCategory, selectedManufacturer, allAssets]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/asset-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await fetch("/api/manufacturers");
      if (response.ok) {
        const data = await response.json();
        setManufacturers(data);
      }
    } catch (error) {
      console.error("Failed to fetch manufacturers:", error);
    }
  };

  const fetchDefinedConditions = async () => {
    try {
      const response = await fetch("/api/defined-conditions");
      if (response.ok) {
        const data = await response.json();
        setDefinedConditions(data);
      }
    } catch (error) {
      console.error("Failed to fetch defined conditions:", error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      if (response.ok) {
        const data = await response.json();
        setAllAssets(data);
        setFilteredAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    }
  };

  const fetchAssetConditions = async () => {
    try {
      const response = await fetch("/api/asset-current-conditions");
      if (response.ok) {
        const data = await response.json();
        setAssetConditions(data);
      }
    } catch (error) {
      console.error("Failed to fetch asset conditions:", error);
    }
  };

  const fetchAssetValues = async () => {
    try {
      const response = await fetch("/api/asset-current-values");
      if (response.ok) {
        const data = await response.json();
        setAssetValues(data);
      }
    } catch (error) {
      console.error("Failed to fetch asset values:", error);
    }
  };

  const filterAssets = () => {
    let filtered = [...allAssets];
    
    if (selectedCategory) {
      filtered = filtered.filter(
        (asset) => asset.assetSpec.assetCategory.id === selectedCategory
      );
    }
    
    if (selectedManufacturer) {
      filtered = filtered.filter(
        (asset) => asset.assetSpec.manufacturer.id === selectedManufacturer
      );
    }
    
    setFilteredAssets(filtered);
    setSelectedAsset(null);
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setMessage(null);
  };

  const handleAssignCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !selectedCondition) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/asset-current-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          definedConditionId: selectedCondition,
          asOnDate: conditionDate,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Condition assigned successfully!" });
        setSelectedCondition("");
        fetchAssetConditions();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to assign condition" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCondition = async (id: number) => {
    if (!confirm("Are you sure you want to remove this condition record?")) return;

    try {
      const response = await fetch(`/api/asset-current-conditions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Condition record removed!" });
        fetchAssetConditions();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to remove condition" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const handleAssignValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !newValue) return;

    setIsValueLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/asset-current-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          theCurrentValue: parseFloat(newValue),
          asOnDate: valueDate,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Value recorded successfully!" });
        setNewValue("");
        fetchAssetValues();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to record value" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsValueLoading(false);
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (!confirm("Are you sure you want to remove this value record?")) return;

    try {
      const response = await fetch(`/api/asset-current-values/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Value record removed!" });
        fetchAssetValues();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to remove value" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const getAssetLatestValue = (assetId: number) => {
    const values = assetValues
      .filter((v) => v.assetId === assetId)
      .sort((a, b) => new Date(b.asOnDate).getTime() - new Date(a.asOnDate).getTime());
    return values[0] || null;
  };

  const getAssetValueHistory = (assetId: number) => {
    return assetValues
      .filter((v) => v.assetId === assetId)
      .sort((a, b) => new Date(b.asOnDate).getTime() - new Date(a.asOnDate).getTime());
  };

  const getConditionEmoji = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("new")) return "✨";
    if (lower.includes("repair")) return "🔧";
    if (lower.includes("retired")) return "📦";
    if (lower.includes("missing")) return "❓";
    return "📋";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAssetLatestCondition = (assetId: number) => {
    const conditions = assetConditions
      .filter((c) => c.assetId === assetId)
      .sort((a, b) => new Date(b.asOnDate).getTime() - new Date(a.asOnDate).getTime());
    return conditions[0] || null;
  };

  const getAssetConditionHistory = (assetId: number) => {
    return assetConditions
      .filter((c) => c.assetId === assetId)
      .sort((a, b) => new Date(b.asOnDate).getTime() - new Date(a.asOnDate).getTime());
  };

  return (
    <div className="asset-conditions-page">
      <header className="page-header">
        <h1>Asset Condition & Value Management</h1>
        <p>Track and update the condition and value of your assets</p>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="content-layout">
        <section className="filter-section">
          <h2>Filter Assets</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category">Asset Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="manufacturer">Manufacturer</label>
              <select
                id="manufacturer"
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((mfr) => (
                  <option key={mfr.id} value={mfr.id}>
                    {mfr.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-stats">
              <span className="stat-badge">{filteredAssets.length} asset(s) found</span>
            </div>
          </div>
        </section>

        <div className="main-content">
          <section className="assets-list-section">
            <h2>Select an Asset</h2>
            <div className="assets-grid">
              {filteredAssets.length === 0 ? (
                <p className="empty-state">No assets match the current filters.</p>
              ) : (
                filteredAssets.map((asset) => {
                  const latestCondition = getAssetLatestCondition(asset.id);
                  const latestValue = getAssetLatestValue(asset.id);
                  return (
                    <div
                      key={asset.id}
                      className={`asset-card ${selectedAsset?.id === asset.id ? "selected" : ""}`}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <div className="asset-header">
                        <span className="asset-id">#{asset.id}</span>
                        {latestCondition && (
                          <span className="condition-badge">
                            {getConditionEmoji(latestCondition.definedCondition.description)}{" "}
                            {latestCondition.definedCondition.description}
                          </span>
                        )}
                      </div>
                      <h3 className="asset-name">
                        {asset.assetSpec.manufacturer.description} {asset.assetSpec.model}
                      </h3>
                      <p className="asset-details">
                        {asset.assetSpec.assetCategory.description} • {asset.assetSpec.yearMake}
                      </p>
                      <p className="asset-meta">
                        Acquired: {formatDate(asset.acquiredDate)} • Purchase: {formatCurrency(asset.purchasePrice)}
                      </p>
                      {latestValue && (
                        <p className="asset-value">
                          💰 Current Value: {formatCurrency(latestValue.theCurrentValue)}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {selectedAsset && (
            <section className="condition-section">
              <h2>
                Condition for: {selectedAsset.assetSpec.manufacturer.description}{" "}
                {selectedAsset.assetSpec.model}
              </h2>

              <div className="condition-form-card">
                <h3>Assign New Condition</h3>
                <form onSubmit={handleAssignCondition} className="condition-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="condition">Condition</label>
                      <select
                        id="condition"
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value ? parseInt(e.target.value) : "")}
                        required
                      >
                        <option value="">Select a condition...</option>
                        {definedConditions.map((cond) => (
                          <option key={cond.id} value={cond.id}>
                            {getConditionEmoji(cond.description)} {cond.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">As of Date</label>
                      <input
                        type="date"
                        id="date"
                        value={conditionDate}
                        onChange={(e) => setConditionDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading || !selectedCondition} className="submit-btn">
                    {isLoading ? "Assigning..." : "Assign Condition"}
                  </button>
                </form>
              </div>

              <div className="condition-history">
                <h3>Condition History</h3>
                {getAssetConditionHistory(selectedAsset.id).length === 0 ? (
                  <p className="empty-state">No condition records for this asset yet.</p>
                ) : (
                  <div className="history-list">
                    {getAssetConditionHistory(selectedAsset.id).map((record, index) => (
                      <div key={record.id} className={`history-item ${index === 0 ? "latest" : ""}`}>
                        <div className="history-info">
                          <span className="history-condition">
                            {getConditionEmoji(record.definedCondition.description)}{" "}
                            {record.definedCondition.description}
                          </span>
                          <span className="history-date">{formatDate(record.asOnDate)}</span>
                          {index === 0 && <span className="latest-badge">Current</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteCondition(record.id)}
                          className="delete-btn"
                          title="Remove this record"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="value-form-card">
                <h3>💰 Record Current Value</h3>
                <form onSubmit={handleAssignValue} className="condition-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="value">Current Value ($)</label>
                      <input
                        type="number"
                        id="value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="valueDate">As of Date</label>
                      <input
                        type="date"
                        id="valueDate"
                        value={valueDate}
                        onChange={(e) => setValueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isValueLoading || !newValue} className="submit-btn value-btn">
                    {isValueLoading ? "Recording..." : "Record Value"}
                  </button>
                </form>
              </div>

              <div className="value-history">
                <h3>Value History</h3>
                {getAssetValueHistory(selectedAsset.id).length === 0 ? (
                  <p className="empty-state">No value records for this asset yet.</p>
                ) : (
                  <div className="history-list">
                    {getAssetValueHistory(selectedAsset.id).map((record, index) => (
                      <div key={record.id} className={`history-item value-item ${index === 0 ? "latest" : ""}`}>
                        <div className="history-info">
                          <span className="history-value">
                            💰 {formatCurrency(record.theCurrentValue)}
                          </span>
                          <span className="history-date">{formatDate(record.asOnDate)}</span>
                          {index === 0 && <span className="latest-badge value-badge">Current</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteValue(record.id)}
                          className="delete-btn"
                          title="Remove this record"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <style jsx>{`
        .asset-conditions-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #666;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
        }

        .content-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .filter-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .filter-controls {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .filter-group label {
          font-weight: 500;
          color: #333;
          font-size: 0.875rem;
        }

        .filter-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .filter-stats {
          display: flex;
          align-items: center;
        }

        .stat-badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }
        }

        .assets-list-section, .condition-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .assets-list-section h2, .condition-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .assets-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .empty-state {
          color: #666;
          text-align: center;
          padding: 2rem;
        }

        .asset-card {
          padding: 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .asset-card:hover {
          border-color: #3b82f6;
          background: #f0f7ff;
        }

        .asset-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .asset-id {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .condition-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
        }

        .asset-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .asset-details {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .asset-meta {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .condition-form-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .condition-form-card h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .condition-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
          font-size: 0.875rem;
        }

        .form-group select, .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .submit-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #2563eb;
        }

        .submit-btn:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }

        .condition-history h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .history-item.latest {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .history-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .history-condition {
          font-weight: 500;
        }

        .history-date {
          font-size: 0.875rem;
          color: #64748b;
        }

        .latest-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: #22c55e;
          color: white;
          border-radius: 4px;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .delete-btn:hover {
          background: #fecaca;
        }

        .asset-value {
          font-size: 0.875rem;
          color: #059669;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .value-form-card {
          background: #fefce8;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid #fef08a;
        }

        .value-form-card h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #854d0e;
        }

        .value-btn {
          background: #eab308;
        }

        .value-btn:hover {
          background: #ca8a04;
        }

        .value-btn:disabled {
          background: #fde047;
        }

        .value-history h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .value-item.latest {
          background: #fefce8;
          border-color: #fef08a;
        }

        .history-value {
          font-weight: 600;
          color: #059669;
        }

        .value-badge {
          background: #eab308;
        }
      `}</style>
    </div>
  );
}
