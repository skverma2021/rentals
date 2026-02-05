import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkRentalOverlap, formatDateRange } from "@/lib/rental-validation";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const assetId = searchParams.get("assetId");

    const whereClause: Record<string, unknown> = {
      customer: { agencyId: session.user.agencyId },
    };
    if (customerId) whereClause.customerId = parseInt(customerId);
    if (assetId) whereClause.assetId = parseInt(assetId);

    const rentals = await prisma.assetWithCustomer.findMany({
      where: whereClause,
      include: {
        assets: {
          include: {
            assetSpec: {
              include: {
                manufacturer: true,
                assetCategory: true,
              },
            },
          },
        },
        customer: true,
      },
      orderBy: {
        fromDate: "desc",
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Failed to fetch rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assetId, customerId, ratePerMonth, fromDate, toDate } = body;

    if (!assetId || !customerId || !ratePerMonth || !fromDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const parsedAssetId = parseInt(assetId);
    const parsedFromDate = new Date(fromDate);
    const parsedToDate = toDate ? new Date(toDate) : null;

    // Validate date range
    if (parsedToDate && parsedToDate < parsedFromDate) {
      return NextResponse.json(
        { error: "Return date cannot be before rental start date" },
        { status: 400 }
      );
    }

    // Check for overlapping rentals
    const overlapCheck = await checkRentalOverlap(
      parsedAssetId,
      parsedFromDate,
      parsedToDate
    );

    if (overlapCheck.hasOverlap && overlapCheck.overlappingRental) {
      const overlap = overlapCheck.overlappingRental;
      return NextResponse.json(
        {
          error: `Asset is already rented to ${overlap.customerName} during ${formatDateRange(overlap.fromDate, overlap.toDate)}`,
        },
        { status: 409 }
      );
    }

    const rental = await prisma.assetWithCustomer.create({
      data: {
        assetId: parsedAssetId,
        customerId: parseInt(customerId),
        ratePerMonth: parseFloat(ratePerMonth),
        fromDate: parsedFromDate,
        toDate: parsedToDate,
      },
      include: {
        assets: {
          include: {
            assetSpec: {
              include: {
                manufacturer: true,
                assetCategory: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error("Failed to create rental:", error);
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    );
  }
}
