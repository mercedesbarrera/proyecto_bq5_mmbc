/***********************************************************************
* ARCHIVO: server.js
*
* Este archivo es el punto de entrada de la API.
* Se encarga de:
* - Cargar las variables de entorno
* - Importar la aplicación Express
* - Arrancar el servidor HTTP
***********************************************************************/
/***********************************************************************
* CARGA DE VARIABLES DE ENTORNO
***********************************************************************/
// Importa la librería dotenv.
// dotenv permite leer variables desde un archivo .env (o similar)
// y cargarlas en process.env.
require("dotenv").config();

// A partir de este momento, process.env contiene las variables
// definidas en el archivo de entorno (PORT, DB_USER, DB_PASSWORD, etc.)
/***********************************************************************
* IMPORTACIÓN DE LA APP
***********************************************************************/
// Importa la aplicación Express configurada en app.js.
// app contiene middlewares y rutas, pero NO escucha peticiones todavía.

const app = require("./app");

/***********************************************************************
* CONFIGURACIÓN DEL PUERTO
***********************************************************************/
// Define el puerto en el que escuchará el servidor.
// Se usa primero la variable de entorno PORT (si existe).
// Si no existe, se usa el puerto 3000 por defecto.

const PORT = process.env.PORT || 3000;
/***********************************************************************
* ARRANQUE DEL SERVIDOR
**********************************************************************/
// Arranca el servidor HTTP.
// A partir de aquí la API empieza a aceptar peticiones.

app.listen(PORT, () => {  
    // Mensajes informativos en consola
  console.log(`API funcionando en http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Productos: http://localhost:${PORT}/api/articulo`);
});
