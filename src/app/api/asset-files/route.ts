import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads", "assets");

async function ensureUploadsDir() {
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    const files = await prisma.assetFile.findMany({
      where: {
        assetId: parseInt(assetId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to fetch asset files:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadsDir();

    const formData = await request.formData();
    const assetId = formData.get("assetId") as string;
    const files = formData.getAll("files") as File[];

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 }
      );
    }

    // Verify asset exists
    const asset = await prisma.assets.findUnique({
      where: { id: parseInt(assetId) },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    const savedFiles = [];

    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${assetId}_${timestamp}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      const fileUrl = `/uploads/assets/${uniqueFileName}`;

      // Save file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Save metadata to database
      const assetFile = await prisma.assetFile.create({
        data: {
          assetId: parseInt(assetId),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: fileUrl,
        },
      });

      savedFiles.push(assetFile);
    }

    return NextResponse.json(savedFiles, { status: 201 });
  } catch (error) {
    console.error("Failed to upload asset files:", error);
    return NextResponse.json(
      { error: "Failed to upload asset files" },
      { status: 500 }
    );
  }
}
