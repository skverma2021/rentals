"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Settings2, 
  Plus, 
  FolderOpen, 
  Factory, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

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
    <div className="min-h-screen bg-muted/30 p-6">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Settings2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Setup & Configuration</h1>
        </div>
        <p className="text-muted-foreground">Configure categories, manufacturers, and asset specifications</p>
      </header>

      {message && (
        <Alert 
          variant={message.type === "error" ? "destructive" : "default"} 
          className={`max-w-xl mx-auto mb-6 ${message.type === "success" ? "border-green-500 text-green-700 bg-green-50" : ""}`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Asset Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 border-b-2 border-primary pb-2">
              <FolderOpen className="h-5 w-5" />
              Asset Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCategory} className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                disabled={categoryLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={categoryLoading || !newCategory.trim()}>
                {categoryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </form>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {categories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No categories yet</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <Badge variant="outline" className="text-xs">#{cat.id}</Badge>
                    <span className="text-foreground">{cat.description}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manufacturers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 border-b-2 border-primary pb-2">
              <Factory className="h-5 w-5" />
              Manufacturers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addManufacturer} className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newManufacturer}
                onChange={(e) => setNewManufacturer(e.target.value)}
                placeholder="Enter manufacturer name"
                disabled={manufacturerLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={manufacturerLoading || !newManufacturer.trim()}>
                {manufacturerLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </form>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {manufacturers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No manufacturers yet</p>
              ) : (
                manufacturers.map((mfr) => (
                  <div key={mfr.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <Badge variant="outline" className="text-xs">#{mfr.id}</Badge>
                    <span className="text-foreground">{mfr.description}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Specifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 border-b-2 border-primary pb-2">
              <FileSpreadsheet className="h-5 w-5" />
              Asset Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addAssetSpec} className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetCategoryId" className="text-sm font-semibold">Category *</Label>
                  <select
                    id="assetCategoryId"
                    name="assetCategoryId"
                    value={specForm.assetCategoryId}
                    onChange={handleSpecChange}
                    disabled={specLoading}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturerId" className="text-sm font-semibold">Manufacturer *</Label>
                  <select
                    id="manufacturerId"
                    name="manufacturerId"
                    value={specForm.manufacturerId}
                    onChange={handleSpecChange}
                    disabled={specLoading}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearMake" className="text-sm font-semibold">Year *</Label>
                  <Input
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
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-semibold">Model *</Label>
                  <Input
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
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description *</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  value={specForm.description}
                  onChange={handleSpecChange}
                  placeholder="e.g., Heavy Duty Excavator"
                  disabled={specLoading}
                />
              </div>
              <Button type="submit" disabled={specLoading}>
                {specLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Asset Specification
              </Button>
            </form>

            <div className="rounded-md border overflow-x-auto">
              {assetSpecs.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">
                  No asset specifications yet. Add categories and manufacturers first.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead className="w-20">Year</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assetSpecs.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">#{spec.id}</Badge>
                        </TableCell>
                        <TableCell>{spec.assetCategory?.description}</TableCell>
                        <TableCell>{spec.manufacturer?.description}</TableCell>
                        <TableCell>{spec.yearMake}</TableCell>
                        <TableCell>{spec.model}</TableCell>
                        <TableCell>{spec.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
