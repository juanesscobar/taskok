# TaskOK - Sistema de Gestión de Tareas y Control de Asistencia

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Sistema completo de gestión de tareas y control de asistencia para equipos de trabajo, desarrollado con tecnologías modernas y arquitectura escalable.

## 📋 Tabla de Contenidos

- [🚀 Descripción](#-descripción)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🚀 Uso](#-uso)
- [📚 API Documentation](#-api-documentation)
- [🐳 Despliegue con Docker](#-despliegue-con-docker)
- [🧪 Testing](#-testing)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [📞 Contacto](#-contacto)

## 🚀 Descripción

TaskOK es una aplicación web completa para la gestión de tareas y control de asistencia de empleados. Combina funcionalidades de un sistema de gestión de tareas (task management) con un reloj de asistencia digital, permitiendo a los equipos organizar su trabajo de manera eficiente mientras mantienen un registro preciso de las horas trabajadas.

### Funcionalidades Principales

- **👥 Gestión de Usuarios**: Registro, autenticación y roles (empleado/admin)
- **📝 Gestión de Tareas**: Crear, editar, eliminar y filtrar tareas por estado
- **⏰ Control de Asistencia**: Check-in/check-out automático con cálculo de horas trabajadas
- **🔐 Autenticación JWT**: Seguridad avanzada con tokens JWT y cookies HTTPOnly
- **📱 Frontend Responsive**: Interfaz moderna con TailwindCSS
- **🐳 Contenedorización**: Despliegue simplificado con Docker
- **🧪 Testing Completo**: Cobertura de pruebas unitarias e integración

## 🏗️ Arquitectura

El proyecto sigue una arquitectura **MVC (Model-View-Controller)** con separación clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API REST      │    │   Database      │
│   (HTML/CSS/JS) │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Controllers   │    │ - Users         │
│ - Task Manager  │    │ - Routes        │    │ - Tasks         │
│ - Check System  │    │ - Middleware    │    │ - Checks        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Estructura del Proyecto

```
taskok/
├── src/
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Lógica de negocio
│   ├── middlewares/     # Middlewares de autenticación
│   ├── models/          # Modelos de datos (Mongoose)
│   ├── routes/          # Definición de rutas API
│   ├── utils/           # Utilidades auxiliares
│   └── test/            # Pruebas unitarias
├── public/              # Archivos estáticos del frontend
│   ├── css/
│   ├── js/
│   └── *.html
├── prisma/              # Configuración de Prisma (opcional)
├── docker-compose.yml   # Configuración Docker
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración TypeScript
└── README.md
```

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcrypt** - Hashing de contraseñas

### Frontend
- **HTML5** - Estructura
- **TailwindCSS** - Framework CSS
- **Vanilla JavaScript** - Interactividad

### DevOps & Testing
- **Docker** - Contenedorización
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs
- **MongoDB Memory Server** - Base de datos de pruebas

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- MongoDB 6+ (o Docker para contenedorización)
- npm o yarn

### Instalación Paso a Paso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/taskok.git
   cd taskok
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar base de datos**
   ```bash
   # Opción A: Usando Docker
   npm run db:up

   # Opción B: MongoDB local
   # Asegurarse de que MongoDB esté ejecutándose en localhost:27017
   ```

5. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## ⚙️ Configuración

### Variables de Entorno (.env)

Crear un archivo `.env` en la raíz del proyecto:

```env
# Entorno de ejecución
NODE_ENV=development

# Puerto del servidor
PORT=3000

# URL de conexión a MongoDB
MONGO_URI=mongodb://localhost:27017/taskok

# Clave secreta para JWT (cambiar en producción)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Configuración adicional (opcional)
CORS_ORIGINS=http://localhost:3000,http://localhost:5500
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor con hot-reload
npm run build        # Compila TypeScript a JavaScript
npm start            # Inicia servidor en producción

# Base de datos
npm run db:up        # Inicia contenedor MongoDB
npm run db:down      # Detiene contenedor MongoDB
npm run db:logs      # Muestra logs de MongoDB

# Testing
npm test             # Ejecuta todas las pruebas
npm run test:watch   # Ejecuta pruebas en modo watch
```

## 🚀 Uso

### Acceso a la Aplicación

1. Abrir http://localhost:3000 en el navegador
2. Registrarse como nuevo usuario o iniciar sesión
3. Acceder al dashboard para gestionar tareas
4. Usar el sistema de check-in/check-out para registrar asistencia

### Gestión de Tareas

- **Crear tarea**: Desde el dashboard, hacer clic en "Nueva Tarea"
- **Editar tarea**: Hacer clic en el botón de edición de cualquier tarea
- **Cambiar estado**: Usar los controles de estado (Pendiente → En Progreso → Completada)
- **Filtrar tareas**: Usar los filtros por estado en la barra lateral

### Control de Asistencia

- **Check-in**: Hacer clic en "Marcar Entrada" al inicio del día
- **Check-out**: Hacer clic en "Marcar Salida" al finalizar el día
- **Ver horas**: Consultar el historial en la sección de asistencia

## 📚 API Documentation

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "ok": true,
  "user": {
    "id": "64f...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "employee"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Autentica un usuario existente.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

### Gestión de Tareas

#### GET /api/tasks
Obtiene todas las tareas del usuario autenticado.

**Query Parameters:**
- `status` (opcional): Filtrar por estado (`pending`, `in_progress`, `completed`)

**Ejemplo:**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/tasks?status=pending
```

#### POST /api/tasks
Crea una nueva tarea.

**Request Body:**
```json
{
  "title": "Implementar autenticación",
  "description": "Implementar sistema de login con JWT",
  "status": "in_progress",
  "link": "https://github.com/user/repo/issues/123"
}
```

#### GET /api/tasks/:id
Obtiene una tarea específica por ID.

#### PUT /api/tasks/:id
Actualiza una tarea completa.

#### PATCH /api/tasks/:id
Actualiza parcialmente una tarea.

#### DELETE /api/tasks/:id
Elimina una tarea.

#### PATCH /api/tasks/:id/status
Actualiza solo el estado de una tarea.

**Request Body:**
```json
{
  "status": "completed"
}
```

### Control de Asistencia

#### POST /api/check/in
Registra la entrada (check-in) del empleado.

#### POST /api/check/out
Registra la salida (check-out) y calcula horas trabajadas.

### Ejemplos de Uso con cURL

```bash
# Registro de usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"123456"}'

# Crear tarea (requiere token)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"title":"Nueva tarea","description":"Descripción","status":"pending"}'

# Check-in
curl -X POST http://localhost:3000/api/check/in \
  -H "Authorization: Bearer <token>"
```

### Ejemplos con JavaScript (Frontend)

```javascript
// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

// Obtener tareas
async function getTasks(status = null) {
  const token = localStorage.getItem('token');
  const url = status ? `/api/tasks?status=${status}` : '/api/tasks';

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}

// Crear tarea
async function createTask(taskData) {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  return await response.json();
}

// Check-in
async function checkIn() {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/check/in', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}
```

## 🐳 Despliegue con Docker

### Despliegue Local con Docker Compose

1. **Asegurar que Docker esté instalado y ejecutándose**

2. **Construir e iniciar servicios:**
   ```bash
   docker-compose up --build
   ```

3. **Acceder a la aplicación:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - MongoDB: localhost:27017

### Despliegue en Producción

Para despliegue en producción, configurar las siguientes variables de entorno:

```env
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/taskok
JWT_SECRET=tu_clave_produccion_muy_segura
```

### Servicios en Docker Compose

- **app**: Aplicación Node.js/TypeScript
- **mongo**: Base de datos MongoDB con persistencia

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con watch mode
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

### Estructura de Pruebas

```
src/test/
├── auth.test.ts      # Pruebas de autenticación
├── task.test.ts      # Pruebas de gestión de tareas
└── check.test.ts     # Pruebas de control de asistencia
```

### Configuración de Jest

- **Framework**: Jest con ts-jest
- **Base de datos**: MongoDB Memory Server para aislamiento
- **Cobertura**: Configurada para generar reportes HTML

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

### Guías de Desarrollo

- Seguir convenciones de código PEP8 para Python (aunque el proyecto esté en TypeScript)
- Mantener cobertura de pruebas > 80%
- Documentar nuevas funcionalidades en este README
- Usar commits descriptivos en inglés

### Configuración de Desarrollo

```bash
# Instalar dependencias de desarrollo
npm install

# Configurar pre-commit hooks (opcional)
npm run prepare

# Ejecutar linter (si configurado)
npm run lint
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

**Juan Andrés Escobar Vega**

- **Email**: juan.escobar@example.com
- **GitHub**: [@juanescobar](https://github.com/juanescobar)
- **LinkedIn**: [Juan Escobar](https://linkedin.com/in/juanescobar)

---

⭐ **Si este proyecto te resulta útil, ¡dale una estrella en GitHub!**

Desarrollado con ❤️ usando TypeScript, Express y MongoDB.