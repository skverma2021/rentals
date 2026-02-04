import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { assetId, customerId, ratePerMonth, fromDate } = body;

    if (!assetId || !customerId || !ratePerMonth || !fromDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const rental = await prisma.assetWithCustomer.create({
      data: {
        assetId: parseInt(assetId),
        customerId: parseInt(customerId),
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

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error("Failed to create rental:", error);
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    );
  }
}
