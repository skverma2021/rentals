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
    const assetId = searchParams.get("assetId");

    const whereClause: Record<string, unknown> = {
      assets: { agencyId: session.user.agencyId },
    };
    if (assetId) whereClause.assetId = parseInt(assetId);

    const conditions = await prisma.assetCurrentCondition.findMany({
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
        definedCondition: true,
      },
      orderBy: {
        asOnDate: "desc",
      },
    });

    return NextResponse.json(conditions);
  } catch (error) {
    console.error("Failed to fetch asset current conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset current conditions" },
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
    const { assetId, definedConditionId, asOnDate } = body;

    if (!assetId || !definedConditionId || !asOnDate) {
      return NextResponse.json(
        { error: "Asset ID, Condition ID, and Date are required" },
        { status: 400 }
      );
    }

    const condition = await prisma.assetCurrentCondition.create({
      data: {
        assetId: parseInt(assetId),
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

    return NextResponse.json(condition, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset current condition:", error);
    return NextResponse.json(
      { error: "Failed to create asset current condition" },
      { status: 500 }
    );
  }
}
