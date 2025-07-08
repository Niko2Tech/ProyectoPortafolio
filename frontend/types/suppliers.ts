export interface Suppliers {
  id: string
  razonSocial: string
  nombreFantasia: string
  rut: string
  telefono: string
  email: string
  direccion: string
  giro: string
  createdAt: string
  updatedAt: string
  comuna: {
    id: string
    nombre: string
    regionId: string
    region: {
      id: string
      nombre: string
      codigo: string
    }
  }
}
