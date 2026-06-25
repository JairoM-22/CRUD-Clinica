import pool from "./db.js"

export async function inicializarBD(): Promise<void> {
  const { rows } = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'paciente'
    ) AS existe`
  )

  if (!rows[0]?.existe) {
    throw new Error("La tabla 'paciente' no existe. Verifica la base de datos.")
  }

  console.log("Base de datos lista.")
}