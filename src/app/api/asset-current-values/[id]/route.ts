import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const valueId = parseInt(id);

    const value = await prisma.assetCurrentValue.findUnique({
      where: { id: valueId },
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

    if (!value) {
      return NextResponse.json(
        { error: "Asset value record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(value);
  } catch (error) {
    console.error("Failed to fetch asset current value:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset current value" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const valueId = parseInt(id);
    const body = await request.json();
    const { theCurrentValue, asOnDate } = body;

    if (theCurrentValue === undefined || !asOnDate) {
      return NextResponse.json(
        { error: "Value and Date are required" },
        { status: 400 }
      );
    }

    const value = await prisma.assetCurrentValue.update({
      where: { id: valueId },
      data: {
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

    return NextResponse.json(value);
  } catch (error) {
    console.error("Failed to update asset current value:", error);
    return NextResponse.json(
      { error: "Failed to update asset current value" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const valueId = parseInt(id);

    await prisma.assetCurrentValue.delete({
      where: { id: valueId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset current value:", error);
    return NextResponse.json(
      { error: "Failed to delete asset current value" },
      { status: 500 }
    );
  }
}
