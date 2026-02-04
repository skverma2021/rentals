import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assetSpecs = await prisma.assetSpec.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      include: {
        manufacturer: true,
        assetCategory: true,
      },
      orderBy: {
        description: "asc",
      },
    });

    return NextResponse.json(assetSpecs);
  } catch (error) {
    console.error("Failed to fetch asset specs:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset specifications" },
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
    const { assetCategoryId, manufacturerId, yearMake, model, description } = body;

    // Validation
    if (!assetCategoryId || !manufacturerId || !yearMake || !model || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const assetSpec = await prisma.assetSpec.create({
      data: {
        agencyId: session.user.agencyId,
        assetCategoryId: parseInt(assetCategoryId),
        manufacturerId: parseInt(manufacturerId),
        yearMake: parseInt(yearMake),
        model: model.trim(),
        description: description.trim(),
      },
      include: {
        assetCategory: true,
        manufacturer: true,
      },
    });

    return NextResponse.json(assetSpec, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset spec:", error);
    return NextResponse.json(
      { error: "Failed to create asset specification" },
      { status: 500 }
    );
  }
}
