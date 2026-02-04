import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conditions = await prisma.definedCondition.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(conditions);
  } catch (error) {
    console.error("Failed to fetch defined conditions:", error);
    return NextResponse.json(
      { error: "Failed to fetch defined conditions" },
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
    const { description } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const condition = await prisma.definedCondition.create({
      data: {
        agencyId: session.user.agencyId,
        description: description.trim(),
      },
    });

    return NextResponse.json(condition, { status: 201 });
  } catch (error) {
    console.error("Failed to create defined condition:", error);
    return NextResponse.json(
      { error: "Failed to create defined condition" },
      { status: 500 }
    );
  }
}
