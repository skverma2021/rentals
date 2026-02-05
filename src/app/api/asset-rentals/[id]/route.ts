import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkRentalOverlap, formatDateRange } from "@/lib/rental-validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const rentalId = parseInt(id);

    const rental = await prisma.assetWithCustomer.findFirst({
      where: { 
        id: rentalId,
        customer: { agencyId: session.user.agencyId },
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

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Failed to fetch rental:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const rentalId = parseInt(id);

    // Verify rental belongs to agency
    const existing = await prisma.assetWithCustomer.findFirst({
      where: { id: rentalId, customer: { agencyId: session.user.agencyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    const body = await request.json();
    const { ratePerMonth, fromDate, toDate } = body;

    const parsedFromDate = new Date(fromDate);
    const parsedToDate = toDate ? new Date(toDate) : null;

    // Validate toDate is not before fromDate
    if (parsedToDate && parsedToDate < parsedFromDate) {
      return NextResponse.json(
        { error: "Return date cannot be before rental start date" },
        { status: 400 }
      );
    }

    // Check for overlapping rentals (exclude current rental)
    const overlapCheck = await checkRentalOverlap(
      existing.assetId,
      parsedFromDate,
      parsedToDate,
      rentalId // Exclude this rental from overlap check
    );

    if (overlapCheck.hasOverlap && overlapCheck.overlappingRental) {
      const overlap = overlapCheck.overlappingRental;
      return NextResponse.json(
        {
          error: `This asset is already rented during the requested period. Conflicting rental: ${formatDateRange(overlap.fromDate, overlap.toDate)}`,
          conflictingRentalId: overlap.id,
        },
        { status: 409 }
      );
    }

    const rental = await prisma.assetWithCustomer.update({
      where: { id: rentalId },
      data: {
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

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Failed to update rental:", error);
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const rentalId = parseInt(id);

    // Verify rental belongs to agency
    const existing = await prisma.assetWithCustomer.findFirst({
      where: { id: rentalId, customer: { agencyId: session.user.agencyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    await prisma.assetWithCustomer.delete({
      where: { id: rentalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete rental:", error);
    return NextResponse.json(
      { error: "Failed to delete rental" },
      { status: 500 }
    );
  }
}
