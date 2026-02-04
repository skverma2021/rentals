import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Get current user's session
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await prisma.customers.findMany({
      where: {
        agencyId: session.user.agencyId, // Filter by agency
      },
      include: {
        attachments: true,
        assetWithCustomer: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user's session
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      company,
      lastName,
      firstName,
      emailId,
      jobTitle,
      businessPhone,
      homePhone,
      mobilePhone,
      address,
      city,
      stateProvince,
      zipPostalCode,
      countryRegion,
      webPage,
    } = body;

    // Validation
    if (!lastName || !firstName || !emailId || !mobilePhone || !address || !city || !stateProvince || !zipPostalCode || !countryRegion) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customer = await prisma.customers.create({
      data: {
        agencyId: session.user.agencyId, // Set agency from session
        company: company || null,
        lastName,
        firstName,
        emailId,
        jobTitle: jobTitle || null,
        businessPhone: businessPhone || null,
        homePhone: homePhone || null,
        mobilePhone,
        address,
        city,
        stateProvince,
        zipPostalCode,
        countryRegion,
        webPage: webPage || null,
      },
      include: {
        attachments: true,
        assetWithCustomer: true,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create customer:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Email or mobile phone already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
