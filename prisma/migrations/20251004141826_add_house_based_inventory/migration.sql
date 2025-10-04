/*
  Migration to add House-based inventory system
  - Creates House table
  - Adds houseId to User and Consumable tables
  - Migrates existing data to "546" house
*/

-- Step 1: Create House table
CREATE TABLE "House" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 2: Create the two houses
INSERT INTO "House" ("id", "name", "createdAt", "updatedAt") VALUES
  ('house_546', '546', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('house_hyderabad', 'Hyderabad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Migrate User table
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Migrate users to appropriate houses
-- Rahul Mohan and Rahul Krishnan to 546
-- Rohan Singh Poona to Hyderabad
INSERT INTO "new_User" ("id", "name", "houseId", "createdAt", "updatedAt")
SELECT
  "id",
  "name",
  CASE
    WHEN "name" IN ('Rahul Mohan', 'Rahul Krishnan') THEN 'house_546'
    WHEN "name" = 'Rohan Singh Poona' THEN 'house_hyderabad'
    ELSE 'house_546'  -- Default all others to 546
  END as "houseId",
  "createdAt",
  "updatedAt"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- Step 4: Migrate Consumable table
CREATE TABLE "new_Consumable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "servingSize" REAL NOT NULL,
    "houseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consumable_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Move all existing consumables to 546 house
INSERT INTO "new_Consumable" ("id", "name", "calories", "protein", "carbs", "fat", "servingSize", "houseId", "createdAt", "updatedAt")
SELECT "id", "name", "calories", "protein", "carbs", "fat", "servingSize", 'house_546', "createdAt", "updatedAt"
FROM "Consumable";

DROP TABLE "Consumable";
ALTER TABLE "new_Consumable" RENAME TO "Consumable";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Step 5: Create indexes
CREATE UNIQUE INDEX "House_name_key" ON "House"("name");
