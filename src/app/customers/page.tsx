"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Upload, 
  FileText, 
  Image, 
  Home, 
  Paperclip,
  RotateCcw,
  CheckCircle,
  Circle,
  AlertCircle
} from "lucide-react";

interface CustomerFile {
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
  yearMake: number;
  manufacturer: { description: string };
  assetCategory: { description: string };
}

interface Asset {
  id: number;
  purchasePrice: number;
  acquiredDate: string;
  assetSpec: AssetSpec;
}

interface AssetRental {
  id: number;
  assetId: number;
  customerId: number;
  ratePerMonth: number;
  fromDate: string;
  toDate: string | null;
  assets: Asset;
}

interface Customer {
  id: number;
  company: string | null;
  lastName: string;
  firstName: string;
  emailId: string;
  jobTitle: string | null;
  businessPhone: string | null;
  homePhone: string | null;
  mobilePhone: string;
  address: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  countryRegion: string;
  webPage: string | null;
  createdAt: string;
  attachments: CustomerFile[];
  assetWithCustomer: AssetRental[];
}

const emptyForm = {
  company: "",
  lastName: "",
  firstName: "",
  emailId: "",
  jobTitle: "",
  businessPhone: "",
  homePhone: "",
  mobilePhone: "",
  address: "",
  city: "",
  stateProvince: "",
  zipPostalCode: "",
  countryRegion: "",
  webPage: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalAssetId, setRentalAssetId] = useState<number | "">("");
  const [rentalRate, setRentalRate] = useState("");
  const [rentalFromDate, setRentalFromDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchCustomers();
    fetchAssets();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "Customer updated!" : "Customer created!" });
        setFormData(emptyForm);
        setEditingId(null);
        fetchCustomers();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to save customer" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      company: customer.company || "",
      lastName: customer.lastName,
      firstName: customer.firstName,
      emailId: customer.emailId,
      jobTitle: customer.jobTitle || "",
      businessPhone: customer.businessPhone || "",
      homePhone: customer.homePhone || "",
      mobilePhone: customer.mobilePhone,
      address: customer.address,
      city: customer.city,
      stateProvince: customer.stateProvince,
      zipPostalCode: customer.zipPostalCode,
      countryRegion: customer.countryRegion,
      webPage: customer.webPage || "",
    });
    setEditingId(customer.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (response.ok) {
        setMessage({ type: "success", text: "Customer deleted!" });
        fetchCustomers();
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to delete" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || !selectedCustomer) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData();
        formData.append("file", selectedFiles[i]);
        formData.append("customerId", selectedCustomer.id.toString());

        await fetch("/api/customer-files", {
          method: "POST",
          body: formData,
        });
      }
      setSelectedFiles(null);
      fetchCustomers();
      setMessage({ type: "success", text: "Files uploaded!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload files" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;

    try {
      const response = await fetch(`/api/customer-files/${fileId}`, { method: "DELETE" });
      if (response.ok) {
        fetchCustomers();
        setMessage({ type: "success", text: "File deleted!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete file" });
    }
  };

  const handleAddRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !rentalAssetId || !rentalRate) return;

    try {
      const response = await fetch("/api/asset-rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: rentalAssetId,
          customerId: selectedCustomer.id,
          ratePerMonth: rentalRate,
          fromDate: rentalFromDate,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Rental added!" });
        setRentalAssetId("");
        setRentalRate("");
        setShowRentalForm(false);
        fetchCustomers();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to add rental" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const handleDeleteRental = async (rentalId: number) => {
    if (!confirm("Remove this rental?")) return;

    try {
      const response = await fetch(`/api/asset-rentals/${rentalId}`, { method: "DELETE" });
      if (response.ok) {
        fetchCustomers();
        setMessage({ type: "success", text: "Rental removed!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove rental" });
    }
  };

  const handleReturnAsset = async (rentalId: number) => {
    if (!confirm("Mark this asset as returned?")) return;

    try {
      const response = await fetch(`/api/asset-rentals/${rentalId}/return`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnDate: new Date().toISOString() }),
      });
      if (response.ok) {
        fetchCustomers();
        setMessage({ type: "success", text: "Asset marked as returned!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to mark as returned" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to mark asset as returned" });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find((c) => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
    }
  }, [customers, selectedCustomer]);

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          Customer Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage customers, their attachments, and rented assets
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className={`grid gap-6 ${selectedCustomer ? "lg:grid-cols-[400px_1fr_400px]" : "lg:grid-cols-[400px_1fr]"}`}>
        {/* Customer Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? "Edit Customer" : "Add New Customer"}
            </CardTitle>
            <CardDescription>
              {editingId ? "Update customer information" : "Enter customer details below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="emailId">Email *</Label>
                  <Input id="emailId" name="emailId" type="email" value={formData.emailId} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                  <Input id="mobilePhone" name="mobilePhone" value={formData.mobilePhone} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input id="businessPhone" name="businessPhone" value={formData.businessPhone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homePhone">Home Phone</Label>
                  <Input id="homePhone" name="homePhone" value={formData.homePhone} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateProvince">State/Province *</Label>
                  <Input id="stateProvince" name="stateProvince" value={formData.stateProvince} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="zipPostalCode">Zip/Postal Code *</Label>
                  <Input id="zipPostalCode" name="zipPostalCode" value={formData.zipPostalCode} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryRegion">Country *</Label>
                  <Input id="countryRegion" name="countryRegion" value={formData.countryRegion} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webPage">Web Page</Label>
                <Input id="webPage" name="webPage" value={formData.webPage} onChange={handleInputChange} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Saving..." : editingId ? "Update Customer" : "Add Customer"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData(emptyForm); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Customer List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({customers.length})</CardTitle>
            <CardDescription>Click a customer to view attachments and rented assets</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers yet. Add one using the form!
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedCustomer?.id === customer.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        {customer.company && (
                          <p className="text-sm text-muted-foreground">{customer.company}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {customer.attachments.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Paperclip className="h-3 w-3" />
                            {customer.attachments.length}
                          </Badge>
                        )}
                        {customer.assetWithCustomer.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Home className="h-3 w-3" />
                            {customer.assetWithCustomer.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>📧 {customer.emailId}</p>
                      <p>📱 {customer.mobilePhone}</p>
                      <p>📍 {customer.city}, {customer.stateProvince}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Panel */}
        {selectedCustomer && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>{selectedCustomer.firstName} {selectedCustomer.lastName}</CardTitle>
                <CardDescription>Manage attachments and rented assets</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attachments Section */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({selectedCustomer.attachments.length})
                </h4>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFiles || isUploading}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {isUploading ? "..." : "Upload"}
                  </Button>
                </div>
                {selectedCustomer.attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No attachments</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline truncate flex-1"
                        >
                          {file.fileType.startsWith("image/") ? (
                            <Image className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-orange-500" />
                          )}
                          {file.fileName}
                        </a>
                        <span className="text-xs text-muted-foreground mx-2">
                          {formatFileSize(file.fileSize)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rented Assets Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Rented Assets ({selectedCustomer.assetWithCustomer.length})
                  </h4>
                  <Button
                    variant={showRentalForm ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowRentalForm(!showRentalForm)}
                  >
                    {showRentalForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> Add Rental</>}
                  </Button>
                </div>

                {showRentalForm && (
                  <form onSubmit={handleAddRental} className="space-y-3 p-3 rounded-lg bg-muted/50">
                    <select
                      value={rentalAssetId}
                      onChange={(e) => setRentalAssetId(e.target.value ? parseInt(e.target.value) : "")}
                      required
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select an asset...</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          #{asset.id} - {asset.assetSpec.manufacturer.description} {asset.assetSpec.model}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Rate/month"
                        value={rentalRate}
                        onChange={(e) => setRentalRate(e.target.value)}
                        step="0.01"
                        min="0"
                        required
                      />
                      <Input
                        type="date"
                        value={rentalFromDate}
                        onChange={(e) => setRentalFromDate(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full">
                      Add Rental
                    </Button>
                  </form>
                )}

                {selectedCustomer.assetWithCustomer.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No assets rented to this customer</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.assetWithCustomer.map((rental) => (
                      <div
                        key={rental.id}
                        className={`p-3 rounded-lg border ${
                          rental.toDate ? "bg-muted/30 border-muted" : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {rental.assets.assetSpec.manufacturer.description} {rental.assets.assetSpec.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rental.assets.assetSpec.assetCategory.description}
                            </p>
                          </div>
                          <Badge variant={rental.toDate ? "secondary" : "default"} className="gap-1">
                            {rental.toDate ? (
                              <><CheckCircle className="h-3 w-3" /> Returned</>
                            ) : (
                              <><Circle className="h-3 w-3" /> Active</>
                            )}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(rental.ratePerMonth)}/mo</span>
                          <span>From: {formatDate(rental.fromDate)}</span>
                          {rental.toDate && <span>To: {formatDate(rental.toDate)}</span>}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {!rental.toDate && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleReturnAsset(rental.id)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Return
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRental(rental.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
