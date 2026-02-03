import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
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
