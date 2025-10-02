/*
  Warnings:

  - You are about to drop the column `userId` on the `Consumable` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Consumable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "servingSize" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Consumable" ("calories", "carbs", "createdAt", "fat", "id", "name", "protein", "servingSize", "updatedAt") SELECT "calories", "carbs", "createdAt", "fat", "id", "name", "protein", "servingSize", "updatedAt" FROM "Consumable";
DROP TABLE "Consumable";
ALTER TABLE "new_Consumable" RENAME TO "Consumable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
