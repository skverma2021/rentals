import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.assetCategory.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      orderBy: {
        description: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch asset categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset categories" },
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

    if (!description || description.trim() === "") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const category = await prisma.assetCategory.create({
      data: {
        agencyId: session.user.agencyId,
        description: description.trim(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset category:", error);
    return NextResponse.json(
      { error: "Failed to create asset category" },
      { status: 500 }
    );
  }
}
