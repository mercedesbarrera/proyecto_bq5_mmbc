const express = require("express");
const router = express.Router();
const { getConnection } = require("../db");

//Devuelve todos los artículos, ordena por categoría y nombre
router.get("/", async (req, res) => {
  let conn;

  try {
     conn = await getConnection();
     const result = await conn.execute(`
      SELECT
        ID          AS "id",
        NOMBRE      AS "nombre",
        CATEGORIA   AS "categoria",
        MATERIAL    AS "material",
        PIEDRA      AS "piedra",
        PRECIO      AS "precio",
        STOCK       AS "stock",
        IMAGEN      AS "imagen",
        DESCRIPCION AS "descripcion",
        COLECCION   AS "coleccion"
        
      FROM ARTICULO
      ORDER BY CATEGORIA, NOMBRE
    `);

    res.json(result.rows);

  } catch (e) {
    
    res.status(500).json({
      error: "Error listando productos",
      details: e.message
    });

  } finally {
   
    if (conn) await conn.close();
  }
});

//Devuelve todas las categorías únicas
router.get("/categorias", async (req, res) => {

  let conn;

  try {

    conn = await getConnection();


    const result = await conn.execute(`
      SELECT DISTINCT
        CATEGORIA AS "categoria"
      FROM ARTICULO
      ORDER BY CATEGORIA
    `);

    res.json(result.rows.map(r => r.categoria));

  } catch (e) {
    res.status(500).json({
      error: "Error listando categorías",
      details: e.message
    });

  } finally {
    if (conn) await conn.close();
  }
});

//Filtra productos por categoría
router.get("/categoria/:categoria", async (req, res) => {

  let conn;

  try {
    conn = await getConnection();
   const categoria = req.params.categoria;

   //obtenemos los artículos
    const result = await conn.execute(
      `
      SELECT
        ID          AS "id",
        NOMBRE      AS "nombre",
        CATEGORIA   AS "categoria",
        MATERIAL    AS "material",
        PIEDRA      AS "piedra",
        PRECIO      AS "precio",
        STOCK       AS "stock",
        IMAGEN      AS "imagen",
        DESCRIPCION AS "descripcion",
        COLECCION   AS "coleccion"
      FROM ARTICULO
      WHERE CATEGORIA = :categoria
      ORDER BY NOMBRE
      `,
      { categoria } // parámetro bind
    );

    const articulos = result.rows;

    //Para cada artículo, buscamos sus imágenes
    for (let art of articulos) {
      const imgRes= await conn.execute(
        `SELECT 
          URL AS "url" 
         FROM ARTICULO_IMAGENES 
         WHERE ARTICULO_ID = :id 
         ORDER BY ORDEN`,
         {id:art.id}
      );

      art.imagenes=imgRes.rows;
    }
     res.json(articulos);

  } catch (e) {
    res.status(500).json({
      
      error: "Error filtrando por categoría",
      details: e.message
    });

  } finally {

    if (conn) await conn.close();
  }
});

//Devuelve todas las piedras únicas
router.get("/piedra", async (req,res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(`
            SELECT DISTINCT
            PIEDRA AS "piedra"
            FROM ARTICULO
            ORDER BY PIEDRA`
            );
        
        res.json(result.rows.map(r => r.piedra));
        
    } catch(e){
        res.status(500).json({
            error:"Error listando piedras",
            deltails: e.message
        });
    } finally {
        if (conn) await conn.close();
    }

});

//Filtra productos por tipo de piedra
router.get("/piedra/:piedra", async (req, res) => {

  let conn;

  try {
    conn = await getConnection();
   const piedra = req.params.piedra;
    const result = await conn.execute(
      `
      SELECT
        ID          AS "id",
        NOMBRE      AS "nombre",
        CATEGORIA   AS "categoria",
        MATERIAL    AS "material",
        PIEDRA      AS "piedra",
        PRECIO      AS "precio",
        STOCK       AS "stock",
        IMAGEN      AS "imagen",
        DESCRIPCION AS "descripcion",
        COLECCION   AS "coleccion"
      FROM ARTICULO
      WHERE LOWER(
        TRANSLATE(piedra,
        'ÁÉÍÓÚÜáéíóúü',
        'AEIOUUaeiouu')
      ) LIKE '%' || :piedra || '%'
      ORDER BY NOMBRE
      `,
      { piedra } // parámetro bind
    );

     res.json(result.rows);

  } catch (e) {
    res.status(500).json({
      error: "Error filtrando por piedra",
      details: e.message
    });

  } finally {

    if (conn) await conn.close();
  }
});

//Obtener productos por id
router.get("/:id", async (req,res) => {
  let conn;

  try {
    conn= await getConnection();
    const id = req.params.id;
    //1.Consultamos los datos principales de artículo
    const result = await conn.execute(
      `
      SELECT
        ID AS "id",
        NOMBRE AS "nombre",
        CATEGORIA AS "categoria",
        MATERIAL AS "material",
        PIEDRA AS "piedra",
        PRECIO AS "precio",
        STOCK AS "stock",
        IMAGEN AS "imagen",
        DESCRIPCION AS "descripcion",
        COLECCION   AS "coleccion"
      FROM ARTICULO
      WHERE ID = :id
        `,
        {id}
    );


    //Si no existe el artículo, devolvemos 404
    if (result.rows.length === 0) {
      return res.status(404).json({error:"Artículo no encontrado"});
    }

    const articulo = result.rows[0];

    //2. Consultamos las imágenes adicionales en la nueva tabla
    const resultImagenes = await conn.execute(
      `SELECT
        URL AS "url"
      FROM ARTICULO_IMAGENES
      WHERE ARTICULO_ID =:id
      ORDER BY ORDEN ASC
      `,
      {id}
    );

    //3. Inyectamos el array de imágenes en el objeto del artículo
    //Si no hay imágenes, devolvemos un arrat vacío []
    articulo.imagenes=resultImagenes.rows;

    //4.Consultamos los datos místicos
    const resultMistico = await conn.execute(
      `SELECT 
         CHAKRA AS "chakra",
         AFIRMACION AS "afirmacion",
         ELEMENTO AS "elemento"
      FROM ARTICULO_MISTICO
      WHERE ARTICULO_ID = :id`,
      {id} 
    );

    //5.Añadimos los datos místicos al artículo

    articulo.mistico = resultMistico.rows[0] || null;

    res.json(articulo);

  }catch (e) {
    res.status(500).json({
      error:"Error obteniendo artículo",
      details: e.message
    });
  }finally{
    if(conn) await conn.close();
  }
});

//Filtrar por colección
router.get("/coleccion/:coleccion", async (req, res) => {
  let conn;

  try {
    conn = await getConnection();
    const coleccion = req.params.coleccion;

    const result = await conn.execute(
      `
      SELECT
        ID          AS "id",
        NOMBRE      AS "nombre",
        CATEGORIA   AS "categoria",
        MATERIAL    AS "material",
        PIEDRA      AS "piedra",
        PRECIO      AS "precio",
        STOCK       AS "stock",
        IMAGEN      AS "imagen",
        DESCRIPCION AS "descripcion"
      FROM ARTICULO
      WHERE COLECCION = :coleccion
      ORDER BY NOMBRE
      `,
      { coleccion }
    );

    const articulos = result.rows;

    // cargar imágenes (igual que ya haces)
    for (let art of articulos) {
      const imgRes = await conn.execute(
        `SELECT URL AS "url"
         FROM ARTICULO_IMAGENES
         WHERE ARTICULO_ID = :id
         ORDER BY ORDEN`,
        { id: art.id }
      );

      art.imagenes = imgRes.rows;
    }

    res.json(articulos);

  } catch (e) {
    res.status(500).json({
      error: "Error filtrando por colección",
      details: e.message
    });
  } finally {
    if (conn) await conn.close();
  }
});


module.exports = router;

