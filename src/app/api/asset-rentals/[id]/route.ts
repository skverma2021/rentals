import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const rentalId = parseInt(id);

    const rental = await prisma.assetWithCustomer.findUnique({
      where: { id: rentalId },
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
    const { id } = await context.params;
    const rentalId = parseInt(id);
    const body = await request.json();
    const { ratePerMonth, fromDate } = body;

    const rental = await prisma.assetWithCustomer.update({
      where: { id: rentalId },
      data: {
        ratePerMonth: parseFloat(ratePerMonth),
        fromDate: new Date(fromDate),
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
    const { id } = await context.params;
    const rentalId = parseInt(id);

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
