const express = require("express");
const router = express.Router();

const oracledb = require("oracledb");

const { getConnection } = require("../db");



async function obtenerOCrearCarrito(
    conn,
    sesionId
) {

    const existente =
        await conn.execute(
            `
            SELECT ID
            FROM CARRITO
            WHERE SESION_ID = :sesionId
            `,
            { sesionId }
        );


    if (
        existente.rows.length > 0
    ) {

        return Number(
            existente.rows[0].ID
        );
    }


    const nuevo =
        await conn.execute(
            `
            INSERT INTO CARRITO(
                SESION_ID
            )
            VALUES(
                :sesionId
            )
            RETURNING ID INTO :id
            `,
            {
                sesionId,

                id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                }
            },
            {
                autoCommit: true
            }
        );


    return Number(
        nuevo.outBinds.id[0]
    );
}



router.post("/", async (req, res) => {
    let conn;
    try {
        const { sesionId, articuloId, talla } = req.body;
        conn = await getConnection();

        const carritoId = await obtenerOCrearCarrito(conn, sesionId);

        // Forzamos un valor de texto para la comparación, evitando líos con NULL
        const tallaBusqueda = (talla === undefined || talla === null || talla === '') ? 'SIN_TALLA' : talla.toString().trim();

        // 1. Buscamos si existe con una lógica de comparación más simple
        const existeItem = await conn.execute(
            `SELECT ID, CANTIDAD 
             FROM CARRITO_ITEM 
             WHERE CARRITO_ID = :carritoId 
               AND ARTICULO_ID = :articuloId 
               AND NVL(TRIM(TALLA), 'SIN_TALLA') = :tallaBusqueda`,
            { 
                carritoId, 
                articuloId, 
                tallaBusqueda 
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existeItem.rows.length > 0) {
            // 2. Si ya existe, actualizamos la cantidad
            const itemId = existeItem.rows[0].ID;
            await conn.execute(
                `UPDATE CARRITO_ITEM 
                 SET CANTIDAD = CANTIDAD + 1 
                 WHERE ID = :itemId`,
                { itemId },
                { autoCommit: true }
            );
        } else {
            // 3. Si no existe, insertamos. 
            // Guardamos NULL real en la base de datos si es 'SIN_TALLA'
            const tallaInsert = (tallaBusqueda === 'SIN_TALLA') ? null : tallaBusqueda;
            
            await conn.execute(
                `INSERT INTO CARRITO_ITEM (CARRITO_ID, ARTICULO_ID, CANTIDAD, TALLA) 
                 VALUES (:carritoId, :articuloId, 1, :tallaInsert)`,
                { 
                    carritoId, 
                    articuloId, 
                    tallaInsert 
                },
                { autoCommit: true }
            );
        }

        res.json({ ok: true });

    } catch (error) {
        console.error("ERROR EN CARRITO:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) await conn.close();
    }
});



// OBTENER ITEMS
router.get(
    "/:sesionId",
    async (req, res) => {

        let conn;

        try {

            conn =
                await getConnection();

            const {
                sesionId
            } = req.params;


            const result =
                await conn.execute(
                    `
                    SELECT

                        ci.ID,
                        ci.CANTIDAD,
                        ci.TALLA,

                        a.ID ARTICULO_ID,
                        a.NOMBRE,
                        a.PRECIO,
                        a.IMAGEN,
                        a.CATEGORIA

                    FROM CARRITO c

                    JOIN CARRITO_ITEM ci
                        ON ci.CARRITO_ID = c.ID

                    JOIN ARTICULO a
                        ON a.ID = ci.ARTICULO_ID

                    WHERE c.SESION_ID = :sesionId
                    `,
                    {
                        sesionId
                    },
                    {
                        outFormat:
                            oracledb.OUT_FORMAT_OBJECT
                    }
                );


            res.json(
                result.rows
            );

        }
        finally {

            if (conn) {
                await conn.close();
            }
        }
    }
);



// CAMBIAR CANTIDAD
router.put(
    "/cantidad/:id",
    async (req, res) => {

        let conn;

        try {

            const {
                id
            } = req.params;


            const {
                cantidad
            } = req.body;


            conn =
                await getConnection();


            if (
                cantidad <= 0
            ) {

                await conn.execute(
                    `
                    DELETE FROM CARRITO_ITEM
                    WHERE ID = :id
                    `,
                    {
                        id
                    },
                    {
                        autoCommit: true
                    }
                );

            } else {

                await conn.execute(
                    `
                    UPDATE CARRITO_ITEM
                    SET CANTIDAD = :cantidad
                    WHERE ID = :id
                    `,
                    {
                        id,
                        cantidad
                    },
                    {
                        autoCommit: true
                    }
                );
            }


            res.json({
                ok: true
            });

        }
        finally {

            if (conn) {
                await conn.close();
            }
        }
    }
);



module.exports = router;