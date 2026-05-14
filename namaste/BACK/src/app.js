

/***********************************************************************
* ARCHIVO: app.js
*
* Este archivo configura la aplicación Express.
* Aquí se definen:
* - Funciones intermedias
* - Rutas principales
* - Configuración general de la API
*
* Este archivo NO arranca el servidor.
* El servidor se inicia normalmente en server.js o index.js.
***********************************************************************/
/***********************************************************************
* IMPORTACIONES
***********************************************************************/
// Importamos el framework Express.
// Express se encarga de gestionar peticiones HTTP y respuestas.

const express = require("express");
// Importamos el middleware CORS.
// CORS permite que clientes de otros dominios (por ejemplo Angular)
// puedan acceder a esta API sin que el navegador lo bloquee.
const cors = require("cors");
// Importamos las rutas relacionadas con articulo, contacto y carrito
// Este módulo contiene endpoints como:
// GET /api/articulo
// GET /api/articulo/categorias
// GET /api/articulo/categoria/:categoria
const articuloRoutes = require("./routes/articulo.routes");
const contactoRoutes = require("./routes/contacto.routes");
const carritoRoutes = require("./routes/carrito.routes");
/***********************************************************************
* CREACIÓN DE LA APP
***********************************************************************/
// Creamos la aplicación Express.
// "app" representa nuestra API completa.

const app = express();
/***********************************************************************
* MIDDLEWARES
***********************************************************************/
// Habilita CORS para permitir peticiones desde otros orígenes.
// Sin esto, un frontend en otro dominio/puerto sería bloqueado.

app.use(cors());

// Middleware para que Express entienda JSON en el body de las peticiones.
// Permite leer req.body en POST, PUT, etc.
app.use(express.json());
/***********************************************************************
* RUTAS
***********************************************************************/
// Ruta de comprobación de estado (health check).
// Se usa para verificar que la API está funcionando correctamente.

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});
// Registramos las rutas de articulo.
// Todas las rutas definidas en articulo.routes.js
// quedarán colgadas de /api/articulo
//
// Ejemplos reales:
// GET /api/articulo
// GET /api/articulo/categorias
// GET /api/articulo/categoria/Componentes

app.use("/api/articulo", articuloRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api", contactoRoutes);

/***********************************************************************
* EXPORTACIÓN DE LA APP
***********************************************************************/
// Exportamos la aplicación Express.
// Será utilizada por server.js para arrancar el servidor HTTP.
module.exports = app;

