const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};
