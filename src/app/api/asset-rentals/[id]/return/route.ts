import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/asset-rentals/[id]/return - Mark asset as returned
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    // Check if already returned
    if (existing.toDate) {
      return NextResponse.json(
        { error: "Asset has already been returned", returnedDate: existing.toDate },
        { status: 400 }
      );
    }

    // Get return date from body or use current date
    const body = await request.json().catch(() => ({}));
    const returnDate = body.returnDate ? new Date(body.returnDate) : new Date();

    // Validate return date is not before rental start date
    if (returnDate < existing.fromDate) {
      return NextResponse.json(
        { error: "Return date cannot be before rental start date" },
        { status: 400 }
      );
    }

    const rental = await prisma.assetWithCustomer.update({
      where: { id: rentalId },
      data: {
        toDate: returnDate,
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

    return NextResponse.json({
      message: "Asset returned successfully",
      rental,
    });
  } catch (error) {
    console.error("Failed to mark asset as returned:", error);
    return NextResponse.json(
      { error: "Failed to mark asset as returned" },
      { status: 500 }
    );
  }
}
