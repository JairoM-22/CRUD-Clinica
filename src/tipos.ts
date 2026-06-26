type FechaISO = string
export type CitaEstado = "pendiente" | "confirmada" | "cancelada" | "realizada"

export interface Paciente {
  id: number
  nombre: string
  correo: string
  fecha_nacimiento: string
  fecha_registro: string
}

export interface Cita {
  id: number
  paciente_id: number
  doctor_id: number
  fecha: FechaISO
  hora: string
  motivo_consulta: string
  estado: CitaEstado

}

export interface Doctor {
  id: number
  nombre: string
  correo: string
  telefono: string
  numero_consultorio: number
}

export interface Especialidad {
  id: number
  nombre: string
  descripcion: string
}

export interface Especialista {
  id: number
  doctor_id: number
  especialidad_id: number
}

export interface Receta {
  id: number
  cita_id: number
  medicamento: string
  dosis: string
  instruccion: string
  fecha_emision: string
}