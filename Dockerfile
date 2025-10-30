# Multi-stage Dockerfile para TaskOK - Optimizado para Render.com

# Etapa 1: Build stage - Compilación de TypeScript y dependencias
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Production stage - Imagen final optimizada
FROM node:18-alpine AS production

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskok -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados desde builder stage
COPY --from=builder --chown=taskok:nodejs /app/dist ./dist

# Copiar archivos estáticos del frontend desde el contexto de build
COPY --chown=taskok:nodejs ./public ./public

# Cambiar a usuario no-root
USER taskok

# Exponer puerto dinámico para Render.com
EXPOSE 10000

# Health check para Render.com
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-10000}/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio con dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]