import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  rentals?: Rental[];
  attachments?: CustomerFile[];
}

export interface CustomerFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface Asset {
  id: number;
  specId: number;
  acquiredDate: string;
  purchasePrice: number;
  createdAt: string;
  agencyId?: number;
  assetSpec: {
    id: number;
    description: string;
    model: string;
    yearMake?: number;
    manufacturer: {
      id: number;
      description: string;
    };
    assetCategory: {
      id: number;
      description: string;
    };
  };
  attachments?: AssetFile[];
}

export interface AssetFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface Rental {
  id: number;
  customerId: number;
  assetId: number;
  fromDate: string;
  toDate: string;
  returnedDate?: string;
  dailyRate: number;
  notes?: string;
  createdAt: string;
  asset?: Asset;
  customer?: Customer;
}

export interface AssetSpec {
  id: number;
  description: string;
  model: string;
  yearMake?: number;
  manufacturer: {
    id: number;
    description: string;
  };
  assetCategory: {
    id: number;
    description: string;
  };
}

export interface Category {
  id: number;
  description: string;
}

export interface Manufacturer {
  id: number;
  description: string;
}

export interface DefinedCondition {
  id: number;
  description: string;
}

// Query Keys
export const queryKeys = {
  customers: ["customers"] as const,
  customer: (id: number) => ["customers", id] as const,
  assets: ["assets"] as const,
  asset: (id: number) => ["assets", id] as const,
  assetSpecs: ["assetSpecs"] as const,
  categories: ["categories"] as const,
  manufacturers: ["manufacturers"] as const,
  rentals: ["rentals"] as const,
  rental: (id: number) => ["rentals", id] as const,
  definedConditions: ["definedConditions"] as const,
  assetConditions: ["assetConditions"] as const,
  assetValues: ["assetValues"] as const,
};

// Fetch functions
const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};

// Customer Hooks
export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: () => fetchJson<Customer[]>("/api/customers"),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => fetchJson<Customer>(`/api/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Customer, "id" | "createdAt">) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Customer> }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update customer");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

// Asset Hooks
export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets,
    queryFn: () => fetchJson<Asset[]>("/api/assets"),
  });
}

export function useAssetSpecs() {
  return useQuery({
    queryKey: queryKeys.assetSpecs,
    queryFn: () => fetchJson<AssetSpec[]>("/api/asset-specs"),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { specId: number; acquiredDate: string; purchasePrice: number }) => {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create asset");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
    },
  });
}

// Rental Hooks
export function useRentals() {
  return useQuery({
    queryKey: queryKeys.rentals,
    queryFn: () => fetchJson<Rental[]>("/api/asset-rentals"),
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      customerId: number;
      assetId: number;
      fromDate: string;
      toDate: string;
      dailyRate: number;
      notes?: string;
    }) => {
      const response = await fetch("/api/asset-rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create rental");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
    },
  });
}

export function useReturnRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, returnedDate }: { id: number; returnedDate: string }) => {
      const response = await fetch(`/api/asset-rentals/${id}/return`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnedDate }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to return rental");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

export function useDeleteRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/asset-rentals/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete rental");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => fetchJson<Category[]>("/api/asset-categories"),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { description: string }) => {
      const response = await fetch("/api/asset-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

// Manufacturer Hooks
export function useManufacturers() {
  return useQuery({
    queryKey: queryKeys.manufacturers,
    queryFn: () => fetchJson<Manufacturer[]>("/api/manufacturers"),
  });
}

export function useCreateManufacturer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { description: string }) => {
      const response = await fetch("/api/manufacturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create manufacturer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manufacturers });
    },
  });
}

// Defined Conditions Hooks
export function useDefinedConditions() {
  return useQuery({
    queryKey: queryKeys.definedConditions,
    queryFn: () => fetchJson<DefinedCondition[]>("/api/defined-conditions"),
  });
}

// Asset Conditions Hooks
export function useAssetConditions() {
  return useQuery({
    queryKey: queryKeys.assetConditions,
    queryFn: () => fetchJson<unknown[]>("/api/asset-current-conditions"),
  });
}

// Asset Values Hooks
export function useAssetValues() {
  return useQuery({
    queryKey: queryKeys.assetValues,
    queryFn: () => fetchJson<unknown[]>("/api/asset-current-values"),
  });
}
