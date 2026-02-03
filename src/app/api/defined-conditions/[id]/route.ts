import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conditionId = parseInt(id);

    const condition = await prisma.definedCondition.findUnique({
      where: { id: conditionId },
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
    const { id } = await context.params;
    const conditionId = parseInt(id);
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
    const { id } = await context.params;
    const conditionId = parseInt(id);

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
