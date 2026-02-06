import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./src/generated/client/client";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const settings = await prisma.agencySettings.findFirst();
  console.log("Current settings:", settings);
  
  // Clear the settings to force refresh
  if (settings) {
    await prisma.agencySettings.delete({ where: { id: settings.id } });
    console.log("Deleted old settings - will be recreated with correct currency on next API call");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
