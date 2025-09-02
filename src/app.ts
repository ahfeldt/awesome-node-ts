import Fastify from 'fastify';
import dotenv from 'dotenv';
import todosRoutes from './routes/todos.js';

dotenv.config();

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/', async () => ({ hello: 'world' }));

  app.register(todosRoutes, { prefix: '/todos' });

  return app;
}
