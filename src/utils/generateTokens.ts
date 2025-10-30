/**
 * Utilidades para generación y gestión de tokens JWT
 *
 * Proporciona funciones para crear tokens de autenticación seguros
 * con configuración centralizada de clave secreta y expiración.
 */

import jwt from "jsonwebtoken";

/**
 * Obtiene la clave secreta para firma de tokens JWT
 * Prioriza variable de entorno JWT_SECRET, usa valor por defecto en desarrollo
 *
 * @returns {string} Clave secreta para firma JWT
 */
const getSecret = (): string => process.env.JWT_SECRET || "secret";

/**
 * Genera un token JWT firmado con datos del usuario
 *
 * @param {object} payload - Datos a incluir en el token
 * @param {string} payload.id - ID único del usuario
 * @returns {string} Token JWT firmado válido por 1 hora
 *
 * @example
 * const token = generateToken({ id: "user123" });
 * // Retorna: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export const generateToken = (payload: { id: string }): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: "1h" });
};
