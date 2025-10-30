/**
 * Middleware de autenticación JWT
 *
 * Valida tokens JWT de dos fuentes posibles:
 * - Header Authorization: Bearer <token>
 * - Cookie httpOnly: "token"
 *
 * Extiende el tipo Request para incluir información del usuario autenticado.
 */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Extensión del tipo Request de Express para incluir datos del usuario
 * Incluye información decodificada del token JWT después de validación
 */
export interface AuthRequest extends Request {
  /** Datos del usuario decodificados del token JWT */
  user?: any;
}

/**
 * Middleware de protección de rutas que requiere autenticación JWT
 *
 * Extrae token de múltiples fuentes (headers o cookies), valida su integridad
 * y añade información del usuario al objeto request para uso posterior.
 *
 * @param {AuthRequest} req - Request extendido con propiedad user opcional
 * @param {Response} res - Response object de Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Variable para almacenar el token extraído
  let token: string | undefined;

  // Intentar extraer token del header Authorization: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Si no hay token en header, intentar obtenerlo de cookie httpOnly
  // @ts-ignore - cookie-parser agrega req.cookies dinámicamente
  if (!token && req.cookies?.token) {
    // @ts-ignore
    token = req.cookies.token as string;
  }

  // Si no se encontró token en ninguna fuente, rechazar request
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verificar y decodificar token JWT usando clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Añadir datos decodificados al request para uso en controladores
    req.user = decoded;

    // Continuar al siguiente middleware/controlador
    next();

  } catch (error: any) {
    // Logging de errores solo en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth verify error:", error?.message || String(error));
    }

    // Token inválido, expirado o malformado
    res.status(401).json({ message: "Invalid token" });
  }
};
