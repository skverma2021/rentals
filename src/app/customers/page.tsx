"use client";

import { useState, useEffect } from "react";

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
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Rental state
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Update selected customer when customers list changes
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find((c) => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
    }
  }, [customers, selectedCustomer]);

  return (
    <div className="customers-page">
      <header className="page-header">
        <h1>Customer Management</h1>
        <p>Manage customers, their attachments, and rented assets</p>
      </header>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className={`content-layout ${selectedCustomer ? "has-details" : ""}`}>
        {/* Customer Form */}
        <section className="form-section">
          <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input name="emailId" type="email" value={formData.emailId} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Mobile Phone *</label>
                <input name="mobilePhone" value={formData.mobilePhone} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input name="company" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Business Phone</label>
                <input name="businessPhone" value={formData.businessPhone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Home Phone</label>
                <input name="homePhone" value={formData.homePhone} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Address *</label>
              <input name="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>State/Province *</label>
                <input name="stateProvince" value={formData.stateProvince} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip/Postal Code *</label>
                <input name="zipPostalCode" value={formData.zipPostalCode} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input name="countryRegion" value={formData.countryRegion} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Web Page</label>
              <input name="webPage" value={formData.webPage} onChange={handleInputChange} />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? "Saving..." : editingId ? "Update Customer" : "Add Customer"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Customer List */}
        <section className="list-section">
          <h2>Customers ({customers.length})</h2>
          <p className="list-hint">Click a customer to view attachments and rented assets</p>
          <div className="customer-list">
            {customers.length === 0 ? (
              <p className="empty-state">No customers yet. Add one above!</p>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`customer-card ${selectedCustomer?.id === customer.id ? "selected" : ""}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="customer-header">
                    <h3>{customer.firstName} {customer.lastName}</h3>
                    <div className="badges">
                      {customer.attachments.length > 0 && (
                        <span className="badge files">📎 {customer.attachments.length}</span>
                      )}
                      {customer.assetWithCustomer.length > 0 && (
                        <span className="badge rentals">🏠 {customer.assetWithCustomer.length}</span>
                      )}
                    </div>
                  </div>
                  {customer.company && <p className="company">{customer.company}</p>}
                  <p className="contact">📧 {customer.emailId}</p>
                  <p className="contact">📱 {customer.mobilePhone}</p>
                  <p className="location">{customer.city}, {customer.stateProvince}</p>
                  <div className="card-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(customer); }} className="edit-btn">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Customer Details Panel */}
        {selectedCustomer && (
          <section className="details-section">
            <div className="details-header">
              <h2>
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
              <button className="close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            <p className="details-hint">Manage attachments and rented assets below</p>

            {/* Attachments */}
            <div className="detail-card attachments-card">
              <h3>📎 Attachments ({selectedCustomer.attachments.length})</h3>
              <div className="file-upload-area">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFiles || isUploading}
                  className="upload-btn"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {selectedCustomer.attachments.length === 0 ? (
                <p className="empty-state">No attachments</p>
              ) : (
                <div className="file-list">
                  {selectedCustomer.attachments.map((file) => (
                    <div key={file.id} className="file-item">
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        {file.fileType.startsWith("image/") ? "🖼️" : "📄"} {file.fileName}
                      </a>
                      <span className="file-size">{formatFileSize(file.fileSize)}</span>
                      <button onClick={() => handleDeleteFile(file.id)} className="delete-file-btn">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rented Assets */}
            <div className="detail-card rentals-card">
              <h3>
                🏠 Rented Assets ({selectedCustomer.assetWithCustomer.length})
                <button onClick={() => setShowRentalForm(!showRentalForm)} className="add-rental-btn">
                  {showRentalForm ? "Cancel" : "+ Add Rental"}
                </button>
              </h3>

              {showRentalForm && (
                <form onSubmit={handleAddRental} className="rental-form">
                  <select
                    value={rentalAssetId}
                    onChange={(e) => setRentalAssetId(e.target.value ? parseInt(e.target.value) : "")}
                    required
                  >
                    <option value="">Select an asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        #{asset.id} - {asset.assetSpec.manufacturer.description} {asset.assetSpec.model}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Rate/month"
                    value={rentalRate}
                    onChange={(e) => setRentalRate(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                  <input
                    type="date"
                    value={rentalFromDate}
                    onChange={(e) => setRentalFromDate(e.target.value)}
                    required
                  />
                  <button type="submit" className="submit-rental-btn">Add</button>
                </form>
              )}

              {selectedCustomer.assetWithCustomer.length === 0 ? (
                <p className="empty-state">No assets rented to this customer</p>
              ) : (
                <div className="rental-list">
                  {selectedCustomer.assetWithCustomer.map((rental) => (
                    <div key={rental.id} className="rental-item">
                      <div className="rental-info">
                        <strong>
                          {rental.assets.assetSpec.manufacturer.description} {rental.assets.assetSpec.model}
                        </strong>
                        <span className="rental-category">
                          {rental.assets.assetSpec.assetCategory.description}
                        </span>
                      </div>
                      <div className="rental-meta">
                        <span>{formatCurrency(rental.ratePerMonth)}/mo</span>
                        <span>From: {formatDate(rental.fromDate)}</span>
                      </div>
                      <button onClick={() => handleDeleteRental(rental.id)} className="delete-rental-btn">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .customers-page {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header { margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 2rem; color: #1a1a1a; margin-bottom: 0.5rem; }
        .page-header p { color: #666; }
        .message { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .message.success { background: #d4edda; color: #155724; }
        .message.error { background: #f8d7da; color: #721c24; }
        
        .content-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1.5rem;
        }
        .content-layout.has-details {
          grid-template-columns: 350px 1fr 400px;
        }
        @media (max-width: 1200px) {
          .content-layout { grid-template-columns: 1fr 1fr; }
          .content-layout.has-details { grid-template-columns: 1fr 1fr; }
          .details-section { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .content-layout { grid-template-columns: 1fr; }
          .content-layout.has-details { grid-template-columns: 1fr; }
          .details-section { grid-column: span 1; }
        }

        .form-section, .list-section, .details-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .form-section h2, .list-section h2, .details-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .customer-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 0.8rem; font-weight: 500; color: #555; }
        .form-group input {
          padding: 0.6rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        .form-group input:focus { outline: none; border-color: #3b82f6; }
        .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
        .submit-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .submit-btn:hover { background: #2563eb; }
        .submit-btn:disabled { background: #93c5fd; }
        .cancel-btn {
          background: #e2e8f0;
          color: #475569;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .list-hint {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        .customer-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 600px; overflow-y: auto; }
        .empty-state { color: #666; text-align: center; padding: 2rem; }
        .customer-card {
          padding: 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .customer-card:hover { border-color: #3b82f6; }
        .customer-card.selected { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 1px #3b82f6; }
        .customer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .customer-header h3 { font-size: 1rem; margin: 0; }
        .badges { display: flex; gap: 0.5rem; }
        .badge { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
        .badge.files { background: #dbeafe; color: #1d4ed8; }
        .badge.rentals { background: #dcfce7; color: #166534; }
        .company { font-size: 0.85rem; color: #64748b; margin: 0.25rem 0; }
        .contact { font-size: 0.8rem; color: #475569; margin: 0.15rem 0; }
        .location { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
        .card-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
        .edit-btn, .delete-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .edit-btn { background: #e2e8f0; color: #475569; }
        .delete-btn { background: #fee2e2; color: #dc2626; }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .details-header h2 {
          margin-bottom: 0;
        }
        .details-hint {
          color: #64748b;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .close-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 1.25rem;
          cursor: pointer;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .detail-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
        }
        .detail-card.attachments-card {
          border-left: 4px solid #3b82f6;
        }
        .detail-card.rentals-card {
          border-left: 4px solid #22c55e;
        }
        .detail-card h3 {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #1e293b;
        }
        
        .file-upload-area {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .file-upload-area input { flex: 1; font-size: 0.85rem; }
        .upload-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .upload-btn:disabled { background: #93c5fd; }
        .file-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .file-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
        }
        .file-item a { flex: 1; color: #3b82f6; text-decoration: none; font-size: 0.85rem; }
        .file-size { font-size: 0.75rem; color: #94a3b8; }
        .delete-file-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
        }

        .add-rental-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .rental-form {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .rental-form select, .rental-form input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .submit-rental-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .rental-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .rental-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          border-left: 4px solid #22c55e;
        }
        .rental-info { flex: 1; }
        .rental-info strong { display: block; font-size: 0.9rem; }
        .rental-category { font-size: 0.75rem; color: #64748b; }
        .rental-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.8rem;
          color: #475569;
        }
        .delete-rental-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
