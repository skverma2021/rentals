import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const conditionId = parseInt(id);

    const condition = await prisma.assetCurrentCondition.findFirst({
      where: { 
        id: conditionId,
        assets: { agencyId: session.user.agencyId },
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
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const conditionId = parseInt(id);

    // Verify record belongs to agency
    const existing = await prisma.assetCurrentCondition.findFirst({
      where: { id: conditionId, assets: { agencyId: session.user.agencyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const conditionId = parseInt(id);

    // Verify record belongs to agency
    const existing = await prisma.assetCurrentCondition.findFirst({
      where: { id: conditionId, assets: { agencyId: session.user.agencyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
