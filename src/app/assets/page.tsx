"use client";

import { useState, useEffect } from "react";
import AssetForm from "@/components/forms/AssetForm";
import AssetFileUpload from "@/components/forms/AssetFileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Paperclip, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileImage,
  FileVideo,
  FileText,
  File
} from "lucide-react";

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
    if (fileType.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (fileType.startsWith("video/")) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
        </div>
        <p className="text-muted-foreground">Create and manage your rental assets</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg border-b-2 border-primary pb-2">
              Add New Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert 
                variant={message.type === "error" ? "destructive" : "default"} 
                className={`mb-4 ${message.type === "success" ? "border-green-500 text-green-700 bg-green-50" : ""}`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <AssetForm
              assetSpecs={assetSpecs}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg border-b-2 border-primary pb-2">
              Existing Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assets found. Create your first asset using the form.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {assets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="bg-muted/50 border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">#{asset.id}</span>
                      <Badge variant="secondary" className="text-xs">
                        {asset.assetSpec.assetCategory?.description}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {asset.assetSpec.description}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {asset.assetSpec.manufacturer?.description} - {asset.assetSpec.model}
                    </p>
                    <div className="flex justify-between text-sm pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(asset.acquiredDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{formatCurrency(asset.purchasePrice).replace("$", "")}</span>
                      </div>
                    </div>
                    
                    {/* Attachments Section */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachments ({asset.attachments?.length || 0})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                          className="text-xs h-7 px-2"
                        >
                          {selectedAsset?.id === asset.id ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Manage
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Thumbnail previews */}
                      {asset.attachments && asset.attachments.length > 0 && (
                        <div className="flex gap-2 flex-wrap items-center">
                          {asset.attachments.slice(0, 4).map((file) => (
                            <a
                              key={file.id}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-12 h-12 rounded border border-border bg-background flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                              title={file.fileName}
                            >
                              {file.fileType.startsWith("image/") ? (
                                <img 
                                  src={file.fileUrl} 
                                  alt={file.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getFileIcon(file.fileType)
                              )}
                            </a>
                          ))}
                          {asset.attachments.length > 4 && (
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                              +{asset.attachments.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* File upload section when expanded */}
                      {selectedAsset?.id === asset.id && (
                        <div className="mt-3 p-3 bg-background rounded-lg border border-border">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
