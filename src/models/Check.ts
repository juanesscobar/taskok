/**
 * Modelo de Check (Registro de Tiempo) para MongoDB usando Mongoose
 *
 * Define la estructura de datos para registros de entrada/salida de empleados.
 * Permite seguimiento de horas trabajadas y control de asistencia.
 */

import mongoose from "mongoose";

/**
 * Esquema de Mongoose para el modelo Check
 * Define la estructura para registros de check-in/check-out de empleados
 */
const checkSchema = new mongoose.Schema({
  /** Referencia al usuario (empleado) que realiza el check */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencia al modelo User
    required: true
  },

  /** Fecha y hora de check-in (entrada al trabajo) */
  checkIn: { type: Date, default: Date.now },

  /** Fecha y hora de check-out (salida del trabajo) - opcional hasta completar */
  checkOut: { type: Date },

  /** Número de horas trabajadas calculadas automáticamente */
  workedHours: { type: Number },

  /** Fecha en formato string para consultas por día (formato YYYY-MM-DD) */
  date: { type: String }
});

/**
 * Modelo Check compilado a partir del esquema
 * Proporciona métodos para gestionar registros de tiempo de empleados
 *
 * @type {mongoose.Model}
 */
export default mongoose.model("Check", checkSchema);
