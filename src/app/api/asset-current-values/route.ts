import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    const whereClause = assetId ? { assetId: parseInt(assetId) } : {};

    const values = await prisma.assetCurrentValue.findMany({
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
      },
      orderBy: {
        asOnDate: "desc",
      },
    });

    return NextResponse.json(values);
  } catch (error) {
    console.error("Failed to fetch asset current values:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset current values" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, theCurrentValue, asOnDate } = body;

    if (!assetId || theCurrentValue === undefined || !asOnDate) {
      return NextResponse.json(
        { error: "Asset ID, Value, and Date are required" },
        { status: 400 }
      );
    }

    const value = await prisma.assetCurrentValue.create({
      data: {
        assetId: parseInt(assetId),
        theCurrentValue: parseFloat(theCurrentValue),
        asOnDate: new Date(asOnDate),
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
      },
    });

    return NextResponse.json(value, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset current value:", error);
    return NextResponse.json(
      { error: "Failed to create asset current value" },
      { status: 500 }
    );
  }
}
