/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `subcategoria_producto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subcategoria_producto_nombre_key" ON "subcategoria_producto"("nombre");
