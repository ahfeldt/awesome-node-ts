import Fastify from 'fastify';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import todosRoutes from './routes/todos.js';

dotenv.config();

export function buildApp() {
  const app = Fastify({ logger: true });

  // Health + root
  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/', async () => ({ hello: 'world' }));

  // --- Swagger / OpenAPI ---
  // Minimal OpenAPI-metadata. Uppdatera titel/beskrivning när du vill.
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Awesome Node TS API',
        version: '1.0.0',
        description: 'Todos API with Fastify + Prisma',
      },
    },
  });

  // Swagger UI på /docs (JSON blir /docs/json)
  app.register(swaggerUI, {
    routePrefix: '/docs',
  });

  // Todos-routes
  app.register(todosRoutes, { prefix: '/todos' });

  return app;
}
