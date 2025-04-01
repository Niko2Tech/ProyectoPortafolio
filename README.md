# Proyecto de Título - Sistema de Inventario y Punto de Venta

## Descripción

Este proyecto es una aplicación web para la gestión de inventario y punto de venta en una ferretería. Permite el registro de productos en inventario y la actualización automática del stock al realizar una venta.

## Tecnologías Utilizadas

- **Frontend:** Nuxt.js
- **Backend:** NestJS
- **Base de Datos:** Prisma ORM con PostgreSQL/MySQL (por definir)
- **Autenticación:** JWT
- **Despliegue:** Docker y/o VPS

## Funcionalidades Principales

- **Gestor de Inventario:** Permite agregar, editar y eliminar productos.
- **Punto de Venta:** Registro de ventas con actualización automática del stock.
- **Usuarios y Roles:** Control de acceso basado en roles.
- **Reportes:** Generación de informes de ventas y stock.
- **API Documentada:** Uso de Swagger para documentar la API en NestJS.

## Instalación y Configuración

### Prerrequisitos

- Node.js y npm
- Docker (opcional, para entorno de desarrollo)

### Instrucciones

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/usuario/proyecto-ferreteria.git
   cd proyecto-ferreteria
   ```

2. Instalar dependencias en frontend y backend:

   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Configurar variables de entorno en `.env` para el backend y frontend.

4. Levantar el backend:

   ```bash
   npm run start:dev
   ```

5. Levantar el frontend:
   ```bash
   npm run dev
   ```

## Licencia

Este proyecto está bajo la licencia MIT.
