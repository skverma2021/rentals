import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Using default Helvetica font (built into React-PDF)
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e40af",
  },
  companyName: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: "#64748b",
    fontWeight: 400,
  },
  value: {
    flex: 1,
    color: "#1e293b",
    fontWeight: 400,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontWeight: 600,
    color: "#475569",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableCell: {
    color: "#334155",
  },
  colAsset: { width: "35%" },
  colDescription: { width: "25%" },
  colPeriod: { width: "20%" },
  colRate: { width: "10%", textAlign: "right" },
  colTotal: { width: "10%", textAlign: "right" },
  totalsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    color: "#64748b",
  },
  totalValue: {
    color: "#1e293b",
    fontWeight: 600,
  },
  grandTotal: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e40af",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  termsSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
  },
  termsText: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusReturned: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
  },
});

interface RentalItem {
  id: number;
  assetDescription: string;
  assetModel: string;
  manufacturer: string;
  fromDate: string;
  toDate: string;
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  status: "active" | "returned";
  returnedDate?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  invoicePeriod?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  agency: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  rentals: RentalItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes?: string;
  currencySymbol?: string;
}

interface RentalInvoiceProps {
  data: InvoiceData;
}

export default function RentalInvoice({ data }: RentalInvoiceProps) {
  // Helvetica doesn't support special currency symbols like ₹, ₱, etc.
  // Map special symbols to text alternatives for PDF rendering
  const currencySymbolMap: Record<string, string> = {
    "₹": "Rs ",  // Indian Rupee
    "₱": "PHP ", // Philippine Peso
    "₩": "KRW ", // Korean Won
    "₴": "UAH ", // Ukrainian Hryvnia
    "₺": "TRY ", // Turkish Lira
    "₫": "VND ", // Vietnamese Dong
    "৳": "BDT ", // Bangladeshi Taka
    "₨": "Rs ",  // Various Rupee currencies
  };
  
  const rawSymbol = data.currencySymbol || "$";
  const currencySymbol = currencySymbolMap[rawSymbol] || rawSymbol;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currencySymbol}${formatted}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>{data.agency.name}</Text>
            {data.agency.address && (
              <Text style={styles.companyName}>{data.agency.address}</Text>
            )}
            {data.agency.email && (
              <Text style={styles.companyName}>{data.agency.email}</Text>
            )}
            {data.agency.phone && (
              <Text style={styles.companyName}>{data.agency.phone}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            {data.invoicePeriod && (
              <Text style={styles.invoiceDate}>Period: {data.invoicePeriod}</Text>
            )}
            <Text style={styles.invoiceDate}>Date: {formatDate(data.invoiceDate)}</Text>
            <Text style={styles.invoiceDate}>Due: {formatDate(data.dueDate)}</Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Customer Name:</Text>
            <Text style={styles.value}>{data.customer.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.customer.email}</Text>
          </View>
          {data.customer.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{data.customer.phone}</Text>
            </View>
          )}
        </View>

        {/* Rental Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colAsset]}>Asset</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colPeriod]}>Rental Period</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate/Day</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {data.rentals.map((rental, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.colAsset}>
                  <Text style={styles.tableCell}>
                    {rental.manufacturer} {rental.assetModel}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {rental.assetDescription}
                </Text>
                <View style={styles.colPeriod}>
                  <Text style={styles.tableCell}>
                    {formatDate(rental.fromDate)} - {formatDate(rental.toDate)}
                  </Text>
                  <Text style={[styles.tableCell, { fontSize: 8, color: "#94a3b8" }]}>
                    ({rental.totalDays} days)
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.colRate]}>
                  {formatCurrency(rental.dailyRate)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal, { fontWeight: 600 }]}>
                  {formatCurrency(rental.totalAmount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({data.taxRate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total Due:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            1. Payment is due within 30 days of invoice date.{"\n"}
            2. Late fees may apply for overdue payments.{"\n"}
            3. Assets must be returned in the same condition as received.{"\n"}
            4. Customer is responsible for any damage during the rental period.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! | {data.agency.name} | Generated on {formatDate(new Date().toISOString())}
        </Text>
      </Page>
    </Document>
  );
}

// Export types for use in other files
export type { InvoiceData, RentalItem };
