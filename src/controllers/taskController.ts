/**
 * Controlador de tareas para gestión completa del ciclo de vida de tareas
 *
 * Proporciona operaciones CRUD completas para tareas con validaciones,
 * filtrado por usuario autenticado y control de estados.
 */

import { Request, Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middlewares/authMiddleware";

/** Estados válidos para tareas según el flujo de trabajo */
const ALLOWED_STATUS = ["pending", "in_progress", "completed"] as const;

/**
 * Controlador para crear una nueva tarea
 *
 * @param {AuthRequest} req - Request con usuario autenticado y datos de tarea
 * @param {Response} res - Response con tarea creada
 * @returns {Promise<void>} Nueva tarea creada con ID generado
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, link } = req.body || {};

    // Validación de título requerido
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Normalización de estado con valor por defecto
    let normalizedStatus = "pending";
    if (status && ALLOWED_STATUS.includes(status)) {
      normalizedStatus = status;
    }

    // Crear tarea con sanitización de datos
    const task = await Task.create({
      userId: req.user.id, // Usuario propietario de la tarea
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      link: typeof link === "string" ? link.trim() : undefined,
      status: normalizedStatus
    });

    return res.status(201).json(task);
  } catch (error) {
    // Logging de errores solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("createTask error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para obtener tareas del usuario con filtrado opcional
 *
 * @param {AuthRequest} req - Request con query params opcionales (status)
 * @param {Response} res - Response con array de tareas ordenadas por fecha
 * @returns {Promise<void>} Lista de tareas del usuario, opcionalmente filtradas
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    // Query base: solo tareas del usuario autenticado
    const query: any = { userId: req.user.id };

    // Filtrado opcional por estado si es válido
    if (status && ALLOWED_STATUS.includes(status as any)) {
      query.status = status;
    }

    // Obtener tareas ordenadas por fecha de creación (más recientes primero)
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("getTasks error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para obtener una tarea específica por ID
 *
 * @param {AuthRequest} req - Request con ID de tarea en params
 * @param {Response} res - Response con datos completos de la tarea
 * @returns {Promise<void>} Tarea específica si pertenece al usuario
 */
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar tarea por ID asegurando que pertenece al usuario
    const task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("getTaskById error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para actualizar una tarea existente
 *
 * @param {AuthRequest} req - Request con ID en params y campos a actualizar en body
 * @param {Response} res - Response con tarea actualizada
 * @returns {Promise<void>} Tarea con cambios aplicados
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, link } = req.body;

    // Construir objeto de actualización solo con campos proporcionados
    const updateData: any = {};

    // Validación y sanitización de título
    if (title !== undefined) {
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title is required and must be a non-empty string" });
      }
      updateData.title = title.trim();
    }

    // Sanitización de descripción (puede ser null/undefined)
    if (description !== undefined) {
      updateData.description = typeof description === "string" ? description.trim() : undefined;
    }

    // Sanitización de enlace (puede ser null/undefined)
    if (link !== undefined) {
      updateData.link = typeof link === "string" ? link.trim() : undefined;
    }

    // Validación de estado
    if (status !== undefined) {
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      updateData.status = status;
    }

    // Actualizar tarea con validaciones de esquema
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Asegurar propiedad del usuario
      updateData,
      { new: true, runValidators: true } // Retornar documento actualizado y validar
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("updateTask error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para eliminar una tarea
 *
 * @param {AuthRequest} req - Request con ID de tarea en params
 * @param {Response} res - Response con confirmación de eliminación
 * @returns {Promise<void>} Confirmación de eliminación exitosa
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Eliminar tarea asegurando que pertenece al usuario
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("deleteTask error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para actualizar únicamente el estado de una tarea
 *
 * @param {AuthRequest} req - Request con ID en params y nuevo status en body
 * @param {Response} res - Response con tarea con estado actualizado
 * @returns {Promise<void>} Tarea con nuevo estado aplicado
 */
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado proporcionado es válido
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Actualizar solo el campo status
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Asegurar propiedad del usuario
      { status },
      { new: true } // Retornar documento actualizado
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("updateTaskStatus error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};
