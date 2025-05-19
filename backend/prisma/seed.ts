import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rolesData = [
    { id: 1, nombre: 'Venta', descripcion: 'Vende producto' },
    { id: 2, nombre: 'Admin', descripcion: 'Administra todos los servicios' },
    { id: 3, nombre: 'Bodeguero', descripcion: 'Inventario' },
  ];

  for (const rol of rolesData) {
    await prisma.rol.upsert({
      where: { id: rol.id },
      update: {},
      create: rol,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
