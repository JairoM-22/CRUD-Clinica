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
app.get("/api/paciente_clone", async (_req, res) => {
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

app.get("/api/paciente/top-5", async (_req, res) => {
  try {
    const { rows } = await pool.query<Paciente>(
      "SELECT nombre, correo, fecha_registro from paciente order by fecha_registro DESC limit 5;"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los pacientes:", error)
    res.status(500).json({ error: "Error al obtener los pacientes" })
  }
})

app.get("/api/paciente/sin-cita", async (_req, res) => {
  try {
    const { rows } = await pool.query<Paciente>(
      "select a.id, a.nombre from paciente a left JOIN cita b on a.id = b.paciente_id where  b.paciente_id is NULL;"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los pacientes:", error)
    res.status(500).json({ error: "Error al obtener los pacientes" })
  }
})

app.get("/api/citas/marzo/control", async (_req, res) => {
  try {
    const { rows } = await pool.query<Cita>(
      "SELECT * from cita WHERE fecha BETWEEN '2024-03-01' and '2024-03-30' and LOWER(motivo_consulta) = '%Control%'"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar las citas:", error)
    res.status(500).json({ error: "Error al obtener las citas" })
  }
})
//asdas




app.delete("/api/paciente_clone", async (req, res) => {
  const { id } = req.body as { id: number}

  if (!id ) {
    res.status(400).json({ error: "El campo 'id' es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Paciente>(
      `DELETE FROM paciente_clone
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

app.get("/api/cita/pendiente", async (_req, res) => {
  try {
    const { rows } = await pool.query<Cita>(
      "select paciente.nombre , doctor.nombre , cita.fecha, cita.hora from cita join paciente on paciente.id = cita.paciente_id join doctor on doctor.id = cita.doctor_id WHERE estado = 'pendiente'"
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

app.get("/api/doctor/citas", async (_req, res) => {
  try {
    const { rows } = await pool.query<Doctor>(
      "SELECT count(*) as citas , doctor.nombre from cita JOIN doctor on doctor.id = cita.doctor_id GROUP BY doctor.nombre ORDER BY count(*) DESC"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los doctores:", error)
    res.status(500).json({ error: "Error al obtener los doctores" })
  }
})

app.get("/api/doctor/especialidad", async (_req, res) => {
  try {
    const { rows } = await pool.query<Doctor>(
      "SELECT d.id AS doctor_id,d.nombre AS nombre_doctor,e.id AS especialidad_id,e.nombre AS nombre_especialidad FROM doctor d FULL OUTER JOIN especialista es ON d.id = es.doctor_id FULL OUTER JOIN especialidad e ON es.especialidad_id = e.id;"
    )
    res.json(rows)
  } catch (error) {
    console.error("Error al listar los doctores:", error)
    res.status(500).json({ error: "Error al obtener los doctores" })
  }
})

app.get("/api/doctor/estadisticas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `WITH recetas_por_cita AS (
          SELECT
              receta.cita_id,
              COUNT(*) AS cantidad_recetas
          FROM receta
          GROUP BY receta.cita_id
      )

      SELECT
          doctor.id,
          doctor.nombre,
          SUM(recetas_por_cita.cantidad_recetas) AS total_recetas_emitidas,
          ROUND(AVG(recetas_por_cita.cantidad_recetas), 2) AS promedio_recetas_por_cita,
          MAX(
              CASE
                  WHEN cita.estado = 'realizada'
                  THEN cita.fecha
              END
          ) AS ultima_cita_realizada

      FROM doctor

      LEFT JOIN cita
          ON cita.doctor_id = doctor.id

      LEFT JOIN recetas_por_cita
          ON recetas_por_cita.cita_id = cita.id

      GROUP BY doctor.id, doctor.nombre
      ORDER BY doctor.id;`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener las estadísticas de los doctores:", error);
    res.status(500).json({ error: "Error al obtener las estadísticas de los doctores" });
  }
});


app.get("/api/doctor/citas-sobre-promedio", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `WITH citas_por_doctor AS (
          SELECT
              doctor.id,
              doctor.nombre,
              COUNT(cita.id) AS total_citas
          FROM doctor
          LEFT JOIN cita
              ON cita.doctor_id = doctor.id
          GROUP BY doctor.id, doctor.nombre
      )

      SELECT
          id,
          nombre,
          total_citas
      FROM citas_por_doctor

      WHERE total_citas > (
          SELECT AVG(total_citas)
          FROM citas_por_doctor
      );`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los doctores con más citas que el promedio:", error);
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
});



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
app.get("/api/especialidad/con-multiples-doctores", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
          especialidad.nombre AS especialidad,
          COUNT(especialista.doctor_id) AS cantidad_doctores
       FROM especialidad
       INNER JOIN especialista
         ON especialidad.id = especialista.especialidad_id
       GROUP BY especialidad.id, especialidad.nombre
       HAVING COUNT(especialista.doctor_id) >= 2
       ORDER BY cantidad_doctores DESC;`
    );

    res.json(rows);
  } catch (error) {
  console.error(error);
  res.status(500).json(error);
}
});

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

app.get("/api/receta_clone", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM receta_clone ORDER BY id;`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al listar las recetas:", error);
    res.status(500).json({ error: "Error al obtener las recetas" });
  }
});

app.delete("/api/receta/citas-canceladas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM receta_clone WHERE cita_id IN (SELECT id FROM cita WHERE estado = 'cancelada') RETURNING *;`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al eliminar las recetas de citas canceladas:", error);
    res.status(500).json({ error: "Error al eliminar las recetas" });
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

