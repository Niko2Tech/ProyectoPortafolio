-- CreateEnum
CREATE TYPE "tipo_cliente" AS ENUM ('persona', 'empresa');

-- CreateEnum
CREATE TYPE "tipo_documento_venta" AS ENUM ('boleta', 'factura', 'nota_credito', 'guia_despacho');

-- CreateEnum
CREATE TYPE "estado_documento_venta" AS ENUM ('emitida', 'pagada', 'anulada');

-- CreateEnum
CREATE TYPE "tipo_documento_compra" AS ENUM ('factura', 'boleta', 'otro');

-- CreateEnum
CREATE TYPE "estado_compra" AS ENUM ('pendiente', 'recibida', 'pagada', 'anulada');

-- CreateEnum
CREATE TYPE "tipo_documento_gasto" AS ENUM ('factura', 'boleta', 'otro');

-- CreateEnum
CREATE TYPE "tipo_movimiento_inventario" AS ENUM ('entrada', 'salida', 'ajuste', 'devolucion');

-- CreateEnum
CREATE TYPE "estado_caja" AS ENUM ('abierta', 'cerrada');

-- CreateEnum
CREATE TYPE "tipo_movimiento_caja" AS ENUM ('ingreso', 'egreso');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "tipo_cliente" "tipo_cliente" NOT NULL,
    "nombre" VARCHAR(100),
    "apellido" VARCHAR(100),
    "razon_social" VARCHAR(150),
    "email" VARCHAR(100),
    "telefono" VARCHAR(20),
    "direccion" TEXT,
    "comuna" VARCHAR(50),
    "ciudad" VARCHAR(50),
    "region" VARCHAR(50),
    "rut" VARCHAR(12) NOT NULL,
    "giro" VARCHAR(100),
    "exento_iva" BOOLEAN NOT NULL DEFAULT false,
    "es_cliente_frecuente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "codigo_barras" VARCHAR(50),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "precio_neto" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "costo_neto" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "unidad_medida" VARCHAR(20),
    "categoria_id" INTEGER NOT NULL,
    "subcategoria_id" INTEGER,
    "marca_id" INTEGER,
    "proveedor_id" UUID,
    "afecto_iva" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_producto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categoria_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategoria_producto" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "subcategoria_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL,
    "razon_social" VARCHAR(150) NOT NULL,
    "nombre_fantasia" VARCHAR(100),
    "rut" VARCHAR(12) NOT NULL,
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "direccion" TEXT,
    "comuna" VARCHAR(50),
    "ciudad" VARCHAR(50),
    "region" VARCHAR(50),
    "giro" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "requiere_comprobante" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "permite_vuelto" BOOLEAN NOT NULL DEFAULT false,
    "permite_pago_parcial" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_venta" (
    "id" UUID NOT NULL,
    "tipo_documento" "tipo_documento_venta" NOT NULL,
    "numero_documento" INTEGER NOT NULL,
    "usuario_id" UUID NOT NULL,
    "cliente_id" UUID,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "subtotal_neto" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "metodo_pago_id" INTEGER NOT NULL,
    "estado" "estado_documento_venta" NOT NULL,
    "documento_referencia_id" UUID,
    "comentarios" TEXT,

    CONSTRAINT "documentos_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_venta_detalle" (
    "id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario_neto" DECIMAL(10,2) NOT NULL,
    "iva_unitario" DECIMAL(10,2) NOT NULL,
    "descuento_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "descuento_monto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal_neto" DECIMAL(10,2) NOT NULL,
    "iva_linea" DECIMAL(10,2) NOT NULL,
    "total_linea" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "documentos_venta_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" UUID NOT NULL,
    "tipo_documento" "tipo_documento_compra" NOT NULL,
    "numero_documento" VARCHAR(20) NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_recepcion" TIMESTAMP(3),
    "subtotal_neto" DECIMAL(10,2),
    "iva" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "estado" "estado_compra" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_detalle" (
    "id" UUID NOT NULL,
    "compra_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario_neto" DECIMAL(10,2) NOT NULL,
    "iva_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal_neto" DECIMAL(10,2) NOT NULL,
    "iva_linea" DECIMAL(10,2) NOT NULL,
    "total_linea" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "compras_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_gastos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categoria_gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" UUID NOT NULL,
    "tipo_documento" "tipo_documento_gasto" NOT NULL,
    "numero_documento" VARCHAR(20),
    "proveedor_id" UUID NOT NULL,
    "categoria_gasto_id" INTEGER NOT NULL,
    "monto_neto" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "gasto_recurrente" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_movimientos" (
    "id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "tipo_movimiento" "tipo_movimiento_inventario" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "stock_anterior" DECIMAL(10,2) NOT NULL,
    "stock_nuevo" DECIMAL(10,2) NOT NULL,
    "origen_id" UUID,
    "origen_tipo" VARCHAR(50),
    "usuario_id" UUID NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caja" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL,
    "monto_apertura" DECIMAL(10,2) NOT NULL,
    "fecha_cierre" TIMESTAMP(3),
    "monto_cierre_efectivo" DECIMAL(10,2),
    "monto_cierre_tarjetas" DECIMAL(10,2),
    "monto_cierre_otros" DECIMAL(10,2),
    "diferencia" DECIMAL(10,2),
    "estado" "estado_caja" NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caja_movimientos" (
    "id" UUID NOT NULL,
    "caja_id" UUID NOT NULL,
    "tipo_movimiento" "tipo_movimiento_caja" NOT NULL,
    "metodo_pago_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "documento_id" UUID,
    "tipo_documento" VARCHAR(50),
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "usuario_id" UUID NOT NULL,

    CONSTRAINT "caja_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_rut_key" ON "clientes"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "producto_sku_key" ON "producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_producto_nombre_key" ON "categoria_producto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "subcategoria_producto_categoria_id_nombre_key" ON "subcategoria_producto"("categoria_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_rut_key" ON "proveedores"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_codigo_key" ON "metodos_pago"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_key" ON "metodos_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_venta_tipo_documento_numero_documento_key" ON "documentos_venta"("tipo_documento", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "compras_proveedor_id_tipo_documento_numero_documento_key" ON "compras"("proveedor_id", "tipo_documento", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_gastos_nombre_key" ON "categoria_gastos"("nombre");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_subcategoria_id_fkey" FOREIGN KEY ("subcategoria_id") REFERENCES "subcategoria_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategoria_producto" ADD CONSTRAINT "subcategoria_producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta" ADD CONSTRAINT "documentos_venta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta" ADD CONSTRAINT "documentos_venta_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta" ADD CONSTRAINT "documentos_venta_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta" ADD CONSTRAINT "documentos_venta_documento_referencia_id_fkey" FOREIGN KEY ("documento_referencia_id") REFERENCES "documentos_venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta_detalle" ADD CONSTRAINT "documentos_venta_detalle_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_venta_detalle" ADD CONSTRAINT "documentos_venta_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_detalle" ADD CONSTRAINT "compras_detalle_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_detalle" ADD CONSTRAINT "compras_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_categoria_gasto_id_fkey" FOREIGN KEY ("categoria_gasto_id") REFERENCES "categoria_gastos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_movimientos" ADD CONSTRAINT "inventario_movimientos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_movimientos" ADD CONSTRAINT "inventario_movimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja" ADD CONSTRAINT "caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
