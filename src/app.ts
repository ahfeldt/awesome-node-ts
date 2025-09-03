import Fastify from 'fastify';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import todosRoutes from './routes/todos.js';

dotenv.config();

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/', async () => ({ hello: 'world' }));

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Awesome Node TS API',
        version: '1.0.0',
        description: 'Todos API with Fastify + Prisma',
      },
    },
  });

  app.register(swaggerUI, {
    routePrefix: '/docs',
  });

  app.register(todosRoutes, { prefix: '/todos' });

  return app;
}
