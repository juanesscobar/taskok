/**
 * Rutas de autenticación
 *
 * Define los endpoints para registro, login y obtención de información
 * del usuario autenticado. Todas las rutas protegidas requieren token JWT válido.
 */

import express from "express";
import { register, login, me } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

/** Router de Express para rutas de autenticación */
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario
 * @access Público
 * @body {name: string, email: string, password: string}
 */
router.post("/register", register);

/**
 * @route POST /api/auth/login
 * @desc Autenticar usuario existente
 * @access Público
 * @body {email: string, password: string}
 */
router.post("/login", login);

/**
 * @route GET /api/auth/me
 * @desc Obtener información del usuario autenticado
 * @access Privado (requiere token JWT)
 */
router.get("/me", protect, me);

export default router;
