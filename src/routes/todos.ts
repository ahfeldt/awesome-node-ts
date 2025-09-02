import type {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
} from 'fastify';

// ⬇️ CommonJS-paket i ESM: default-import + destructure
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

type IdParams = { id: string };

type CreateTodoBody = {
  title: string;
};

type UpdateTodoBody = {
  title?: string;
  completed?: boolean;
};

const todosRoutes: FastifyPluginAsync = async (app) => {
  // GET /todos -> lista alla
  app.get(
    '/',
    async (_req: FastifyRequest, _reply: FastifyReply) => {
      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return todos;
    }
  );

  // POST /todos -> skapa
  app.post(
    '/',
    async (
      req: FastifyRequest<{ Body: CreateTodoBody }>,
      reply: FastifyReply
    ) => {
      const { title } = req.body ?? {};
      if (!title || typeof title !== 'string') {
        return reply.status(400).send({
          message: 'Invalid body: "title" is required',
        });
      }

      const todo = await prisma.todo.create({
        data: { title, completed: false },
      });

      return reply.code(201).send(todo);
    }
  );

  // GET /todos/:id -> hämta en
  app.get(
    '/:id',
    async (
      req: FastifyRequest<{ Params: IdParams }>,
      reply: FastifyReply
    ) => {
      const todo = await prisma.todo.findUnique({
        where: { id: req.params.id },
      });
      if (!todo) {
        return reply.status(404).send({
          message: 'Not Found',
          error: 'Not Found',
          statusCode: 404,
        });
      }
      return todo;
    }
  );

  // PATCH /todos/:id -> uppdatera
  app.patch(
    '/:id',
    async (
      req: FastifyRequest<{ Params: IdParams; Body: UpdateTodoBody }>,
      reply: FastifyReply
    ) => {
      const { id } = req.params;
      const data: UpdateTodoBody = {};
      if (typeof req.body?.title === 'string') data.title = req.body.title;
      if (typeof req.body?.completed === 'boolean')
        data.completed = req.body.completed;

      try {
        const updated = await prisma.todo.update({
          where: { id },
          data,
        });
        return updated;
      } catch {
        return reply.status(404).send({
          message: 'Not Found',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    }
  );

  // DELETE /todos/:id -> ta bort
  app.delete(
    '/:id',
    async (
      req: FastifyRequest<{ Params: IdParams }>,
      reply: FastifyReply
    ) => {
      const { id } = req.params;
      try {
        await prisma.todo.delete({ where: { id } });
        return reply.status(204).send();
      } catch {
        return reply.status(404).send({
          message: 'Not Found',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    }
  );
};

export default todosRoutes;
