/**
 * Rutas de gestión de tareas
 *
 * Define todos los endpoints REST para operaciones CRUD de tareas.
 * Todas las rutas requieren autenticación JWT válida.
 */

import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from "../controllers/taskController";
import { protect } from "../middlewares/authMiddleware";

/** Router de Express para rutas de tareas */
const router = express.Router();

/**
 * @route GET /api/tasks
 * @desc Obtener tareas del usuario con filtrado opcional por estado
 * @access Privado
 * @query {status?: "pending"|"in_progress"|"completed"}
 */
router.get("/", protect, getTasks);

/**
 * @route GET /api/tasks/:id
 * @desc Obtener tarea específica por ID
 * @access Privado
 * @param {string} id - ID de la tarea
 */
router.get("/:id", protect, getTaskById);

/**
 * @route POST /api/tasks
 * @desc Crear nueva tarea
 * @access Privado
 * @body {title: string, description?: string, status?: string, link?: string}
 */
router.post("/", protect, createTask);

/**
 * @route PUT /api/tasks/:id
 * @desc Actualizar tarea completa
 * @access Privado
 * @param {string} id - ID de la tarea
 * @body {title?: string, description?: string, status?: string, link?: string}
 */
router.put("/:id", protect, updateTask);

/**
 * @route PATCH /api/tasks/:id
 * @desc Actualizar tarea parcialmente (alias de PUT)
 * @access Privado
 * @param {string} id - ID de la tarea
 * @body {title?: string, description?: string, status?: string, link?: string}
 */
router.patch("/:id", protect, updateTask);

/**
 * @route DELETE /api/tasks/:id
 * @desc Eliminar tarea
 * @access Privado
 * @param {string} id - ID de la tarea
 */
router.delete("/:id", protect, deleteTask);

/**
 * @route PATCH /api/tasks/:id/status
 * @desc Actualizar solo el estado de una tarea
 * @access Privado
 * @param {string} id - ID de la tarea
 * @body {status: "pending"|"in_progress"|"completed"}
 */
router.patch("/:id/status", protect, updateTaskStatus);

export default router;
