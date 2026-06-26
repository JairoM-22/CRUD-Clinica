import express from "express"
import cors from "cors"
import pool from "./db.js"
import type { Paciente, Cita, CitaEstado, Doctor, Especialidad, Especialista, Receta } from "./tipos.js"
import { inicializarBD } from "./init.js"

  const app = express()
  const PORT = 3000

  app.use(cors())
  app.use(express.json())

// ─── API REST ───


  // Pacientes
  // GET
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
    const { id, nombre, correo, telefono, fecha_nacimiento, fecha_registro } = req.body;

    if (!id) {
      res.status(400).json({ error: "El campo 'id' es requerido" });
      return;
    }

    try {
      const { rows } = await pool.query<Paciente>(
        `UPDATE paciente
        SET nombre = $1, correo = $2, telefono = $3, fecha_nacimiento = $4, fecha_registro = $5
        WHERE id = $6
        RETURNING *`,
        [nombre, correo, telefono, fecha_nacimiento, fecha_registro, id]
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
  // POST
  app.post("/api/paciente", async (req, res) => {
    const { nombre, correo, telefono, fecha_nacimiento, fecha_registro} = req.body as { id: number; nombre: string; correo: string, telefono: string, fecha_nacimiento: string, fecha_registro: string}

    if (!nombre.trim() || !correo.trim() || !telefono || !fecha_nacimiento.trim() || !fecha_registro.trim()) {
      res.status(400).json({ error: "El campo es requerido" })
      return
    }

    try {
      const { rows } = await pool.query<Paciente>(
        `INSERT INTO paciente (nombre, correo, telefono, fecha_nacimiento, fecha_registro)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [nombre.trim(), correo.trim(), telefono.trim(), fecha_nacimiento.trim(), fecha_registro.trim()]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error("Error al crear mensaje:", error)
      res.status(500).json({ error: "Error al crear el paciente" })
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
  //POST
  app.post("/api/cita", async (req, res) => {
  const { paciente_id, doctor_id, fecha, hora, motivo_consulta, estado} = req.body as { id: number; paciente_id: number; doctor_id: number, fecha: string, hora: string, motivo_consulta: string, estado: CitaEstado} 

  if (!paciente_id || !doctor_id || !fecha.trim() || !hora.trim() || !motivo_consulta.trim() || !estado) {
    res.status(400).json({ error: "El campo es requerido" })
    return
  }

  try {
    const { rows } = await pool.query<Cita>(
      `INSERT INTO cita (paciente_id, doctor_id, fecha, hora, motivo_consulta, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [paciente_id, doctor_id, fecha, hora, motivo_consulta, estado]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    res.status(500).json({ error: String(error) })
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
        [id]
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
  // POST
  app.post("/api/doctor", async (req, res) => {
    const { nombre, correo, telefono, numero_consultorio} = req.body as { id: number; nombre: string; correo: string; telefono: number; numero_consultorio:number} 

    if (!nombre.trim() || !correo.trim() || !telefono || !numero_consultorio) {
      res.status(400).json({ error: "El campo es requerido" })
      return
    }

    try {
      const { rows } = await pool.query<Doctor>(
        `INSERT INTO doctor (nombre, correo, telefono, numero_consultorio)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [nombre, correo, telefono, numero_consultorio]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error("Error al crear mensaje", error)
      res.status(500).json({ error: String(error) })
    }
  })





  // Especialidad
  //GET
  app.get("/api/especialidad", async (_req, res) => {
    try {
      const { rows } = await pool.query<Especialidad>(
        "SELECT * FROM especialidad ORDER BY id asc"
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
  // POST
  app.post("/api/especialidad", async (req, res) => {
    const { nombre, descripcion} = req.body as { id: number; nombre: string; descripcion: string} 

    if (!nombre.trim() || !descripcion.trim()) {
      res.status(400).json({ error: "El campo es requerido" })
      return
    }

    try {
      const { rows } = await pool.query<Especialidad>(
        `INSERT INTO especialidad (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING *`,
        [nombre, descripcion]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error("Error al crear mensaje", error)
      res.status(500).json({ error: String(error) })
    }
  })



  // Especialista
  //GET
  app.get("/api/especialista", async (_req, res) => {
    try {
      const { rows } = await pool.query<Especialista>(
        "SELECT * FROM especialista ORDER BY id asc"
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
  // POST
  app.post("/api/especialista", async (req, res) => {
    const { doctor_id, especialidad_id} = req.body as { id: number; doctor_id: number; especialidad_id: number} 

    if (!doctor_id || !especialidad_id) {
      res.status(400).json({ error: "El campo es requerido" })
      return
    }

    try {
      const { rows } = await pool.query<Especialista>(
        `INSERT INTO especialista (doctor_id, especialidad_id)
        VALUES ($1, $2)
        RETURNING *`,
        [doctor_id, especialidad_id]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error("Error al crear mensaje", error)
      res.status(500).json({ error: String(error) })
    }
  })




  // Receta
  //GET
  app.get("/api/receta", async (_req, res) => {
    try {
      const { rows } = await pool.query<Receta>(
        "SELECT * FROM receta ORDER BY id asc"
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
  // POST
  app.post("/api/receta", async (req, res) => {
    const { cita_id, medicamento, dosis, instruccion, fecha_emision} = req.body as { id: number; cita_id: number; medicamento: string, dosis: string, instruccion: string, fecha_emision: string} 

    if (!cita_id || !medicamento.trim() || !dosis.trim() || !instruccion.trim() || !fecha_emision.trim()) {
      res.status(400).json({ error: "El campo es requerido" })
      return
    }

    try {
      const { rows } = await pool.query<Receta>(
        `INSERT INTO receta (cita_id, medicamento, dosis, instruccion, fecha_emision)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [cita_id, medicamento, dosis, instruccion, fecha_emision]
      )

      res.status(201).json(rows[0])
    } catch (error) {
      console.error("Error al crear mensaje", error)
      res.status(500).json({ error: String(error) })
    }
  })










////////////////// QUERIES ESPECIALES ////////////////////


  
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

    app.delete("/api/receta/citas-canceladas", async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `DELETE FROM receta WHERE cita_id IN (SELECT id FROM cita WHERE estado = 'cancelada') RETURNING *;`
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

