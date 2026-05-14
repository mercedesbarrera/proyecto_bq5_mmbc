const express = require("express");
const router = express.Router();
const { getConnection } = require("../db");

// POST contacto
router.post("/contacto", async (req, res) => {
  let conn;

  try {
    const { nombre, email, mensaje } = req.body;

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    conn = await getConnection();

    await conn.execute(
      `INSERT INTO CONTACTO (NOMBRE, EMAIL, MENSAJE)
       VALUES (:nombre, :email, :mensaje)`,
      { nombre, email, mensaje },
      { autoCommit: true }
    );

    res.json({ ok: true });

  } catch (e) {
    console.error("Error en contacto:", e);
    res.status(500).json({
      error: "Error guardando contacto",
      details: e.message
    });
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;
