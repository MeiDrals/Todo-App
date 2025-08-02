const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use(cors());
// app.use(cors({ origin: "http://localhost:5500" }));

// JSON
app.use(express.json());

// Rutas
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");

app.use("/auth", authRouter);
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
