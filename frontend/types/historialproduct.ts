export interface MovimientoInventarioResponse {
  data: MovimientoInventario[]
  meta: MetaPaginacion
}

export interface MovimientoInventario {
  id: string
  productoId: string
  tipoMovimiento: 'entrada' | 'salida'
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  usuarioId: string
  comentario: string
  fecha: string
  producto: Producto
  usuario: Usuario
}

export interface Producto {
  id: string
  sku: string
  codigoBarras: string
  nombre: string
  descripcion: string
  costoNeto: string // Usa `number` si ya lo conviertes en el backend
  precioVenta: string // idem
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

export interface MetaPaginacion {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}
