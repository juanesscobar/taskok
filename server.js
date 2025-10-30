/**
 * Servidor de desarrollo básico para gestión de tareas
 *
 * Servidor Express minimalista con funcionalidad de autenticación JWT
 * y gestión de tareas usando base de datos en memoria.
 * NOTA: Este archivo parece ser para desarrollo/testing, la aplicación
 * principal está en src/app.ts con estructura más robusta.
 */

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

/** Instancia principal de Express */
const app = express();

/** Puerto del servidor */
const PORT = 3000;

/** Configuración de CORS para permitir requests cross-origin */
app.use(cors());

/** Middleware para parsing de JSON en requests */
app.use(bodyParser.json());

/**
 * Clave secreta para firma de tokens JWT
 * @deprecated Usar variables de entorno en producción
 */
const SECRET = "supersecretkey";

/**
 * Base de datos en memoria para usuarios (desarrollo/testing)
 * @type {Array<{email: string, password: string}>}
 */
let users = [];

/**
 * Base de datos en memoria para tareas con datos de ejemplo
 * @type {Array<{_id: string, title: string, status: string, user: string}>}
 */
let tasks = [
  { _id: "1", title: "feat: Implement auth middleware", status: "pending", user: "test@test.com" },
  { _id: "2", title: "fix: Resolve race condition", status: "in_process", user: "test@test.com" },
  { _id: "3", title: "refactor: Optimize upload service", status: "finished", user: "test@test.com" }
];

/**
 * Middleware de autenticación JWT
 * Valida token en headers Authorization y añade datos del usuario al request
 *
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  // Validar presencia del token
  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    // Verificar y decodificar token JWT
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    // Token inválido o expirado
    res.status(403).json({ message: "Token inválido" });
  }
}

/**
 * Endpoint de registro de usuarios
 * Crea nueva cuenta de usuario con email y contraseña
 *
 * @param {Object} req.body - {email: string, password: string}
 * @param {Object} res - Response con mensaje de confirmación
 */
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  
  // Validar si usuario ya existe
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Usuario ya existe" });
  }
  
  // Agregar nuevo usuario
  users.push({ email, password });
  res.json({ message: "Usuario registrado correctamente" });
});

/**
 * Endpoint de autenticación de usuarios
 * Valida credenciales y retorna token JWT
 *
 * @param {Object} req.body - {email: string, password: string}
 * @param {Object} res - Response con token JWT
 */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  
  // Validar credenciales
  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  // Generar token JWT con expiración de 1 hora
  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

/**
 * Endpoint para obtener información del usuario autenticado
 * Requiere token JWT válido
 *
 * @param {Object} req.user - Datos decodificados del token JWT
 * @param {Object} res - Response con información del usuario
 */
app.get("/api/users/me", auth, (req, res) => {
  const user = users.find((u) => u.email === req.user.email);
  res.json({ email: user.email });
});

/**
 * Endpoint para obtener todas las tareas del usuario autenticado
 * Requiere token JWT válido
 *
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Response con array de tareas del usuario
 */
app.get("/api/tasks", auth, (req, res) => {
  res.json(tasks);
});

/**
 * Endpoint para obtener tareas filtradas por usuario autenticado
 * Requiere token JWT válido
 *
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Response con array de tareas del usuario específico
 */
app.get("/api/tasks/user", auth, (req, res) => {
  const userTasks = tasks.filter((t) => t.user === req.user.email);
  res.json(userTasks);
});

/**
 * Endpoint para obtener historial de tareas completadas del usuario
 * Filtra tareas con status "finished" del usuario autenticado
 *
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Response con array de tareas completadas
 */
app.get("/api/tasks/history", auth, (req, res) => {
  const finishedTasks = tasks.filter((t) => t.status === "finished" && t.user === req.user.email);
  res.json(finishedTasks);
});

/**
 * Endpoint para eliminar una tarea específica por ID
 * Requiere token JWT válido
 *
 * @param {Object} req.params.id - ID de la tarea a eliminar
 * @param {Object} res - Response con mensaje de confirmación
 */
app.delete("/api/tasks/:id", auth, (req, res) => {
  tasks = tasks.filter((t) => t._id !== req.params.id);
  res.json({ message: "Tarea eliminada" });
});

/**
 * Endpoint para limpiar historial de tareas completadas
 * Elimina todas las tareas con status "finished" del usuario autenticado
 *
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Response con mensaje de confirmación
 */
app.delete("/api/tasks/history", auth, (req, res) => {
  tasks = tasks.filter((t) => !(t.status === "finished" && t.user === req.user.email));
  res.json({ message: "Historial eliminado" });
});

/**
 * Inicia el servidor en el puerto especificado
 * @param {number} PORT - Puerto donde escuchar conexiones
 */
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
