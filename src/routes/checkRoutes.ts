/**
 * Rutas de control de tiempo (Check-in/Check-out)
 *
 * Define endpoints para registro de entrada y salida de empleados.
 * Todas las rutas requieren autenticación JWT válida.
 */

import express from "express";
import { checkIn, checkOut } from "../controllers/checkController";
import { protect } from "../middlewares/authMiddleware";

/** Router de Express para rutas de control de tiempo */
const router = express.Router();

/**
 * @route POST /api/check/in
 * @desc Registrar entrada (check-in) del empleado para el día actual
 * @access Privado
 * @note Solo permite un check-in por día por usuario
 */
router.post("/in", protect, checkIn);

/**
 * @route POST /api/check/out
 * @desc Registrar salida (check-out) del empleado y calcular horas trabajadas
 * @access Privado
 * @note Requiere check-in previo para el día actual
 */
router.post("/out", protect, checkOut);

export default router;
