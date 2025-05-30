export interface Producto {
  id: string
  sku: string
  codigoBarras: string
  nombre: string
  descripcion?: string
  precioNeto: string
  iva: string
  precioVenta: string
  costoNeto: string
  stockActual: number
  stockMinimo: number
  unidadMedida: string
  afectoIva: boolean
  categoriaId: number
  subcategoriaId: number
  marcaId: number
  proveedorId: string
  createdAt: string
  updatedAt: string
  marca: { nombre: string }
  categoria: { nombre: string }
  subcategoria: { nombre: string }
  proveedor: { nombreFantasia: string }
}
