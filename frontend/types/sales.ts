// types/venta.ts

export interface CrearVentaDetalle {
  productoId: string
  cantidad: number
  precioUnitario: number
  descuentoPorcentaje: number
  totalLinea: number
}

export interface CrearVenta {
  tipoDocumento: 'boleta' | 'factura' | 'otro'
  usuarioId: string
  clienteId?: string
  fechaEmision: string
  subtotalNeto: number
  montoIva: number
  total: number
  metodoPagoId: number
  estado: 'pendiente' | 'pagada' | 'anulado'
  detalles: CrearVentaDetalle[]
}

export interface productoCarrito {
  id: string
  sku: string
  codigoBarras: string
  nombre: string
  descripcion: string
  costoNeto: string
  precioVenta: string
  stockActual: number
  stockMinimo: number
  unidadMedida: string
  categoriaId: number
  subcategoriaId: number
  marcaId: number
  proveedorId: string
  afectoIva: boolean
  activo: boolean
  cantidad: number
}
