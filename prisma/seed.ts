import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/client/client";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

const prisma = new PrismaClient({ adapter });

// Sample agencies
const agencies = [
  {
    name: "Acme Rentals",
    contactEmail: "admin@acme-rentals.com",
    contactPhone: "555-0100",
    address: "123 Main Street",
    city: "New York",
    stateProvince: "NY",
    zipPostalCode: "10001",
    countryRegion: "USA",
  },
  {
    name: "Global Equipment Co",
    contactEmail: "admin@globalequip.com",
    contactPhone: "555-0200",
    address: "456 Oak Avenue",
    city: "Los Angeles",
    stateProvince: "CA",
    zipPostalCode: "90001",
    countryRegion: "USA",
  },
];

// Sample authorized users (replace emails with your actual GitHub/Google emails for testing)
const authUsersByAgency: Record<string, Array<{
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  provider: string;
  providerId: string;
}>> = {
  "Acme Rentals": [
    {
      firstName: "John",
      lastName: "Admin",
      email: "s.k.verma@live.in", // Replace with your GitHub/Google email for testing
      role: "admin",
      provider: "github",
      providerId: "pending-acme-1",
    },
    {
      firstName: "Jane",
      lastName: "Manager",
      email: "s.k.verma@live.in", // Replace with your GitHub/Google email for testing
      role: "manager",
      provider: "google",
      providerId: "pending-acme-2",
    },
  ],
  "Global Equipment Co": [
    {
      firstName: "Bob",
      lastName: "Owner",
      email: "bob@globalequip.com",
      role: "admin",
      provider: "github",
      providerId: "pending-global-1",
    },
  ],
};

async function main() {
  console.log("Seeding agencies...");

  for (const agencyData of agencies) {
    let agency = await prisma.agencies.findFirst({
      where: { name: agencyData.name },
    });

    if (!agency) {
      agency = await prisma.agencies.create({
        data: agencyData,
      });
      console.log(`Created agency: ${agency.name}`);
    } else {
      console.log(`Agency already exists: ${agency.name}`);
    }

    // Create authorized users for this agency
    const users = authUsersByAgency[agency.name] || [];
    for (const userData of users) {
      const existingUser = await prisma.authUsers.findFirst({
        where: { email: userData.email },
      });

      if (!existingUser) {
        await prisma.authUsers.create({
          data: {
            ...userData,
            agencyId: agency.id,
          },
        });
        console.log(`Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Create defined conditions for this agency
    const definedConditions = [
      { description: "New" },
      { description: "Under Repair" },
      { description: "Retired" },
      { description: "Missing" },
    ];

    for (const condition of definedConditions) {
      const existing = await prisma.definedCondition.findFirst({
        where: { 
          description: condition.description,
          agencyId: agency.id,
        },
      });

      if (!existing) {
        await prisma.definedCondition.create({
          data: {
            ...condition,
            agencyId: agency.id,
          },
        });
        console.log(`Created condition for ${agency.name}: ${condition.description}`);
      }
    }

    // Create sample categories for this agency
    const categories = [
      { description: "Heavy Equipment" },
      { description: "Vehicles" },
      { description: "Electronics" },
    ];

    for (const category of categories) {
      const existing = await prisma.assetCategory.findFirst({
        where: {
          description: category.description,
          agencyId: agency.id,
        },
      });

      if (!existing) {
        await prisma.assetCategory.create({
          data: {
            ...category,
            agencyId: agency.id,
          },
        });
        console.log(`Created category for ${agency.name}: ${category.description}`);
      }
    }

    // Create sample manufacturers for this agency
    const manufacturers = [
      { description: "Caterpillar" },
      { description: "John Deere" },
      { description: "Toyota" },
    ];

    for (const manufacturer of manufacturers) {
      const existing = await prisma.manufacturer.findFirst({
        where: {
          description: manufacturer.description,
          agencyId: agency.id,
        },
      });

      if (!existing) {
        await prisma.manufacturer.create({
          data: {
            ...manufacturer,
            agencyId: agency.id,
          },
        });
        console.log(`Created manufacturer for ${agency.name}: ${manufacturer.description}`);
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📝 To test authentication:");
  console.log("1. Update .env.local with your GitHub/Google OAuth credentials");
  console.log("2. Update the email addresses in seed.ts with your actual GitHub/Google email");
  console.log("3. Run: npx tsx prisma/seed.ts");
  console.log("4. Start the app: npm run dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
