import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conditionId = parseInt(id);

    const condition = await prisma.assetCurrentCondition.findUnique({
      where: { id: conditionId },
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
        definedCondition: true,
      },
    });

    if (!condition) {
      return NextResponse.json(
        { error: "Asset condition record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(condition);
  } catch (error) {
    console.error("Failed to fetch asset current condition:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset current condition" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conditionId = parseInt(id);
    const body = await request.json();
    const { definedConditionId, asOnDate } = body;

    if (!definedConditionId || !asOnDate) {
      return NextResponse.json(
        { error: "Condition ID and Date are required" },
        { status: 400 }
      );
    }

    const condition = await prisma.assetCurrentCondition.update({
      where: { id: conditionId },
      data: {
        definedConditionId: parseInt(definedConditionId),
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
        definedCondition: true,
      },
    });

    return NextResponse.json(condition);
  } catch (error) {
    console.error("Failed to update asset current condition:", error);
    return NextResponse.json(
      { error: "Failed to update asset current condition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conditionId = parseInt(id);

    await prisma.assetCurrentCondition.delete({
      where: { id: conditionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset current condition:", error);
    return NextResponse.json(
      { error: "Failed to delete asset current condition" },
      { status: 500 }
    );
  }
}
