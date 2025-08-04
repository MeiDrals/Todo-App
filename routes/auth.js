const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// POST /auth/register
router.post("/register", async (req, res) => {
  console.log("→ [REGISTER] req.body:", req.body);

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("🔥 [REGISTER] Error interno:", err.stack);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Usuario ya existe" });
    }
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  console.log("→ [LOGIN] req.body:", req.body);

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });

  try {
    const { rows } = await db.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ token });
  } catch (err) {
    console.error("🔥 [LOGIN] Error interno:", err.stack);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
