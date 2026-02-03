import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
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
