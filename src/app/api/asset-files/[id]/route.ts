import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the file record
    const assetFile = await prisma.assetFile.findUnique({
      where: { id },
    });

    if (!assetFile) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Delete the physical file
    const filePath = path.join(process.cwd(), "public", assetFile.fileUrl);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete the database record
    await prisma.assetFile.delete({
      where: { id },
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Failed to delete asset file:", error);
    return NextResponse.json(
      { error: "Failed to delete asset file" },
      { status: 500 }
    );
  }
}
