import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./src/generated/client/client";
import { getCurrencyFromCountry } from "./src/lib/countryCurrency";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const agency = await prisma.agencies.findFirst();
  console.log("Agency:", agency?.name);
  console.log("Country stored:", `"${agency?.countryRegion}"`);
  
  if (agency?.countryRegion) {
    const currency = getCurrencyFromCountry(agency.countryRegion);
    console.log("Currency derived:", currency);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
