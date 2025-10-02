/*
  Warnings:

  - Added the required column `userId` to the `Consumable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DailyGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FoodEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Consumable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "servingSize" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consumable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Consumable" ("calories", "carbs", "createdAt", "fat", "id", "name", "protein", "servingSize", "updatedAt") SELECT "calories", "carbs", "createdAt", "fat", "id", "name", "protein", "servingSize", "updatedAt" FROM "Consumable";
DROP TABLE "Consumable";
ALTER TABLE "new_Consumable" RENAME TO "Consumable";
CREATE TABLE "new_DailyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyGoal" ("calories", "carbs", "createdAt", "date", "fat", "id", "protein", "updatedAt") SELECT "calories", "carbs", "createdAt", "date", "fat", "id", "protein", "updatedAt" FROM "DailyGoal";
DROP TABLE "DailyGoal";
ALTER TABLE "new_DailyGoal" RENAME TO "DailyGoal";
CREATE UNIQUE INDEX "DailyGoal_userId_date_key" ON "DailyGoal"("userId", "date");
CREATE TABLE "new_FoodEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "consumableId" TEXT,
    "dailyGoalId" TEXT,
    "name" TEXT,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoodEntry_consumableId_fkey" FOREIGN KEY ("consumableId") REFERENCES "Consumable" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FoodEntry_dailyGoalId_fkey" FOREIGN KEY ("dailyGoalId") REFERENCES "DailyGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FoodEntry" ("amount", "calories", "carbs", "consumableId", "createdAt", "dailyGoalId", "date", "description", "fat", "id", "imageUrl", "name", "protein", "updatedAt") SELECT "amount", "calories", "carbs", "consumableId", "createdAt", "dailyGoalId", "date", "description", "fat", "id", "imageUrl", "name", "protein", "updatedAt" FROM "FoodEntry";
DROP TABLE "FoodEntry";
ALTER TABLE "new_FoodEntry" RENAME TO "FoodEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
