import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const file = await prisma.customerFile.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!file || file.customer.agencyId !== session.user.agencyId) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Delete physical file
    const filePath = path.join(process.cwd(), "public", file.fileUrl);
    try {
      await unlink(filePath);
    } catch {
      console.warn("Physical file not found:", filePath);
    }

    // Delete database record
    await prisma.customerFile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
