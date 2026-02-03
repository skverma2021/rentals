import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const customerId = parseInt(id);

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
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
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const customerId = parseInt(id);
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

    const customer = await prisma.customers.update({
      where: { id: customerId },
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

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const customerId = parseInt(id);

    // Check if customer has active rentals
    const rentals = await prisma.assetWithCustomer.count({
      where: { customerId },
    });

    if (rentals > 0) {
      return NextResponse.json(
        { error: `Cannot delete: Customer has ${rentals} active rental(s)` },
        { status: 400 }
      );
    }

    // Delete attachments first
    await prisma.customerFile.deleteMany({
      where: { customerId },
    });

    await prisma.customers.delete({
      where: { id: customerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
