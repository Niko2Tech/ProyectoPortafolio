export interface CajaResponse {
  data: Caja[]
  meta: Meta
}

export interface Caja {
  id: string
  usuarioId: string
  fechaApertura: string
  montoApertura: string
  fechaCierre: string
  montoCierre: string
  diferencia: string | null
  estado: string
  comentario: string | null
  usuario: Usuario
  movimientos: Movimiento[]
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
}

export interface Movimiento {
  id: string
  cajaId: string
  tipoMovimiento: string
  metodoPagoId: number
  monto: string
  documentoId: string
  tipoDocumento: string
  fecha: string
  usuarioId: string
}

export interface Meta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}
