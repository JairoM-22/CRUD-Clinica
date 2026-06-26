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


// Pacientes
//GET
app.get("/api/paciente", async (_req, res) => {
  try {
    const { rows } = await pool.query<Paciente>(
      "SELECT * FROM paciente_clone ORDER BY id ASC"
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
//PUT
app.put("/api/paciente", async (req, res) => {
  const { id, nombre, correo, fecha_nacimiento, fecha_registro } = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Paciente>(
      `UPDATE paciente_clone
       SET nombre = $1, correo = $2, fecha_nacimiento = $3, fecha_registro = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, correo, fecha_nacimiento, fecha_registro, id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Paciente no encontrado" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});





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
//PUT
app.put("/api/cita", async (req, res) => {
  const {id, paciente_id, doctor_id, fecha, hora, motivo_consulta, estado} = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Cita>(
      `UPDATE cita
       SET paciente_id = $1, doctor_id = $2, fecha = $3, hora = $4, motivo_consulta=$5, estado=$6
       WHERE id = $7
       RETURNING *`,
      [paciente_id, doctor_id, fecha, hora, motivo_consulta, estado ,id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Cita no encontrada" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});






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
//PUT
app.put("/api/doctor", async (req, res) => {
  const {id, nombre, correo, telefono, numero_consultorio} = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Doctor>(
      `UPDATE doctor
       SET nombre = $1, correo = $2, telefono = $3,numero_consultorio = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, correo, telefono, numero_consultorio,id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Doctor no encontrada" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});





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
      `DELETE FROM especialidad_clone
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
//PUT
app.put("/api/especialidad", async (req, res) => {
  const {id, nombre, descripcion} = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Especialidad>(
      `UPDATE especialidad
       SET nombre = $1, descripcion = $2
       WHERE id = $3
       RETURNING *`,
      [nombre, descripcion, id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Especialidad no encontrada" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});





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
//PUT
app.put("/api/especialista", async (req, res) => {
  const {id, doctor_id, especialidad_id} = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Especialista>(
      `UPDATE especialista
       SET doctor_id = $1, especialidad_id = $2
       WHERE id = $3
       RETURNING *`,
      [doctor_id, especialidad_id, id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Especialista no encontrado" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});




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
//PUT
app.put("/api/receta", async (req, res) => {
  const {id, cita_id, medicamento, dosis, instruccion, fecha_emision} = req.body;

  if (!id) {
    res.status(400).json({ error: "El campo 'id' es requerido" });
    return;
  }

  try {
    const { rows } = await pool.query<Receta>(
      `UPDATE receta
       SET cita_id = $1, medicamento = $2, dosis = $3, instruccion = $4,fecha_emision = $5
       WHERE id = $6
       RETURNING *`,
      [cita_id, medicamento, dosis, instruccion, fecha_emision, id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Receta no encontrada" });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});



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