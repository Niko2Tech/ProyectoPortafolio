export interface DashboardResponse {
  cards: {
    productosStockBajo: {
      sinStock: number
      stockBajo: number
      productos: ProductoStock[]
    }
    ventasHoy: {
      cantidad: number
      monto: number
    }
    comprasDelMes: {
      cantidad: number
      monto: number
    }
  }
  graficos: {
    ventasPorDia: VentaPorDia[]
    topProductos: ProductoTop[]
    metodosPageMasUsados: MetodoPagoUsado[]
    comprasPorMes: CompraPorMes[]
    movimientosInventario: MovimientoInventario[]
  }
}

export interface ProductoStock {
  id: string
  nombre: string
  stockActual: number
  stockMinimo: number
}

export interface VentaPorDia {
  fecha: string
  ventas: number
  cantidad: number
}

export interface ProductoTop {
  producto: string
  cantidad: number
  monto: number
}

export interface MetodoPagoUsado {
  metodo: string
  cantidad: number
  monto: number
}

export interface CompraPorMes {
  mes: string
  cantidad: number
  monto: number
}

export interface MovimientoInventario {
  fecha: string
  entradas: number
  salidas: number
}
