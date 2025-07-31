require("dotenv").config();
["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"].forEach((key) => {
  if (!process.env[key]) throw new Error(`Falta la variable de entorno ${key}`);
});
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
