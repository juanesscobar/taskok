/**
 * Aplicación principal Express para gestión de tareas (TaskOK)
 *
 * Configura y exporta la instancia principal de Express con:
 * - Configuración de CORS para desarrollo y producción
 * - Middlewares de seguridad y parsing
 * - Rutas API organizadas por módulos
 * - Servidor de archivos estáticos para frontend
 * - Manejo de errores global
 */

import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import checkRoutes from './routes/checkRoutes';
import taskRoutes from './routes/taskRoutes';
import { mongoose } from './config/db';

/** Carga variables de entorno desde archivo .env */
dotenv.config();

/** Instancia principal de la aplicación Express */
const app = express();

/**
 * Configuración de confianza en proxy para cookies
 * Necesario cuando la aplicación está detrás de proxies o contenedores
 */
app.set('trust proxy', 1);

/**
 * Lista de orígenes permitidos para CORS
 * Incluye localhost en diferentes puertos para desarrollo y producción
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  // Permitir orígenes dinámicos en producción (Render.com)
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  // Permitir cualquier origen en desarrollo
  ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
];

/**
 * Configuración de CORS con validación de origen
 * Permite credenciales y métodos específicos para API REST
 * En producción permite cualquier origen si CORS_ORIGIN no está definido
 */
const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // En desarrollo permitir cualquier origen o orígenes específicos
    if (process.env.NODE_ENV === 'development') {
      return cb(null, true);
    }
    // En producción, validar orígenes permitidos
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true, // Permitir envío de cookies/credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/** Aplicar configuración CORS a todas las rutas */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejar preflight requests

/** Middleware para parsing de JSON en requests */
app.use(express.json());

/** Middleware para parsing de cookies */
app.use(cookieParser());

/**
 * Middleware de logging para desarrollo
 * Registra método, URL, código de respuesta y tiempo de ejecución
 */
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${Date.now() - started}ms`);
    }
  });
  next();
});

/**
 * Servir archivos estáticos del frontend desde directorio /public
 * Permite acceso directo a archivos HTML, CSS, JS e imágenes
 */
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Endpoint raíz de la API
 * Retorna información básica del servicio
 */
app.get('/', (_req, res) => res.json({ ok: true, service: 'taskok-api' }));

/**
 * Endpoint de health check para monitoreo
 * Retorna estado del servicio en formato JSON
 */
app.get('/api/health', (_req, res) => {
  res.type('application/json').status(200).send('{"ok": true, "service": "taskok-api"}');
});

/**
 * Rutas para servir páginas estáticas del frontend
 * Permite navegación directa desde URLs específicas
 */
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/mis-tareas', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/mis_tareas.html'));
});

app.get('/ajustes', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/ajustes.html'));
});

/**
 * Redirección por typo común en URL
 * Corrige '/dasboard' a '/dashboard' para mejor UX
 */
app.get('/dasboard', (_req, res) => {
  res.redirect('/dashboard');
});

/**
 * Montaje de rutas API organizadas por módulos
 * Cada módulo maneja su propio conjunto de endpoints
 */
app.use('/api/auth', authRoutes);    // Rutas de autenticación
app.use('/api/check', checkRoutes);  // Rutas de verificación/salud
app.use('/api/tasks', taskRoutes);   // Rutas de gestión de tareas

/**
 * Middleware de manejo de rutas no encontradas (404)
 * Retorna error JSON con información de la ruta solicitada
 */
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));

/**
 * Middleware global de manejo de errores
 * Captura errores no manejados y retorna respuesta de error genérica
 *
 * @param {any} err - Error capturado
 * @param {express.Request} _req - Request object (no usado)
 * @param {express.Response} res - Response object
 * @param {express.NextFunction} _next - Next function (no usado)
 */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
