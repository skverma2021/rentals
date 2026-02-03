"use client";

import { useState, useEffect } from "react";
import AssetForm from "@/components/forms/AssetForm";
import AssetFileUpload from "@/components/forms/AssetFileUpload";

interface AssetFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

interface AssetSpec {
  id: number;
  description: string;
  model: string;
  manufacturer: {
    description: string;
  };
  assetCategory: {
    description: string;
  };
}

interface Asset {
  id: number;
  specId: number;
  acquiredDate: string;
  purchasePrice: number;
  createdAt: string;
  assetSpec: AssetSpec;
  attachments: AssetFile[];
}

export default function AssetsPage() {
  const [assetSpecs, setAssetSpecs] = useState<AssetSpec[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssetSpecs();
    fetchAssets();
  }, []);

  const fetchAssetSpecs = async () => {
    try {
      const response = await fetch("/api/asset-specs");
      if (response.ok) {
        const data = await response.json();
        setAssetSpecs(data);
      }
    } catch (error) {
      console.error("Failed to fetch asset specs:", error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    }
  };

  const handleSubmit = async (formData: {
    specId: number | "";
    acquiredDate: string;
    purchasePrice: number | "";
  }) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Asset created successfully!" });
        fetchAssets();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to create asset" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
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

  const handleAssetFilesChange = (assetId: number, files: AssetFile[]) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId ? { ...asset, attachments: files } : asset
      )
    );
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset((prev) => (prev ? { ...prev, attachments: files } : null));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType.includes("pdf")) return "📄";
    return "📎";
  };

  return (
    <div className="assets-page">
      <header className="page-header">
        <h1>Asset Management</h1>
        <p>Create and manage your rental assets</p>
      </header>

      <div className="content-grid">
        <section className="form-section">
          <h2>Add New Asset</h2>
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <AssetForm
            assetSpecs={assetSpecs}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </section>

        <section className="list-section">
          <h2>Existing Assets</h2>
          {assets.length === 0 ? (
            <p className="no-data">No assets found. Create your first asset using the form.</p>
          ) : (
            <div className="assets-list">
              {assets.map((asset) => (
                <div key={asset.id} className="asset-card">
                  <div className="asset-header">
                    <span className="asset-id">#{asset.id}</span>
                    <span className="asset-category">
                      {asset.assetSpec.assetCategory?.description}
                    </span>
                  </div>
                  <h3>{asset.assetSpec.description}</h3>
                  <p className="asset-model">
                    {asset.assetSpec.manufacturer?.description} - {asset.assetSpec.model}
                  </p>
                  <div className="asset-details">
                    <div>
                      <span className="label">Acquired:</span>
                      <span>{formatDate(asset.acquiredDate)}</span>
                    </div>
                    <div>
                      <span className="label">Price:</span>
                      <span className="price">{formatCurrency(asset.purchasePrice)}</span>
                    </div>
                  </div>
                  
                  {/* Attachments Section */}
                  <div className="attachments-section">
                    <div className="attachments-header">
                      <span className="attachments-label">
                        📎 Attachments ({asset.attachments?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                        className="toggle-attachments-btn"
                      >
                        {selectedAsset?.id === asset.id ? "Hide" : "Manage"}
                      </button>
                    </div>
                    
                    {/* Thumbnail previews */}
                    {asset.attachments && asset.attachments.length > 0 && (
                      <div className="attachments-preview">
                        {asset.attachments.slice(0, 4).map((file) => (
                          <a
                            key={file.id}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-thumb"
                            title={file.fileName}
                          >
                            {file.fileType.startsWith("image/") ? (
                              <img src={file.fileUrl} alt={file.fileName} />
                            ) : (
                              <span className="file-icon">{getFileIcon(file.fileType)}</span>
                            )}
                          </a>
                        ))}
                        {asset.attachments.length > 4 && (
                          <span className="more-files">+{asset.attachments.length - 4}</span>
                        )}
                      </div>
                    )}
                    
                    {/* File upload section when expanded */}
                    {selectedAsset?.id === asset.id && (
                      <div className="attachment-upload-panel">
                        <AssetFileUpload
                          assetId={asset.id}
                          existingFiles={asset.attachments || []}
                          onFilesChange={(files) => handleAssetFilesChange(asset.id, files)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .assets-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 32px;
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

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-section,
        .list-section {
          background: #fff;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .form-section h2,
        .list-section h2 {
          margin: 0 0 20px 0;
          font-size: 1.25rem;
          color: #333;
          border-bottom: 2px solid #0070f3;
          padding-bottom: 8px;
        }

        .message {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .no-data {
          text-align: center;
          color: #666;
          padding: 40px 20px;
        }

        .assets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 800px;
          overflow-y: auto;
        }

        .asset-card {
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 16px;
          transition: box-shadow 0.2s;
        }

        .asset-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .asset-id {
          font-size: 12px;
          color: #999;
          font-weight: 600;
        }

        .asset-category {
          font-size: 11px;
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .asset-card h3 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          color: #333;
        }

        .asset-model {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #666;
        }

        .asset-details {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .asset-details .label {
          color: #999;
          margin-right: 4px;
        }

        .asset-details .price {
          font-weight: 600;
          color: #2e7d32;
        }

        .attachments-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .attachments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .attachments-label {
          font-size: 13px;
          color: #666;
        }

        .toggle-attachments-btn {
          padding: 4px 12px;
          font-size: 12px;
          background: #e3f2fd;
          color: #1976d2;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .toggle-attachments-btn:hover {
          background: #bbdefb;
        }

        .attachments-preview {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .attachment-thumb {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ddd;
          transition: transform 0.2s;
        }

        .attachment-thumb:hover {
          transform: scale(1.1);
        }

        .attachment-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .attachment-thumb .file-icon {
          font-size: 24px;
        }

        .more-files {
          font-size: 12px;
          color: #666;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .attachment-upload-panel {
          margin-top: 12px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }
      `}</style>
    </div>
  );
}
