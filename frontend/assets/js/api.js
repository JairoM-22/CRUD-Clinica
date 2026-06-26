// ───────────────────────────────────────────────────────────
//  api.js — Capa de comunicación con el backend Express (:3000)
//  No cambia ningún contrato: respeta rutas, métodos y cuerpos
//  exactamente como están definidos en src/server.ts.
// ───────────────────────────────────────────────────────────

// El backend corre en http://localhost:3000 (ver src/server.ts -> PORT = 3000).
// Se puede ajustar en caliente desde la barra de conexión del panel.
let API_BASE = "http://localhost:3000";

function getApiBase() {
  return API_BASE;
}

function setApiBase(url) {
  API_BASE = url.replace(/\/+$/, ""); // sin barra final
}

// Petición genérica. Para DELETE/PUT el backend espera el `id` (y demás
// campos) en el CUERPO, no en la URL: aquí simplemente reenviamos el body.
async function request(method, path, body) {
  const opciones = { method, headers: {} };

  if (body !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(body);
  }

  let respuesta;
  try {
    respuesta = await fetch(getApiBase() + path, opciones);
  } catch (e) {
    // Falla de red: típicamente el backend no está corriendo o CORS/origen.
    throw new Error(
      "No se pudo conectar con el servidor en " +
        getApiBase() +
        ". Verifica que el backend esté corriendo (npm run dev)."
    );
  }

  // Algunas respuestas (p. ej. DELETE sin coincidencia) pueden venir vacías.
  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  if (!respuesta.ok) {
    const mensaje =
      datos && datos.error
        ? datos.error
        : "Error " + respuesta.status + " en " + method + " " + path;
    throw new Error(mensaje);
  }

  return datos;
}

// ─── CRUD genérico por entidad ───
// `recurso` es el segmento de la ruta: "paciente", "cita", "doctor", etc.
const Api = {
  listar(recurso) {
    return request("GET", "/api/" + recurso);
  },
  crear(recurso, datos) {
    return request("POST", "/api/" + recurso, datos);
  },
  actualizar(recurso, datos) {
    // El backend toma el id desde el body.
    return request("PUT", "/api/" + recurso, datos);
  },
  eliminar(recurso, id) {
    // El backend toma el id desde el body.
    return request("DELETE", "/api/" + recurso, { id });
  },

  // ─── Consultas especiales (solo lectura, salvo la última) ───
  // Mapean 1:1 con las rutas definidas en src/server.ts.
  consultas: {
    pacientesTop5: () => request("GET", "/api/paciente/top-5"),
    pacientesSinCita: () => request("GET", "/api/paciente/sin-cita"),
    citasMarzoControl: () => request("GET", "/api/citas/marzo/control"),
    citasPendientes: () => request("GET", "/api/cita/pendiente"),
    doctorCitas: () => request("GET", "/api/doctor/citas"),
    doctorEspecialidad: () => request("GET", "/api/doctor/especialidad"),
    doctorEstadisticas: () => request("GET", "/api/doctor/estadisticas"),
    doctorCitasSobrePromedio: () =>
      request("GET", "/api/doctor/citas-sobre-promedio"),
    especialidadMultiplesDoctores: () =>
      request("GET", "/api/especialidad/con-multiples-doctores"),
    // Acción destructiva del backend:
    eliminarRecetasCitasCanceladas: () =>
      request("DELETE", "/api/receta/citas-canceladas"),
  },

  // Comprobación de conexión: usamos un GET liviano existente.
  ping() {
    return request("GET", "/api/paciente");
  },
};
