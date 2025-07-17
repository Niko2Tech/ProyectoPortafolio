export interface DocumentoVenta {
  id: string
  tipoDocumento: string
  numeroDocumento: number
  usuarioId: string
  clienteId: string | null
  fechaEmision: string
  subtotalNeto: string
  montoIva: string
  total: string
  metodoPagoId: number
  estado: string
  createdAt: string
  detalles: DetalleDocumentoVenta[]
  cliente: Cliente | null
  metodoPago: MetodoPago
  usuario: Usuario
}

export interface DetalleDocumentoVenta {
  id: string
  documentoId: string
  productoId: string
  cantidad: string
  precioUnitario: string
  descuentoPorcentaje: string
  totalLinea: string
  producto: Producto
}

export interface Producto {
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
  createdAt: string
  updatedAt: string
}

export interface MetodoPago {
  id: number
  codigo: string
  nombre: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  password: string
  rolId: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  // Si decides agregar un modelo de cliente más adelante
  id: string
  nombre: string
  // otros campos según tu modelo
}
