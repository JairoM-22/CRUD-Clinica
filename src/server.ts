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

//GET
app.get("/api/paciente", async (_req, res) => {
  try {
    const { rows } = await pool.query<Paciente>(
      "SELECT * FROM paciente ORDER BY id ASC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los pacientes:", error)
    res.status(500).json({ error: "Error al obtener los pacientes" })
  }
})

//DELETE
app.delete("/api/paciente", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Paciente>(
      `DELETE FROM paciente
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
  }
})

// Cita
//GET
app.get("/api/cita", async (_req, res) => {
  try {
    const { rows } = await pool.query<Cita>(
      "SELECT * FROM cita ORDER BY id ASC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las citas:", error)
    res.status(500).json({ error: "Error al obtener las citas" })
  }
})
//DELETE

app.delete("/api/cita", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Cita>(
      `DELETE FROM cita
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
  }
})



// Doctor
//GET
app.get("/api/doctor", async (_req, res) => {
  try {
    const { rows } = await pool.query<Doctor>(
      "SELECT * FROM doctor ORDER BY id asc"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los doctores:", error)
    res.status(500).json({ error: "Error al obtener los doctores" })
  }
})

//DELETE

app.delete("/api/doctor", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Doctor>(
      `DELETE FROM doctor
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
  }
})


// Especialidad
//GET
app.get("/api/especialidad", async (_req, res) => {
  try {
    const { rows } = await pool.query<Especialidad>(
      "SELECT * FROM especialidad ORDER BY id ASC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las especialidades:", error)
    res.status(500).json({ error: "Error al obtener las especialidades" })
  }
})

//DELETE
app.delete("/api/especialidad", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Especialidad>(
      `DELETE FROM especialidad
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
  }
})

// Especialista
//GET
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
//DELETE
app.delete("/api/especialista", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Especialista>(
      `DELETE FROM especialista
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
  }
})


// Receta
//GET
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
//DELETE
app.delete("/api/receta", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Receta>(
      `DELETE FROM Receta
       WHERE ID = $1
       RETURNING *`,
       [id || "Anonimo"]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: "Error al crear el mensaje" })
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