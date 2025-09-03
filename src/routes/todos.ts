import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function todoRoutes(fastify: FastifyInstance) {
  // GET all todos
  fastify.get("/", {
    schema: {
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

  // GET one todo by id
  fastify.get<{ Params: { id: string } }>("/:id", {
    schema: {
      params: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
      },
      response: {
        200: { $ref: "Todo#" },
      },
    },
  }, async (req) => {
    return prisma.todo.findUnique({ where: { id: req.params.id } });
  });

  // POST create new todo
  fastify.post<{ Body: { title: string } }>("/", {
    schema: {
      body: {
        type: "object",
        properties: { title: { type: "string" } },
        required: ["title"],
      },
      response: {
        200: { $ref: "Todo#" },
      },
    },
  }, async (req) => {
    return prisma.todo.create({
      data: { title: req.body.title },
    });
  });

  // PATCH update todo
  fastify.patch<{ Params: { id: string }, Body: { title?: string; completed?: boolean } }>("/:id", {
    schema: {
      params: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
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
    return prisma.todo.update({
      where: { id: req.params.id },
      data: req.body,
    });
  });

  // DELETE todo
  fastify.delete<{ Params: { id: string } }>("/:id", {
    schema: {
      params: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
      },
      response: {
        200: { $ref: "Todo#" },
      },
    },
  }, async (req) => {
    return prisma.todo.delete({ where: { id: req.params.id } });
  });
}
