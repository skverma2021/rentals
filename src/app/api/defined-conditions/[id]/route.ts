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

    const condition = await prisma.definedCondition.findFirst({
      where: { id: conditionId, agencyId: session.user.agencyId },
    });

    if (!condition) {
      return NextResponse.json(
        { error: "Defined condition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(condition);
  } catch (error) {
    console.error("Failed to fetch defined condition:", error);
    return NextResponse.json(
      { error: "Failed to fetch defined condition" },
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

    // Verify condition belongs to agency
    const existing = await prisma.definedCondition.findFirst({
      where: { id: conditionId, agencyId: session.user.agencyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 });
    }

    const body = await request.json();
    const { description } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const condition = await prisma.definedCondition.update({
      where: { id: conditionId },
      data: {
        description: description.trim(),
      },
    });

    return NextResponse.json(condition);
  } catch (error) {
    console.error("Failed to update defined condition:", error);
    return NextResponse.json(
      { error: "Failed to update defined condition" },
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

    // Verify condition belongs to agency
    const existing = await prisma.definedCondition.findFirst({
      where: { id: conditionId, agencyId: session.user.agencyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 });
    }

    // Check if condition is in use
    const usageCount = await prisma.assetCurrentCondition.count({
      where: { definedConditionId: conditionId },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: This condition is assigned to ${usageCount} asset(s)` },
        { status: 400 }
      );
    }

    await prisma.definedCondition.delete({
      where: { id: conditionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete defined condition:", error);
    return NextResponse.json(
      { error: "Failed to delete defined condition" },
      { status: 500 }
    );
  }
}
