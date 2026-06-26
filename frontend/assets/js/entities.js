// ───────────────────────────────────────────────────────────
//  entities.js — Descriptores de cada entidad.
//  Cada bloque declara EXPLÍCITAMENTE los campos que el backend
//  espera en el cuerpo de cada request (ver src/server.ts), para
//  no enviar ni de más ni de menos. El frontend se adapta al
//  backend, nunca al revés.
// ───────────────────────────────────────────────────────────

// Valores de estado según el contrato oficial del backend (src/tipos.ts:
//   CitaEstado = "pendiente" | "confirmada" | "cancelada" | "completada").
// Nota: algunas consultas SQL del backend referencian 'realizada', que NO
// está en el tipo. Respetamos el tipo declarado como fuente de verdad.
const ESTADOS_CITA = ["pendiente", "confirmada", "cancelada", "realizada"];

// Helper para fecha de hoy en formato YYYY-MM-DD (para inputs date).
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Etiquetas legibles para llaves foráneas en los <select>.
const labelPaciente = (p) => `#${p.id} · ${p.nombre}`;
const labelDoctor = (d) => `#${d.id} · ${d.nombre}`;
const labelEspecialidad = (e) => `#${e.id} · ${e.nombre}`;
const labelCita = (c) =>
  `#${c.id} · ${c.fecha ?? ""} ${c.hora ?? ""} (pac ${c.paciente_id} / doc ${c.doctor_id})`;

// Cada entidad:
//   recurso    -> segmento de ruta (/api/<recurso>)
//   singular   -> texto para botones/títulos
//   plural     -> título de la vista
//   icon       -> glifo SVG (id en index.html)
//   columns    -> columnas visibles en la tabla
//   fields     -> campos del formulario (create/edit)
//
// Propiedades de un campo:
//   name, label, type ('text'|'email'|'number'|'date'|'time'|'select'|'fk')
//   required     -> obligatorio (marca * y valida no-vacío)
//   options      -> para type 'select'
//   fk           -> { recurso, labelFn } para type 'fk'
//   scope        -> 'both' (por defecto) | 'create' (solo al crear)
//   lockedOnEdit -> se muestra deshabilitado al editar y NO se envía en PUT
//   default      -> función que retorna valor inicial al crear
const ENTITIES = {
  paciente: {
    recurso: "paciente",
    singular: "paciente",
    genero: "m",
    plural: "Pacientes",
    icon: "icon-user",
    columns: [
      { name: "id", label: "ID" },
      { name: "nombre", label: "Nombre" },
      { name: "correo", label: "Correo" },
      { name: "telefono", label: "Teléfono" },
      { name: "fecha_nacimiento", label: "Nacimiento", type: "date" },
      { name: "fecha_registro", label: "Registro", type: "date" },
    ],
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "correo", label: "Correo", type: "email", required: true },
      // POST exige telefono; PUT no lo actualiza -> solo al crear / bloqueado al editar.
      {
        name: "telefono",
        label: "Teléfono",
        type: "text",
        required: true,
      },
      {
        name: "fecha_nacimiento",
        label: "Fecha de nacimiento",
        type: "date",
        required: true,
      },
      {
        name: "fecha_registro",
        label: "Fecha de registro",
        type: "date",
        required: true,
        default: hoyISO,
      },
    ],
  },

  doctor: {
    recurso: "doctor",
    singular: "doctor",
    genero: "m",
    plural: "Doctores",
    icon: "icon-stethoscope",
    columns: [
      { name: "id", label: "ID" },
      { name: "nombre", label: "Nombre" },
      { name: "correo", label: "Correo" },
      { name: "telefono", label: "Teléfono" },
      { name: "numero_consultorio", label: "Consultorio" },
    ],
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "correo", label: "Correo", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "text", required: true },
      {
        name: "numero_consultorio",
        label: "Número de consultorio",
        type: "number",
        required: true,
      },
    ],
  },

  cita: {
    recurso: "cita",
    singular: "cita",
    genero: "f",
    plural: "Citas",
    icon: "icon-calendar",
    columns: [
      { name: "id", label: "ID" },
      { name: "paciente_id", label: "Paciente" },
      { name: "doctor_id", label: "Doctor" },
      { name: "fecha", label: "Fecha", type: "date" },
      { name: "hora", label: "Hora" },
      { name: "motivo_consulta", label: "Motivo" },
      { name: "estado", label: "Estado", type: "estado" },
    ],
    fields: [
      {
        name: "paciente_id",
        label: "Paciente",
        type: "fk",
        required: true,
        fk: { recurso: "paciente", labelFn: labelPaciente },
      },
      {
        name: "doctor_id",
        label: "Doctor",
        type: "fk",
        required: true,
        fk: { recurso: "doctor", labelFn: labelDoctor },
      },
      {
        name: "fecha",
        label: "Fecha",
        type: "date",
        required: true,
        default: hoyISO,
      },
      { name: "hora", label: "Hora", type: "time", required: true },
      {
        name: "motivo_consulta",
        label: "Motivo de consulta",
        type: "text",
        required: true,
      },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        required: true,
        options: ESTADOS_CITA,
      },
    ],
  },

  especialidad: {
    recurso: "especialidad",
    singular: "especialidad",
    genero: "f",
    plural: "Especialidades",
    icon: "icon-tag",
    columns: [
      { name: "id", label: "ID" },
      { name: "nombre", label: "Nombre" },
      { name: "descripcion", label: "Descripción" },
    ],
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      {
        name: "descripcion",
        label: "Descripción",
        type: "text",
        required: true,
      },
    ],
  },

  especialista: {
    recurso: "especialista",
    singular: "especialista",
    genero: "m",
    plural: "Especialistas",
    icon: "icon-link",
    columns: [
      { name: "id", label: "ID" },
      { name: "doctor_id", label: "Doctor" },
      { name: "especialidad_id", label: "Especialidad" },
    ],
    fields: [
      {
        name: "doctor_id",
        label: "Doctor",
        type: "fk",
        required: true,
        fk: { recurso: "doctor", labelFn: labelDoctor },
      },
      {
        name: "especialidad_id",
        label: "Especialidad",
        type: "fk",
        required: true,
        fk: { recurso: "especialidad", labelFn: labelEspecialidad },
      },
    ],
  },

  receta: {
    recurso: "receta",
    singular: "receta",
    genero: "f",
    plural: "Recetas",
    icon: "icon-pill",
    columns: [
      { name: "id", label: "ID" },
      { name: "cita_id", label: "Cita" },
      { name: "medicamento", label: "Medicamento" },
      { name: "dosis", label: "Dosis" },
      { name: "instruccion", label: "Instrucción" },
      { name: "fecha_emision", label: "Emisión", type: "date" },
    ],
    fields: [
      {
        name: "cita_id",
        label: "Cita",
        type: "fk",
        required: true,
        fk: { recurso: "cita", labelFn: labelCita },
      },
      { name: "medicamento", label: "Medicamento", type: "text", required: true },
      { name: "dosis", label: "Dosis", type: "text", required: true },
      { name: "instruccion", label: "Instrucción", type: "text", required: true },
      {
        name: "fecha_emision",
        label: "Fecha de emisión",
        type: "date",
        required: true,
        default: hoyISO,
      },
    ],
  },
};

// Orden de navegación de las entidades en la barra lateral.
const ENTIDADES_ORDEN = [
  "paciente",
  "doctor",
  "cita",
  "especialidad",
  "especialista",
  "receta",
];

// Descriptores de las consultas especiales (solo lectura, salvo la última).
const CONSULTAS = [
  {
    id: "pacientesTop5",
    titulo: "Últimos 5 pacientes registrados",
    descripcion: "Pacientes más recientes por fecha de registro.",
    fn: () => Api.consultas.pacientesTop5(),
  },
  {
    id: "pacientesSinCita",
    titulo: "Pacientes sin cita",
    descripcion: "Pacientes que aún no tienen ninguna cita asociada.",
    fn: () => Api.consultas.pacientesSinCita(),
  },
  {
    id: "citasPendientes",
    titulo: "Citas pendientes",
    descripcion: "Citas en estado pendiente con paciente y doctor.",
    fn: () => Api.consultas.citasPendientes(),
  },
  {
    id: "citasMarzoControl",
    titulo: "Citas de control (marzo)",
    descripcion:
      "Citas de control en marzo. Según el SQL del backend puede devolver vacío.",
    fn: () => Api.consultas.citasMarzoControl(),
  },
  {
    id: "doctorCitas",
    titulo: "Doctores por número de citas",
    descripcion: "Conteo de citas agrupado por doctor.",
    fn: () => Api.consultas.doctorCitas(),
  },
  {
    id: "doctorEspecialidad",
    titulo: "Doctores y especialidades",
    descripcion: "Relación de doctores con sus especialidades (full outer join).",
    fn: () => Api.consultas.doctorEspecialidad(),
  },
  {
    id: "doctorEstadisticas",
    titulo: "Estadísticas por doctor",
    descripcion: "Total y promedio de recetas, y última cita realizada.",
    fn: () => Api.consultas.doctorEstadisticas(),
  },
  {
    id: "doctorCitasSobrePromedio",
    titulo: "Doctores con citas sobre el promedio",
    descripcion: "Doctores cuyo total de citas supera el promedio general.",
    fn: () => Api.consultas.doctorCitasSobrePromedio(),
  },
  {
    id: "especialidadMultiplesDoctores",
    titulo: "Especialidades con 2+ doctores",
    descripcion: "Especialidades atendidas por dos o más doctores.",
    fn: () => Api.consultas.especialidadMultiplesDoctores(),
  },
];
