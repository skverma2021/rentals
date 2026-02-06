import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrencyFromCountry } from "@/lib/countryCurrency";

// GET - Fetch agency info with currency derived from country
export async function GET() {
  try {
    // Get the logged-in user's session to identify their agency
    const session = await auth();
    
    // Default to agency 1 for single-tenant mode or if not logged in
    let agencyId = 1;
    
    if (session?.user?.email) {
      // Find the user's agency
      const user = await prisma.authUsers.findUnique({
        where: { email: session.user.email },
        select: { agencyId: true },
      });
      if (user) {
        agencyId = user.agencyId;
      }
    }

    // Get agency details
    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
      include: {
        settings: true,
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    // Derive currency from agency's country
    const currency = getCurrencyFromCountry(agency.countryRegion);

    // Get or create settings (for tax rate and invoice prefix)
    let settings = agency.settings;
    if (!settings) {
      settings = await prisma.agencySettings.create({
        data: {
          agencyId,
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
          currencyName: currency.name,
          defaultTaxRate: 0, // Default to 0, agency should configure
          invoicePrefix: "INV",
        },
      });
    } else {
      // Update currency based on country (in case country changed)
      settings = await prisma.agencySettings.update({
        where: { agencyId },
        data: {
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
          currencyName: currency.name,
        },
      });
    }

    // Return agency info with derived currency
    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        contactEmail: agency.contactEmail,
        contactPhone: agency.contactPhone,
        address: agency.address,
        city: agency.city,
        stateProvince: agency.stateProvince,
        zipPostalCode: agency.zipPostalCode,
        countryRegion: agency.countryRegion,
      },
      currency,
      settings: {
        defaultTaxRate: settings.defaultTaxRate,
        invoicePrefix: settings.invoicePrefix,
      },
    });
  } catch (error) {
    console.error("Error fetching agency settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch agency settings" },
      { status: 500 }
    );
  }
}

// PUT - Update agency settings (tax rate and invoice prefix only)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    let agencyId = 1;
    
    if (session?.user?.email) {
      const user = await prisma.authUsers.findUnique({
        where: { email: session.user.email },
        select: { agencyId: true },
      });
      if (user) {
        agencyId = user.agencyId;
      }
    }

    const body = await request.json();
    const { defaultTaxRate, invoicePrefix } = body;

    // Get agency to derive currency
    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    const currency = getCurrencyFromCountry(agency.countryRegion);

    // Update or create settings
    const settings = await prisma.agencySettings.upsert({
      where: { agencyId },
      update: {
        ...(defaultTaxRate !== undefined && { defaultTaxRate: parseFloat(defaultTaxRate) }),
        ...(invoicePrefix && { invoicePrefix }),
        // Always sync currency with country
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
        currencyName: currency.name,
      },
      create: {
        agencyId,
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
        currencyName: currency.name,
        defaultTaxRate: defaultTaxRate ? parseFloat(defaultTaxRate) : 0,
        invoicePrefix: invoicePrefix || "INV",
      },
    });

    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        countryRegion: agency.countryRegion,
      },
      currency,
      settings: {
        defaultTaxRate: settings.defaultTaxRate,
        invoicePrefix: settings.invoicePrefix,
      },
    });
  } catch (error) {
    console.error("Error updating agency settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
