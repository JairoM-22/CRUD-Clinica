import express from "express"
import cors from "cors"
import pool from "./db.js"
import type { Paciente } from "./tipos.js"
import { inicializarBD } from "./init.js"

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// ─── API REST ───

app.get("/api/pacientes", async (_req, res) => {
  try {
    const { rows } = await pool.query<Paciente>(
      "SELECT * FROM paciente ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los pacientes:", error)
    res.status(500).json({ error: "Error al obtener los pacientes" })
  }
})

// ─── Iniciar servidor ───

inicializarBD()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Error al inicializar la BD:", err)
    process.exit(1)
  })