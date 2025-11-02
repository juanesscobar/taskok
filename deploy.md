# Guía de Despliegue en Render.com

Esta guía proporciona instrucciones detalladas para desplegar el proyecto TaskOK en Render.com. El proyecto es una aplicación Node.js con TypeScript que utiliza Express para el backend y archivos estáticos para el frontend.

## Prerrequisitos


1. **Cuenta en Render.com**
2. **Repositorio en Git**
3. **Base de datos MongoDB**: Necesitas una instancia de MongoDB externa (recomendado MongoDB Atlas) ya que Render.com no proporciona MongoDB integrado.
4. **Conocimientos básicos**: Familiaridad con variables de entorno, Docker y servicios web.

## Pasos de Configuración en Render.com

### 1. Conectar el Repositorio

1. Inicia sesión en Render.com y haz clic en "New" > "Web Service".
2. Selecciona "Connect" y elige tu repositorio de Git donde está alojado el proyecto TaskOK.
3. Render detectará automáticamente el archivo `render.yaml` si existe.

### 2. Configurar el Servicio Web

1. **Nombre del servicio**: Asigna un nombre único, por ejemplo `taskok-api`.
2. **Entorno**: Selecciona "Docker" como runtime (el proyecto incluye un Dockerfile optimizado).
3. **Rama**: Selecciona la rama principal (generalmente `main` o `master`).
4. **Comando de build**: `docker build -t taskok .`
5. **Comando de start**: `npm start`

### 3. Configurar Recursos

1. **Plan**: Para desarrollo, el plan gratuito es suficiente. Para producción, considera un plan pago.
2. **Región**: Selecciona la región más cercana a tus usuarios.
3. **Health Check**: El proyecto incluye un endpoint `/api/health` que Render usará automáticamente.

## Variables de Entorno

Configura las siguientes variables de entorno en el dashboard de Render (Environment > Environment):

### Variables Obligatorias

- `NODE_ENV`: `production`
- `PORT`: Render lo genera automáticamente (no modifiques)
- `MONGO_URI`: URI completa de tu base de datos MongoDB (ver sección de configuración de base de datos)
- `JWT_SECRET`: Clave secreta para JWT (genera una cadena aleatoria segura)
- `CORS_ORIGIN`: URL de tu aplicación en Render (Render lo configura automáticamente)

### Variables Opcionales

- `MONGODB_USER`: Usuario de MongoDB (si no está incluido en MONGO_URI)
- `MONGODB_PASSWORD`: Contraseña de MongoDB (si no está incluida en MONGO_URI)
- `MONGODB_HOST`: Host de MongoDB (si no está incluido en MONGO_URI)
- `MONGODB_DATABASE`: Nombre de la base de datos (por defecto: `taskok`)

**Importante**: Nunca incluyas credenciales sensibles directamente en el código. Usa siempre variables de entorno.

## Configuración de Base de Datos

### Opción Recomendada: MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Crea un cluster gratuito.
3. Configura un usuario de base de datos con permisos de lectura/escritura.
4. Obtén la connection string (URI) desde Atlas.
5. Configura la variable `MONGO_URI` en Render con esta URI.

**Nota de seguridad**: Asegúrate de que tu cluster de Atlas tenga habilitada la autenticación y esté configurado para aceptar conexiones desde cualquier IP (o específicamente desde Render.com).

### Inconsistencia Detectada: MongoDB vs SQLite

**Advertencia importante**: El código del proyecto está configurado para usar MongoDB con Mongoose (`src/config/db.ts`), pero el archivo `prisma/schema.prisma` está configurado para SQLite. Esta inconsistencia puede causar problemas.

- **Para despliegue en Render**: Se recomienda usar MongoDB como está implementado en el código.
- **Recomendación**: Mantén MongoDB para evitar refactorización.
- **Nota adicional**: El archivo `src/config/prisma.ts` está vacío y no se utiliza en el código actual. Los modelos están definidos usando Mongoose en `src/models/` (User.ts, Task.ts, Check.ts).

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a MongoDB**:
   - Verifica que la URI de MongoDB sea correcta y accesible.
   - Asegúrate de que las credenciales sean válidas.
   - Comprueba que el cluster de Atlas permita conexiones desde Render.com.

2. **Aplicación no inicia**:
   - Revisa los logs en Render dashboard.
   - Verifica que todas las variables de entorno estén configuradas.
   - Asegúrate de que el puerto esté configurado correctamente (Render lo maneja automáticamente).

3. **Errores de build**:
   - Confirma que el Dockerfile esté en la raíz del proyecto.
   - Verifica que todas las dependencias estén listadas en `package.json`.
   - Comprueba que TypeScript compile sin errores.

4. **Problemas de CORS**:
   - Asegúrate de que `CORS_ORIGIN` esté configurado correctamente.
   - Si tienes un frontend separado, configura CORS apropiadamente.

### Logs y Debugging

- Accede a los logs en tiempo real desde el dashboard de Render.
- Usa el health check endpoint (`/api/health`) para verificar el estado de la aplicación.
- Para debugging local, usa `docker-compose up` para replicar el entorno.

### Rendimiento

- El Dockerfile está optimizado para producción con multi-stage build.
- Considera usar Redis para sesiones si la aplicación crece.
- Monitorea el uso de recursos en Render dashboard.

## Verificación del Despliegue

Una vez desplegado:

1. Visita la URL proporcionada por Render.
2. Verifica que la aplicación cargue correctamente.
3. Prueba las funcionalidades principales (login, registro, tareas).
4. Confirma que la conexión a la base de datos funcione.

## Actualizaciones

Para actualizar la aplicación:

1. Haz push de los cambios a tu repositorio Git.
2. Render detectará el cambio y redeployará automáticamente.
3. Monitorea los logs durante el redeploy.

## Seguridad

- Nunca commits credenciales sensibles al repositorio.
- Usa HTTPS (Render lo proporciona automáticamente).
- Mantén las dependencias actualizadas.
- Configura rate limiting si es necesario.
- Revisa regularmente los logs por actividades sospechosas.

Si encuentras problemas no cubiertos aquí, consulta la documentación de Render.com o los logs detallados de la aplicación.