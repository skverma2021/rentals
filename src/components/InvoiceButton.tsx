"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import RentalInvoice, { InvoiceData, RentalItem } from "@/components/pdf/RentalInvoice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Download, Calendar, X } from "lucide-react";

interface AgencyInfo {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  stateProvince: string | null;
  zipPostalCode: string | null;
  countryRegion: string | null;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

interface SettingsInfo {
  defaultTaxRate: number;
  invoicePrefix: string;
}

interface AgencySettingsResponse {
  agency: AgencyInfo;
  currency: CurrencyInfo;
  settings: SettingsInfo;
}

interface Rental {
  id: number;
  fromDate: string;
  toDate: string;
  returnedDate?: string;
  dailyRate: number;
  notes?: string;
  asset?: {
    id: number;
    assetSpec: {
      description: string;
      model: string;
      manufacturer: {
        description: string;
      };
    };
  };
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface InvoiceButtonProps {
  customer: Customer;
  rentals: Rental[];
}

// Helper to fetch agency info with currency derived from country
async function fetchAgencyInfo(): Promise<AgencySettingsResponse | null> {
  try {
    const response = await fetch("/api/agency-settings");
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch agency info:", error);
  }
  return null;
}

// Helper to calculate rental days
function calculateDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Helper to calculate days within a specific billing period
function calculateDaysInPeriod(
  rentalFromDate: string,
  rentalToDate: string,
  periodMonth?: number,  // 1-12
  periodYear?: number
): { days: number; periodStart: string; periodEnd: string } {
  const rentalFrom = new Date(rentalFromDate);
  // Handle null/undefined toDate - use today if rental is ongoing
  const rentalTo = rentalToDate ? new Date(rentalToDate) : new Date();
  
  // If no period filter, return full rental period
  if (!periodMonth && !periodYear) {
    return {
      days: calculateDays(rentalFromDate, rentalToDate || new Date().toISOString()),
      periodStart: rentalFromDate,
      periodEnd: rentalToDate || new Date().toISOString(),
    };
  }
  
  // Calculate period boundaries
  const year = periodYear || rentalFrom.getFullYear();
  const month = periodMonth ? periodMonth - 1 : 0; // 0-indexed for Date
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (periodMonth && periodYear) {
    // Specific month and year - this is the main case for monthly invoices
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month + 1, 0); // Last day of month (day 0 of next month)
  } else if (periodYear && !periodMonth) {
    // Full year
    periodStart = new Date(year, 0, 1);
    periodEnd = new Date(year, 11, 31);
  } else {
    // Month only (use rental year)
    periodStart = new Date(rentalFrom.getFullYear(), month, 1);
    periodEnd = new Date(rentalFrom.getFullYear(), month + 1, 0);
  }
  
  // Clamp rental dates to period boundaries
  const effectiveStart = new Date(Math.max(rentalFrom.getTime(), periodStart.getTime()));
  const effectiveEnd = new Date(Math.min(rentalTo.getTime(), periodEnd.getTime()));
  
  // Calculate days (add 1 because both start and end days are billable)
  const days = effectiveStart <= effectiveEnd
    ? Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;
  
  return {
    days,
    periodStart: effectiveStart.toISOString(),
    periodEnd: effectiveEnd.toISOString(),
  };
}

// Format agency address for invoice
function formatAgencyAddress(agency: AgencyInfo): string {
  const parts = [
    agency.address,
    agency.city,
    agency.stateProvince,
    agency.zipPostalCode,
    agency.countryRegion,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function InvoiceButton({ customer, rentals }: InvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Get unique years from rentals for the filter dropdown (only years with actual rentals)
  const rentalYears = [...new Set(rentals.map((r) => new Date(r.fromDate).getFullYear()))].sort((a, b) => b - a);
  
  // Get months that have overlapping rentals for the selected year
  const getMonthsWithRentals = (year: number): number[] => {
    const monthsSet = new Set<number>();
    rentals.forEach((rental) => {
      const from = new Date(rental.fromDate);
      const to = rental.toDate ? new Date(rental.toDate) : new Date();
      // Check each month of the year to see if rental overlaps
      for (let month = 1; month <= 12; month++) {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        if (from <= monthEnd && to >= monthStart) {
          monthsSet.add(month);
        }
      }
    });
    return [...monthsSet].sort((a, b) => a - b);
  };
  
  const rentalMonthsForYear = filterYear ? getMonthsWithRentals(parseInt(filterYear)) : [];
  
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Filter rentals that overlap with the selected period
  const getFilteredRentals = () => {
    if (!filterMonth && !filterYear) return rentals;
    
    return rentals.filter((rental) => {
      const rentalFrom = new Date(rental.fromDate);
      const rentalTo = new Date(rental.toDate);
      
      // Build period boundaries
      const year = filterYear ? parseInt(filterYear) : rentalFrom.getFullYear();
      const month = filterMonth ? parseInt(filterMonth) - 1 : 0;
      
      let periodStart: Date;
      let periodEnd: Date;
      
      if (filterMonth && filterYear) {
        periodStart = new Date(year, month, 1);
        periodEnd = new Date(year, month + 1, 0); // Last day of month
      } else if (filterYear) {
        periodStart = new Date(year, 0, 1);
        periodEnd = new Date(year, 11, 31);
      } else {
        // Month only - check any year
        periodStart = new Date(rentalFrom.getFullYear(), month, 1);
        periodEnd = new Date(rentalFrom.getFullYear(), month + 1, 0);
      }
      
      // Check if rental overlaps with period (rental starts before period ends AND rental ends after period starts)
      return rentalFrom <= periodEnd && rentalTo >= periodStart;
    });
  };

  const generateInvoice = async () => {
    const filteredRentals = getFilteredRentals();
    
    if (filteredRentals.length === 0) {
      alert("No rentals found for the selected period");
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch agency info (includes currency derived from country)
      const agencyData = await fetchAgencyInfo();
      
      const agencyName = agencyData?.agency.name || "Asset Rental Co.";
      const agencyAddress = agencyData ? formatAgencyAddress(agencyData.agency) : "";
      const agencyEmail = agencyData?.agency.contactEmail || "";
      const agencyPhone = agencyData?.agency.contactPhone || "";
      const taxRate = agencyData?.settings.defaultTaxRate || 0;
      const currencySymbol = agencyData?.currency.symbol || "$";
      const invoicePrefix = agencyData?.settings.invoicePrefix || "INV";

      // Transform rentals to invoice items with period-based calculation
      const periodMonth = filterMonth ? parseInt(filterMonth) : undefined;
      const periodYear = filterYear ? parseInt(filterYear) : undefined;
      
      const rentalItems: RentalItem[] = filteredRentals.map((rental) => {
        // Calculate days within the billing period (not full rental period)
        const { days, periodStart, periodEnd } = calculateDaysInPeriod(
          rental.fromDate,
          rental.toDate,
          periodMonth,
          periodYear
        );

        return {
          id: rental.id,
          assetDescription: rental.asset?.assetSpec?.description || "Unknown Asset",
          assetModel: rental.asset?.assetSpec?.model || "",
          manufacturer: rental.asset?.assetSpec?.manufacturer?.description || "",
          fromDate: periodStart,  // Show billing period dates on invoice
          toDate: periodEnd,
          dailyRate: rental.dailyRate,
          totalDays: days,
          totalAmount: days * rental.dailyRate,
          status: rental.returnedDate ? "returned" : "active",
          returnedDate: rental.returnedDate,
        };
      });

      // Calculate totals
      const subtotal = rentalItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      // Generate invoice number with period info if filtered
      let invoiceNumber = `${invoicePrefix}-${customer.id}-${Date.now().toString(36).toUpperCase()}`;
      if (filterMonth || filterYear) {
        const periodSuffix = filterYear + (filterMonth ? `-${filterMonth.padStart(2, "0")}` : "");
        invoiceNumber = `${invoicePrefix}-${customer.id}-${periodSuffix}`;
      }

      // Build period label for the invoice
      const invoicePeriod = filterMonth || filterYear
        ? `${filterMonth ? months.find((m) => m.value === filterMonth)?.label : ""} ${filterYear || ""}`.trim()
        : undefined;

      // Create invoice data with full agency details
      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        invoicePeriod,
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
        },
        agency: {
          name: agencyName,
          address: agencyAddress,
          email: agencyEmail,
          phone: agencyPhone,
        },
        rentals: rentalItems,
        subtotal,
        tax,
        taxRate,
        total,
        currencySymbol,
      };

      // Generate PDF blob
      const blob = await pdf(<RentalInvoice data={invoiceData} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${customer.lastName}-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Close filter dropdown but keep the selected period
      setShowDateFilter(false);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (rentals.length === 0) {
    return null;
  }

  const filteredCount = getFilteredRentals().length;
  const hasFilter = !!(filterMonth || filterYear);
  const filterLabel = hasFilter
    ? `${filterMonth ? months.find((m) => m.value === filterMonth)?.label : ""} ${filterYear || ""}`.trim()
    : "";

  return (
    <div className="relative inline-flex items-center">
      {/* Combined Invoice Button with Date Filter */}
      <div className="flex items-center border rounded-md overflow-hidden">
        <Button
          onClick={generateInvoice}
          disabled={isGenerating || (hasFilter && filteredCount === 0)}
          variant="outline"
          size="sm"
          className="gap-2 rounded-none border-0 border-r"
          title={hasFilter && filteredCount === 0 ? 'No rentals match the selected period' : undefined}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Invoice
              {hasFilter && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {filterLabel}
                </span>
              )}
              {!hasFilter && filteredCount > 1 && (
                <span className="text-xs text-muted-foreground">({filteredCount})</span>
              )}
            </>
          )}
        </Button>
        <Button
          onClick={() => setShowDateFilter(!showDateFilter)}
          variant={hasFilter ? "default" : "ghost"}
          size="sm"
          className={`h-8 px-2 rounded-none border-0 ${hasFilter ? "bg-primary/10 hover:bg-primary/20" : ""}`}
          title="Filter by month/year"
        >
          <Calendar className={`h-4 w-4 ${hasFilter ? "text-primary" : ""}`} />
        </Button>
      </div>

      {showDateFilter && (
        <div className="absolute top-10 right-0 z-50 bg-popover border rounded-lg shadow-lg p-3 min-w-[240px]">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Filter by Period</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowDateFilter(false)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Month</Label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">All months</option>
                {months.map((m) => (
                  <option 
                    key={m.value} 
                    value={m.value}
                    className={filterYear && rentalMonthsForYear.includes(parseInt(m.value)) ? 'font-semibold' : ''}
                  >
                    {m.label}
                    {filterYear && rentalMonthsForYear.includes(parseInt(m.value)) && ' •'}
                  </option>
                ))}
              </select>
              {filterYear && rentalMonthsForYear.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  • = has rentals in {filterYear}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Year</Label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">All years</option>
                {rentalYears.map((y) => {
                  const countForYear = rentals.filter((r) => new Date(r.fromDate).getFullYear() === y).length;
                  return (
                    <option key={y} value={y}>
                      {y} ({countForYear} rental{countForYear !== 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="pt-2 border-t mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs ${filteredCount === 0 && hasFilter ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {filteredCount === 0 && hasFilter
                    ? 'No rentals found for this period'
                    : `${filteredCount} of ${rentals.length} rental${rentals.length !== 1 ? "s" : ""}`}
                </p>
                {(filterMonth || filterYear) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMonth("");
                      setFilterYear("");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export a simpler download button for individual rentals
interface SingleRentalInvoiceProps {
  rental: Rental;
  customer: Customer;
}

export function SingleRentalInvoiceButton({ rental, customer }: SingleRentalInvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvoice = async () => {
    setIsGenerating(true);

    try {
      // Fetch agency info
      const agencyData = await fetchAgencyInfo();
      
      const agencyName = agencyData?.agency.name || "Asset Rental Co.";
      const agencyAddress = agencyData ? formatAgencyAddress(agencyData.agency) : "";
      const agencyEmail = agencyData?.agency.contactEmail || "";
      const agencyPhone = agencyData?.agency.contactPhone || "";
      const taxRate = agencyData?.settings.defaultTaxRate || 0;
      const currencySymbol = agencyData?.currency.symbol || "$";
      const invoicePrefix = agencyData?.settings.invoicePrefix || "INV";

      const days = calculateDays(rental.fromDate, rental.toDate);
      const subtotal = days * rental.dailyRate;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      const invoiceNumber = `${invoicePrefix}-R${rental.id}-${Date.now().toString(36).toUpperCase()}`;

      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
        },
        agency: {
          name: agencyName,
          address: agencyAddress,
          email: agencyEmail,
          phone: agencyPhone,
        },
        rentals: [
          {
            id: rental.id,
            assetDescription: rental.asset?.assetSpec?.description || "Unknown Asset",
            assetModel: rental.asset?.assetSpec?.model || "",
            manufacturer: rental.asset?.assetSpec?.manufacturer?.description || "",
            fromDate: rental.fromDate,
            toDate: rental.toDate,
            dailyRate: rental.dailyRate,
            totalDays: days,
            totalAmount: subtotal,
            status: rental.returnedDate ? "returned" : "active",
            returnedDate: rental.returnedDate,
          },
        ],
        subtotal,
        tax,
        taxRate,
        total,
        currencySymbol,
      };

      const blob = await pdf(<RentalInvoice data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-rental-${rental.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateInvoice}
      disabled={isGenerating}
      variant="ghost"
      size="sm"
      className="h-7 px-2"
      title="Download invoice"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
