import Fastify from 'fastify'
import dotenv from 'dotenv'
import todosRoutes from './routes/todos'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { config, isProd, isTest } from './config'

dotenv.config()

export function buildApp() {
  // 👇 ändrat: i test/CI använder vi enkel logger (utan pino-pretty transport)
  const app = Fastify({
    logger: isProd
      ? true
      : isTest
      ? { level: 'warn' }
      : {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss.l' },
          },
          level: 'info',
        },
  })

  // Säkerhet + CORS
  app.register(helmet)
  app.register(cors, {
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
  app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
  })

  // OpenAPI/Swagger + Bearer auth-spec
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Awesome Node TS API',
        description: 'Todos API with Fastify + Prisma',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${config.port}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })
  app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })

  // Bas
  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/', async () => ({ hello: 'world' }))

  // Våra routes
  app.register(todosRoutes, { prefix: '/todos' })

  return app
}
