import pg from "pg"

const pool = new pg.Pool({
  user: "estudiante",
  password: "pass123",
  host: "localhost",
  port: 5432,
  database: "clinica"
})

pool.on("error", (err) => {
  console.error("Error en el pool de PostgreSQL:", err)
  process.exit(-1)
})

export default pool