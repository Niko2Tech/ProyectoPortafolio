import type { Categories } from './categories'

export interface Subcategoria {
  id: number
  categoriaId: number
  nombre: string
  descripcion: string
  categoria: Categories
}
