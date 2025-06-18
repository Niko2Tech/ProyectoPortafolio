/*
  Warnings:

  - Made the column `sku` on table `producto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo_barras` on table `producto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "producto" ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "codigo_barras" SET NOT NULL;
