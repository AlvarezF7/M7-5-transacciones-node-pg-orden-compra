# M7-5-Transacciones-Node-pg Orden de Compra

## Descripción

Este proyecto permite gestionar clientes, productos, direcciones, órdenes de compra y despachos usando **Node.js**, **Express** y **PostgreSQL**.  
El backend expone endpoints REST para operaciones de consulta y creación de órdenes con manejo transaccional (`BEGIN/COMMIT/ROLLBACK`).  
El frontend permite interactuar con los datos de forma funcional usando HTML, CSS y JS.


## Tecnologías utilizadas
- Node.js  
- Express  
- PostgreSQL  
- pg (cliente de PostgreSQL para Node)  
- HTML / CSS / JavaScript  
- Fetch API – Para hacer solicitudes HTTP desde el frontend al backend.
- npm para gestión de dependencias 
- dotenv (Para manejar variables de entorno, como credenciales de base de datos). 


## Funcionalidades
- Listar productos disponibles.
- Consultar órdenes por Rut cliente.
- Crear una orden de compra:
  - Seleccionar cliente existente.
  - Elegir dirección asociada al cliente.
  - Seleccionar productos y cantidades.
  - Actualizar stock automáticamente.
  - Validación de stock insuficiente.
  - Transacción completa para garantizar consistencia.
- Mostrar mensajes claros ante errores o éxito.


## Endpoints


| Método | Ruta | Parámetros / Query | Descripción | Respuesta |
|--------|------|------------------|------------|-----------|
| GET | `/ordenes` | `filtro=productos` | Lista todos los productos | JSON con array de productos |
| GET | `/ordenes` | `filtro=productos&id=<id_producto>` | Muestra un producto por su ID | JSON con datos del producto |
| GET | `/ordenes` | `filtro=productos&orden=<id_orden>` | Lista los productos de una orden | JSON con productos de la orden |
| GET | `/ordenes` | `filtro=ordenes&rut=<rut_cliente>` | Lista órdenes de un cliente | JSON con órdenes; mensaje si no hay órdenes |
| GET | `/ordenes` | `filtro=clientes` | Lista todos los clientes | JSON con array de clientes |
| GET | `/ordenes` | `filtro=clientes&rut=<rut_cliente>` | Muestra cliente por RUT | JSON con datos del cliente; 404 si no existe |
| GET | `/ordenes` | `filtro=direcciones&rut=<rut_cliente>` | Lista direcciones de un cliente | JSON con array de direcciones |
| GET | `/ordenes` | `filtro=despachos&orden=<id_orden>` | Muestra el despacho de una orden | JSON con datos del despacho |
| POST | `/orden` | Body: `{ "rut", "id_direccion", "productos":[{id_producto, cantidad_producto}] }` | Crea nueva orden de compra (transaccional) | JSON con `ok`, `mensaje` y `id_orden` |



## Uso
1. Configurar el archivo .env_ejemplo con las credenciales de tu base de datos. 
2. Instalar dependencias npm install
3. Ejecutar el Script **M7-5-script.sql** contiene la tabal y los datos de prueba.
4. Ejecutar Servidor npm start
5. Abrir Navegador http://localhost:3000.


# Notas 
- La tabla principal es **clientes_t5**, si lista la tabla clientes  estara listando la tabla de un ejercicio anterior, ya que como es con fines educativos se utiliza la misma base dedatos para  todos los ejercicios del modulo 7.
- Las tablas principales tienen los siguientes nombres: **clientes_t5,** direcciones, productos, orden, lista_productos, despachos.
- Todas las operaciones de creación de órdenes son transaccionales (BEGIN/COMMIT/ROLLBACK) para garantizar consistencia.
- El sistema no permite crear clientes nuevos automáticamente, los clientes y direcciones deben existir antes de crear la orden.

## Autor
Fernanda Álvarez para curso Fullstack Javascript Sence.















