const express = require("express");
const router = express.Router();
const { getConnection } = require("../db");
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
        DESCRIPCION AS "descripcion"
        
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

router.get("/categoria/:categoria", async (req, res) => {

  let conn;

  try {
    conn = await getConnection();
   const categoria = req.params.categoria;
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
      WHERE CATEGORIA = :categoria
      ORDER BY NOMBRE
      `,
      { categoria } // parámetro bind
    );

     res.json(result.rows);

  } catch (e) {
    res.status(500).json({
      error: "Error filtrando por categoría",
      details: e.message
    });

  } finally {

    if (conn) await conn.close();
  }
});

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
        DESCRIPCION AS "descripcion"
      FROM ARTICULO
      WHERE PIEDRA = :piedra
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
module.exports = router;
