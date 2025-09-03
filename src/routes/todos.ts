import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function todoRoutes(fastify: FastifyInstance) {
  // GET all todos
  fastify.get("/", {
    schema: {
      tags: ["Todos"],
      response: {
        200: {
          type: "array",
          items: { $ref: "Todo#" },
        },
      },
    },
  }, async () => {
    return prisma.todo.findMany();
  });

  // GET todo by id
  fastify.get("/:id", {
    schema: {
      tags: ["Todos"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
        },
        required: ["id"],
      },
      response: {
        200: { $ref: "Todo#" },
        404: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      reply.code(404).send({ message: "Todo not found" });
      return;
    }
    return todo;
  });

  // POST create todo
  fastify.post("/", {
    schema: {
      tags: ["Todos"],
      body: {
        type: "object",
        properties: {
          title: { type: "string" },
        },
        required: ["title"],
      },
      response: {
        200: { $ref: "Todo#" },
      },
    },
  }, async (req) => {
    const { title } = req.body as { title: string };
    return prisma.todo.create({ data: { title } });
  });

  // PATCH update todo
  fastify.patch("/:id", {
    schema: {
      tags: ["Todos"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
        },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          title: { type: "string" },
          completed: { type: "boolean" },
        },
      },
      response: {
        200: { $ref: "Todo#" },
      },
    },
  }, async (req) => {
    const { id } = req.params as { id: string };
    const { title, completed } = req.body as { title?: string, completed?: boolean };
    return prisma.todo.update({
      where: { id },
      data: { title, completed },
    });
  });

  // DELETE todo
  fastify.delete("/:id", {
    schema: {
      tags: ["Todos"],
      params: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
        },
        required: ["id"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.todo.delete({ where: { id } });
    return { message: "Todo deleted" };
  });
}
