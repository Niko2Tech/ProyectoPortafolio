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

export type UsuarioResumen = {
  id: string
  nombre: string
}

export type ProveedorResumen = {
  id: string
  nombreFantasia: string
  razonSocial: string
  rut: string
}

export type CompraEditCambiarEstado = {
  id: string
  tipoDocumento: TipoDocumentoCompra
  numeroDocumento: string
  proveedorId: string
  fechaEmision: string // ISO 8601
  fechaRecepcion: string // ISO 8601
  subtotalNeto: number | string
  montoIva: number | string
  total: number | string
  estado: EstadoCompra
  createdAt: string
  updatedAt: string
  usuarioId: string
  usuario: UsuarioResumen
  proveedor: ProveedorResumen
  detalles: CompraDetalle[]
}
