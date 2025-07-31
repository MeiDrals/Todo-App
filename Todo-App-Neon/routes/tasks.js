const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Todas las rutas requieren token
router.use(auth);

// GET /tasks
router.get("/", asyncHandler(async (req, res) => {
  const u = req.user.id;
  const { rows } = await db.query(
    "SELECT id, title, checked FROM tasks WHERE user_id = $1 ORDER BY id",
    [u]
  );
  res.json(rows);
}));

// POST /tasks
router.post("/", asyncHandler(async (req, res) => {
  const u = req.user.id;
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Título requerido" });
  }
  const { rows } = await db.query(
    "INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING id, title, checked",
    [title, u]
  );
  res.status(201).json(rows[0]);
}));

// PATCH /tasks/:id
router.patch("/:id", asyncHandler(async (req, res) => {
  const u = req.user.id;
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Título requerido" });
  }
  const { rowCount } = await db.query(
    "UPDATE tasks SET title = $1 WHERE id = $2 AND user_id = $3",
    [title, req.params.id, u]
  );
  if (!rowCount) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json({ success: true });
}));

// PATCH /tasks/:id/complete
router.patch("/:id/complete", asyncHandler(async (req, res) => {
  const u = req.user.id;
  const { checked } = req.body;
  if (typeof checked !== "boolean") {
    return res.status(400).json({ error: "El valor 'checked' debe ser booleano" });
  }
  const { rowCount } = await db.query(
    "UPDATE tasks SET checked = $1 WHERE id = $2 AND user_id = $3",
    [checked, req.params.id, u]
  );
  if (!rowCount) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json({ success: true });
}));

// DELETE /tasks/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const u = req.user.id;
  const { rowCount } = await db.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
    [req.params.id, u]
  );
  res.json({ success: rowCount === 1 });
}));

module.exports = router;
