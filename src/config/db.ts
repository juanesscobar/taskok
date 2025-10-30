/**
 * Configuración y gestión de conexión a MongoDB
 *
 * Módulo para establecer y mantener la conexión con la base de datos MongoDB
 * usando Mongoose. Incluye funciones de utilidad para el estado de la conexión
 * y manejo de errores.
 */

import mongoose from 'mongoose';

/**
 * URI de conexión a MongoDB desde variables de entorno o valor por defecto
 * Soporta tanto conexiones locales como externas (MongoDB Atlas)
 * @type {string}
 */
const MONGO_URI = process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD && process.env.MONGODB_HOST
    ? `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE || 'taskok'}?retryWrites=true&w=majority`
    : 'mongodb://localhost:27017/taskok');

/**
 * Función utilitaria para enmascarar credenciales en URIs de conexión
 * Oculta información sensible (usuario:contraseña) en los logs por seguridad
 *
 * @param {string} uri - URI original de MongoDB
 * @returns {string} URI con credenciales enmascaradas
 */
const redactUri = (uri: string) => uri.replace(/\/\/.*@/, '//<redacted>@');

/**
 * Obtiene el estado actual de la conexión MongoDB
 * Mapea los códigos de estado de Mongoose a strings descriptivos
 *
 * @returns {string} Descripción del estado actual de la conexión
 * @example 'connected', 'connecting', 'disconnected', 'disconnecting', 'unknown'
 */
export const getDBState = () => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Establece conexión con MongoDB usando Mongoose
 *
 * Funcionalidades:
 * - Configuración estricta de queries para prevenir campos no definidos
 * - Manejo de eventos de conexión (error, desconexión)
 * - Logging detallado con métricas de tiempo de conexión
 * - Enmascaramiento de URIs en logs por seguridad
 * - Terminación del proceso en caso de error de conexión
 *
 * @async
 * @throws {Error} Si falla la conexión a MongoDB, termina el proceso
 */
const connectDB = async () => {
  const start = Date.now();
  
  try {
    // Configuración estricta para queries Mongoose
    mongoose.set('strictQuery', true);
    
    // Establecer conexión con timeout de 30s por defecto
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    const ms = Date.now() - start;
    
    // Log de conexión exitosa con información segura
    console.log(
      `🟢 MongoDB connected in ${ms}ms | ${getDBState()} | uri=${redactUri(MONGO_URI)} | env=${process.env.NODE_ENV || 'development'}`
    );
    
    // Manejo de eventos de conexión en runtime
    mongoose.connection.on('error', (err) => {
      console.error('🔴 MongoDB runtime error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('🟠 MongoDB disconnected');
    });
    
  } catch (error: any) {
    // Log de error con URI enmascarada y terminación del proceso
    console.error(
      '🔴 MongoDB connection error:',
      error?.message || error,
      `| uri=${redactUri(MONGO_URI)}`
    );
    process.exit(1);
  }
};

export default connectDB;
export { mongoose };
