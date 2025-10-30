/**
 * Modelo de Tarea para MongoDB usando Mongoose
 *
 * Define la estructura de datos para tareas en el sistema de gestión.
 * Cada tarea está asociada a un usuario y puede tener diferentes estados
 * durante su ciclo de vida.
 */

import mongoose from "mongoose";

/**
 * Esquema de Mongoose para el modelo Task
 * Define la estructura completa de una tarea con referencias y validaciones
 */
const taskSchema = new mongoose.Schema({
  /** Referencia al usuario propietario de la tarea */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencia al modelo User
    required: true
  },

  /** Título descriptivo de la tarea */
  title: { type: String, required: true },

  /** Descripción detallada opcional de la tarea */
  description: { type: String },

  /** Enlace opcional asociado a la tarea (URL externa o interna) */
  link: { type: String },

  /** Estado actual de la tarea en su ciclo de vida */
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"], // Estados permitidos
    default: "pending" // Estado inicial por defecto
  },

  /** Fecha de creación automática de la tarea */
  createdAt: { type: Date, default: Date.now }
});

/**
 * Modelo Task compilado a partir del esquema
 * Proporciona métodos para crear, consultar y modificar tareas
 *
 * @type {mongoose.Model}
 */
export default mongoose.model("Task", taskSchema);
