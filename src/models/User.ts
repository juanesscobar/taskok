/**
 * Modelo de Usuario para MongoDB usando Mongoose
 *
 * Define la estructura de datos para usuarios del sistema de gestión de tareas.
 * Incluye validaciones básicas y roles para control de acceso.
 */

import mongoose from "mongoose";

/**
 * Esquema de Mongoose para el modelo User
 * Define la estructura y validaciones de documentos de usuario en MongoDB
 */
const userSchema = new mongoose.Schema({
  /** Nombre completo del usuario */
  name: { type: String, required: true },

  /** Email único del usuario, usado como identificador principal */
  email: { type: String, required: true, unique: true },

  /** Contraseña hasheada del usuario (nunca almacenar en texto plano) */
  password: { type: String, required: true },

  /** Rol del usuario en el sistema */
  role: {
    type: String,
    enum: ["employee", "admin"], // Valores permitidos
    default: "employee" // Valor por defecto para nuevos usuarios
  }
});

/**
 * Modelo User compilado a partir del esquema
 * Proporciona métodos de consulta y manipulación de documentos de usuario
 *
 * @type {mongoose.Model}
 */
export default mongoose.model("User", userSchema);
