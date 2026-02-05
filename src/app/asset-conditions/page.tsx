"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ClipboardCheck,
  Filter,
  ListChecks,
  Sparkles,
  Wrench,
  Package,
  HelpCircle,
  Calendar,
  DollarSign,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp
} from "lucide-react";

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

  const getConditionIcon = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("new")) return <Sparkles className="h-4 w-4" />;
    if (lower.includes("repair")) return <Wrench className="h-4 w-4" />;
    if (lower.includes("retired")) return <Package className="h-4 w-4" />;
    if (lower.includes("missing")) return <HelpCircle className="h-4 w-4" />;
    return <ListChecks className="h-4 w-4" />;
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
    <div className="min-h-screen bg-muted/30 p-6">
      <header className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Asset Condition & Value Management</h1>
        </div>
        <p className="text-muted-foreground">Track and update the condition and value of your assets</p>
      </header>

      {message && (
        <Alert 
          variant={message.type === "error" ? "destructive" : "default"} 
          className={`max-w-3xl mx-auto mb-6 ${message.type === "success" ? "border-green-500 text-green-700 bg-green-50" : ""}`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label htmlFor="category" className="text-sm font-medium">Asset Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label htmlFor="manufacturer" className="text-sm font-medium">Manufacturer</Label>
                <select
                  id="manufacturer"
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Manufacturers</option>
                  {manufacturers.map((mfr) => (
                    <option key={mfr.id} value={mfr.id}>
                      {mfr.description}
                    </option>
                  ))}
                </select>
              </div>
              <Badge variant="secondary" className="h-10 px-4 flex items-center">
                {filteredAssets.length} asset(s) found
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select an Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No assets match the current filters.</p>
                  </div>
                ) : (
                  filteredAssets.map((asset) => {
                    const latestCondition = getAssetLatestCondition(asset.id);
                    const latestValue = getAssetLatestValue(asset.id);
                    return (
                      <div
                        key={asset.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedAsset?.id === asset.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        onClick={() => handleAssetSelect(asset)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="text-xs">#{asset.id}</Badge>
                          {latestCondition && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              {getConditionIcon(latestCondition.definedCondition.description)}
                              {latestCondition.definedCondition.description}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">
                          {asset.assetSpec.manufacturer.description} {asset.assetSpec.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {asset.assetSpec.assetCategory.description} • {asset.assetSpec.yearMake}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Acquired: {formatDate(asset.acquiredDate)} • Purchase: {formatCurrency(asset.purchasePrice)}
                        </p>
                        {latestValue && (
                          <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            Current Value: {formatCurrency(latestValue.theCurrentValue)}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Condition & Value Management */}
          {selectedAsset ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {selectedAsset.assetSpec.manufacturer.description} {selectedAsset.assetSpec.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assign Condition Form */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    Assign New Condition
                  </h3>
                  <form onSubmit={handleAssignCondition} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-sm">Condition</Label>
                        <select
                          id="condition"
                          value={selectedCondition}
                          onChange={(e) => setSelectedCondition(e.target.value ? parseInt(e.target.value) : "")}
                          required
                          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select a condition...</option>
                          {definedConditions.map((cond) => (
                            <option key={cond.id} value={cond.id}>
                              {cond.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm">As of Date</Label>
                        <Input
                          type="date"
                          id="date"
                          value={conditionDate}
                          onChange={(e) => setConditionDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading || !selectedCondition} size="sm">
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Assign Condition
                    </Button>
                  </form>
                </div>

                {/* Condition History */}
                <div>
                  <h3 className="font-semibold mb-3">Condition History</h3>
                  {getAssetConditionHistory(selectedAsset.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No condition records yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {getAssetConditionHistory(selectedAsset.id).map((record, index) => (
                        <div 
                          key={record.id} 
                          className={`flex justify-between items-center p-3 rounded-md border
                            ${index === 0 ? "bg-green-50 border-green-200" : "bg-muted/30 border-border"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium flex items-center gap-1">
                              {getConditionIcon(record.definedCondition.description)}
                              {record.definedCondition.description}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.asOnDate)}
                            </span>
                            {index === 0 && (
                              <Badge className="bg-green-500 text-white text-xs">Current</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCondition(record.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Record Value Form */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-800">
                    <TrendingUp className="h-4 w-4" />
                    Record Current Value
                  </h3>
                  <form onSubmit={handleAssignValue} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="value" className="text-sm">Current Value ($)</Label>
                        <Input
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
                      <div className="space-y-2">
                        <Label htmlFor="valueDate" className="text-sm">As of Date</Label>
                        <Input
                          type="date"
                          id="valueDate"
                          value={valueDate}
                          onChange={(e) => setValueDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isValueLoading || !newValue} 
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isValueLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Record Value
                    </Button>
                  </form>
                </div>

                {/* Value History */}
                <div>
                  <h3 className="font-semibold mb-3">Value History</h3>
                  {getAssetValueHistory(selectedAsset.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No value records yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {getAssetValueHistory(selectedAsset.id).map((record, index) => (
                        <div 
                          key={record.id} 
                          className={`flex justify-between items-center p-3 rounded-md border
                            ${index === 0 ? "bg-yellow-50 border-yellow-200" : "bg-muted/30 border-border"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-green-600 flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(record.theCurrentValue)}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(record.asOnDate)}
                            </span>
                            {index === 0 && (
                              <Badge className="bg-yellow-500 text-white text-xs">Current</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteValue(record.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <ClipboardCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  Select an asset from the list to manage its condition and value.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
