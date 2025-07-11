export type TipoDocumentoCompra = 'factura' | 'boleta' | 'otro'
export type EstadoCompra = 'pendiente' | 'recibida' | 'pagada' | 'anulada'

export type CompraDetalle = {
  productoId: string
  cantidad: number
  costoUnitario: number
  totalLinea: number
}

export type Compra = {
  tipoDocumento: TipoDocumentoCompra
  numeroDocumento: string
  proveedorId: string
  fechaEmision: string // ISO 8601
  fechaRecepcion: string // ISO 8601
  subtotalNeto: number
  montoIva: number
  total: number
  estado: EstadoCompra
  detalles: CompraDetalle[]
  usuarioId: string
}
