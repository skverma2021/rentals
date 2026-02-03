import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/client/client";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

const prisma = new PrismaClient({ adapter });

const definedConditions = [
  { description: "New" },
  { description: "Under Repair" },
  { description: "Retired" },
  { description: "Missing" },
];

async function main() {
  console.log("Seeding defined conditions...");

  for (const condition of definedConditions) {
    const existing = await prisma.definedCondition.findFirst({
      where: { description: condition.description },
    });

    if (!existing) {
      await prisma.definedCondition.create({
        data: condition,
      });
      console.log(`Created: ${condition.description}`);
    } else {
      console.log(`Already exists: ${condition.description}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
