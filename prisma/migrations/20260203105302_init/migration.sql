-- CreateTable
CREATE TABLE "assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "specId" INTEGER NOT NULL,
    "acquiredDate" DATETIME NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assets_specId_fkey" FOREIGN KEY ("specId") REFERENCES "assetSpec" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assetCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "manufacturer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "assetSpec" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetCategoryId" INTEGER NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "yearMake" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "assetSpec_assetCategoryId_fkey" FOREIGN KEY ("assetCategoryId") REFERENCES "assetCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assetSpec_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "definedCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "assetCurrentCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "definedConditionId" INTEGER NOT NULL,
    "asOnDate" DATETIME NOT NULL,
    CONSTRAINT "assetCurrentCondition_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assetCurrentCondition_definedConditionId_fkey" FOREIGN KEY ("definedConditionId") REFERENCES "definedCondition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assetCurrentValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "theCurrentValue" REAL NOT NULL,
    "asOnDate" DATETIME NOT NULL,
    CONSTRAINT "assetCurrentValue_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assetWithCustomer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "ratePerMonth" REAL NOT NULL,
    "fromDate" DATETIME NOT NULL,
    CONSTRAINT "assetWithCustomer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assetWithCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "company" TEXT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "businessPhone" TEXT,
    "homePhone" TEXT,
    "mobilePhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateProvince" TEXT NOT NULL,
    "zipPostalCode" TEXT NOT NULL,
    "countryRegion" TEXT NOT NULL,
    "webPage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "customerFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customerFile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assetFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assetFile_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_emailId_key" ON "customers"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_mobilePhone_key" ON "customers"("mobilePhone");
