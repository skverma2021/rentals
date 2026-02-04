import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const manufacturers = await prisma.manufacturer.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      orderBy: {
        description: "asc",
      },
    });

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.error("Failed to fetch manufacturers:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
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

    const manufacturer = await prisma.manufacturer.create({
      data: {
        agencyId: session.user.agencyId,
        description: description.trim(),
      },
    });

    return NextResponse.json(manufacturer, { status: 201 });
  } catch (error) {
    console.error("Failed to create manufacturer:", error);
    return NextResponse.json(
      { error: "Failed to create manufacturer" },
      { status: 500 }
    );
  }
}
