import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const conditions = await prisma.definedCondition.findMany({
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
