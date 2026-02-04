import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.assets.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      include: {
        assetSpec: {
          include: {
            manufacturer: true,
            assetCategory: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
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
    const { specId, acquiredDate, purchasePrice } = body;

    // Validation
    if (!specId || !acquiredDate || !purchasePrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const asset = await prisma.assets.create({
      data: {
        agencyId: session.user.agencyId,
        specId: parseInt(specId),
        acquiredDate: new Date(acquiredDate),
        purchasePrice: parseFloat(purchasePrice),
      },
      include: {
        assetSpec: {
          include: {
            manufacturer: true,
            assetCategory: true,
          },
        },
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
