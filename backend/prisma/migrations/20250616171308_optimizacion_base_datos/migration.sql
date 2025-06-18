/*
  Warnings:

  - You are about to drop the column `ciudad` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `comuna` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `iva` on the `compras` table. All the data in the column will be lost.
  - You are about to drop the column `iva_linea` on the `compras_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `iva_unitario` on the `compras_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `precio_unitario_neto` on the `compras_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_neto` on the `compras_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `iva` on the `documentos_venta` table. All the data in the column will be lost.
  - You are about to drop the column `descuento_monto` on the `documentos_venta_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `iva_linea` on the `documentos_venta_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `iva_unitario` on the `documentos_venta_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `precio_unitario_neto` on the `documentos_venta_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_neto` on the `documentos_venta_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `iva` on the `gastos` table. All the data in the column will be lost.
  - You are about to drop the column `iva` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio_neto` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `proveedores` table. All the data in the column will be lost.
  - You are about to drop the column `comuna` on the `proveedores` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `proveedores` table. All the data in the column will be lost.
  - Added the required column `monto_iva` to the `compras` table without a default value. This is not possible if the table is not empty.
  - Made the column `subtotal_neto` on table `compras` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `compras` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `costo_unitario` to the `compras_detalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto_iva` to the `documentos_venta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_unitario` to the `documentos_venta_detalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto_iva` to the `gastos` table without a default value. This is not possible if the table is not empty.
  - Made the column `unidad_medida` on table `producto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "subcategoria_producto_nombre_key";

-- AlterTable
ALTER TABLE "caja" ALTER COLUMN "estado" SET DEFAULT 'abierta';

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "ciudad",
DROP COLUMN "comuna",
DROP COLUMN "region";

-- AlterTable
ALTER TABLE "compras" DROP COLUMN "iva",
ADD COLUMN     "monto_iva" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "subtotal_neto" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'pendiente';

-- AlterTable
ALTER TABLE "compras_detalle" DROP COLUMN "iva_linea",
DROP COLUMN "iva_unitario",
DROP COLUMN "precio_unitario_neto",
DROP COLUMN "subtotal_neto",
ADD COLUMN     "costo_unitario" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "documentos_venta" DROP COLUMN "iva",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monto_iva" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'emitida';

-- AlterTable
ALTER TABLE "documentos_venta_detalle" DROP COLUMN "descuento_monto",
DROP COLUMN "iva_linea",
DROP COLUMN "iva_unitario",
DROP COLUMN "precio_unitario_neto",
DROP COLUMN "subtotal_neto",
ADD COLUMN     "precio_unitario" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "gastos" DROP COLUMN "iva",
ADD COLUMN     "monto_iva" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "producto" DROP COLUMN "iva",
DROP COLUMN "precio_neto",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "stock_actual" SET DEFAULT 0,
ALTER COLUMN "stock_minimo" SET DEFAULT 0,
ALTER COLUMN "unidad_medida" SET NOT NULL,
ALTER COLUMN "unidad_medida" SET DEFAULT 'unidad';

-- AlterTable
ALTER TABLE "proveedores" DROP COLUMN "ciudad",
DROP COLUMN "comuna",
DROP COLUMN "region";

-- CreateTable
CREATE TABLE "configuracion_iva" (
    "id" SERIAL NOT NULL,
    "tasa_iva" DECIMAL(5,2) NOT NULL,
    "fecha_vigencia" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_iva_pkey" PRIMARY KEY ("id")
);
