// types/venta.ts

export interface CrearVentaDetalle {
  documentoId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  descuentoPorcentaje: number
  totalLinea: number
}

export interface CrearVenta {
  tipoDocumento: 'boleta' | 'factura' | 'otro'
  usuarioId: string
  clienteId: string
  fechaEmision: string
  subtotalNeto: number
  montoIva: number
  total: number
  metodoPagoId: number
  estado: 'pendiente' | 'pagado' | 'anulado'
  detalles: CrearVentaDetalle[]
}
