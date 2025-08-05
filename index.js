const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

require("dotenv").config();

// Configuración de la conexión a la base de datos
const isProduction = process.env.NODE_ENV === "production";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Verificar conexión a la base de datos
pool
  .query("SELECT NOW()")
  .then(() => console.log("✔️ Conexión a la base de datos establecida"))
  .catch((err) =>
    console.error("❌ Error conectando a la BD (SELECT NOW):", err.stack)
  );

const app = express();

// CORS
// app.use(cors());
// app.use(cors({ origin: "http://localhost:5500" }));

// Rate limiter para /auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Vuelve a intentarlo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// JSON
app.use(express.json());

// Middleware
app.use(express.static(path.join(__dirname, "public")));

// Rutas
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");

app.use("/auth", authLimiter, authRouter);
app.use("/tasks", tasksRouter);

// Middleware de errores globales
app.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
