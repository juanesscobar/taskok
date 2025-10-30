/**
 * Controlador de registros de tiempo (Check-in/Check-out)
 *
 * Gestiona el registro de entrada y salida de empleados, calculando
 * automáticamente las horas trabajadas por día.
 */

import { Request, Response } from "express";
import Check from "../models/Check";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Controlador para registrar entrada (check-in) de empleado
 *
 * @param {AuthRequest} req - Request con usuario autenticado
 * @param {Response} res - Response con registro de check-in creado
 * @returns {Promise<void>} Registro de entrada para el día actual
 */
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    // Obtener fecha actual en formato YYYY-MM-DD
    const date = new Date().toISOString().split("T")[0];

    // Verificar si ya existe check-in para hoy
    const existing = await Check.findOne({ userId: req.user.id, date });
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // Crear nuevo registro de check-in
    const check = await Check.create({
      userId: req.user.id,
      date
    });

    res.json(check);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para registrar salida (check-out) de empleado
 *
 * @param {AuthRequest} req - Request con usuario autenticado
 * @param {Response} res - Response con registro actualizado y horas calculadas
 * @returns {Promise<void>} Registro completo con horas trabajadas
 */
export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    // Obtener fecha actual en formato YYYY-MM-DD
    const date = new Date().toISOString().split("T")[0];

    // Buscar registro de check-in del día
    const check = await Check.findOne({ userId: req.user.id, date });
    if (!check) {
      return res.status(404).json({ message: "No check-in found" });
    }

    // Registrar hora de salida
    check.checkOut = new Date();

    // Calcular horas trabajadas en milisegundos y convertir a horas
    const workedMs = check.checkOut.getTime() - check.checkIn.getTime();
    check.workedHours = +(workedMs / 3600000).toFixed(2); // Redondear a 2 decimales

    // Guardar cambios
    await check.save();

    res.json(check);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
