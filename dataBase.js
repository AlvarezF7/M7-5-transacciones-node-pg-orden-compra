const { Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

})

//verifica la conexion

pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Error de conexión a la base:", err);
  else console.log("Conexión a PostgreSQL OK:", res.rows[0]);
});


module.exports = pool;
