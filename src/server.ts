import express from "express"
import cors from "cors"
import pool from "./db.js"
import type { Paciente, Cita, Doctor, Especialidad, Especialista, Receta } from "./tipos.js"
import { inicializarBD } from "./init.js"

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// ─── API REST ───

// GETTERS
// Pacientes
app.get("/api/paciente", async (_req, res) => {
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

// Cita
app.get("/api/cita", async (_req, res) => {
  try {
    const { rows } = await pool.query<Cita>(
      "SELECT * FROM cita ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las citas:", error)
    res.status(500).json({ error: "Error al obtener las citas" })
  }
})

// Doctor
app.get("/api/doctor", async (_req, res) => {
  try {
    const { rows } = await pool.query<Doctor>(
      "SELECT * FROM doctor ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los doctores:", error)
    res.status(500).json({ error: "Error al obtener los doctores" })
  }
})

// Especialidad
app.get("/api/especialidad", async (_req, res) => {
  try {
    const { rows } = await pool.query<Especialidad>(
      "SELECT * FROM especialidad ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las especialidades:", error)
    res.status(500).json({ error: "Error al obtener las especialidades" })
  }
})

// Especialista
app.get("/api/especialista", async (_req, res) => {
  try {
    const { rows } = await pool.query<Especialista>(
      "SELECT * FROM especialista ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los especialistas:", error)
    res.status(500).json({ error: "Error al obtener los especialistas" })
  }
})

// Receta
app.get("/api/receta", async (_req, res) => {
  try {
    const { rows } = await pool.query<Receta>(
      "SELECT * FROM receta ORDER BY id DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las recetas:", error)
    res.status(500).json({ error: "Error al obtener las recetas" })
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