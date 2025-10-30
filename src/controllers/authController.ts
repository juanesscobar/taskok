/**
 * Controlador de autenticación para gestión de usuarios
 *
 * Maneja operaciones de registro, login y obtención de información del usuario
 * autenticado. Incluye hashing de contraseñas, generación de tokens JWT
 * y configuración segura de cookies.
 */

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateToken } from "../utils/generateTokens";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Configuración de cookies para tokens JWT
 * Configuración segura para desarrollo (sin HTTPS) y producción
 */
const cookieOptions = {
  httpOnly: true, // Previene acceso desde JavaScript del cliente
  sameSite: "lax" as const, // Protección CSRF básica
  secure: false, // false en desarrollo (sin HTTPS), true en producción
  path: "/",
  maxAge: 60 * 60 * 1000 // 1 hora en milisegundos
};

/**
 * Controlador para registro de nuevos usuarios
 *
 * @param {Request} req - Request con {name, email, password} en body
 * @param {Response} res - Response con token JWT y cookie de sesión
 * @returns {Promise<void>} Usuario creado con token de autenticación
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si usuario ya existe
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash de contraseña con salt rounds = 10
    const hashed = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const user = await User.create({ name, email, password: hashed });

    // Generar token JWT
    const token = generateToken({ id: user.id });

    // Configurar cookie httpOnly con token
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ token });

  } catch (error) {
    // Logging solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("Register error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para autenticación de usuarios existentes
 *
 * @param {Request} req - Request con {email, password} en body
 * @param {Response} res - Response con token JWT y cookie de sesión
 * @returns {Promise<void>} Usuario autenticado con token de sesión
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verificar contraseña con hash almacenado
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generar token JWT para sesión
    const token = generateToken({ id: user.id });

    // Configurar cookie httpOnly con token
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({ token });

  } catch (error) {
    // Logging solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("Login error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controlador para obtener información del usuario autenticado
 *
 * @param {AuthRequest} req - Request con usuario autenticado en req.user
 * @param {Response} res - Response con información del usuario
 * @returns {Promise<void>} Datos del usuario actual (id, name, email, role)
 */
export const me = async (req: AuthRequest, res: Response) => {
  try {
    // Validar que existe usuario en request (middleware de auth)
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Obtener usuario con campos específicos (excluir password)
    const user = await User.findById(req.user.id).select("_id name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Evitar cache de respuesta de sesión en navegadores
    res.set("Cache-Control", "no-store");
    res.json({ user });

  } catch (error) {
    // Logging solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("Me error:", error);
    }
    res.status(500).json({ message: "Server error" });
  }
};
