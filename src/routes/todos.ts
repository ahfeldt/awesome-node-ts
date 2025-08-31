import { FastifyInstance } from 'fastify'
import { prisma } from '../db'

const TodoSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    completed: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'title', 'completed', 'createdAt', 'updatedAt'],
} as const

const ErrorSchema = {
  type: 'object',
  properties: { error: { type: 'string' } },
  required: ['error'],
} as const

function validateTitle(input: unknown): string {
  if (typeof input !== 'string') throw new Error('title must be a string')
  const t = input.trim()
  if (!t) throw new Error('title is required')
  if (t.length > 200) throw new Error('title too long (max 200)')
  return t
}

export default async function todosRoutes(app: FastifyInstance) {
  // LIST
  app.get(
    '/',
    {
      schema: {
        tags: ['todos'],
        response: { 200: { type: 'array', items: TodoSchema } },
      },
    },
    async () => prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })
  )

  // GET ONE
  app.get(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        response: { 200: TodoSchema, 404: ErrorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const todo = await prisma.todo.findUnique({ where: { id } })
      if (!todo) return reply.code(404).send({ error: 'Not found' })
      return todo
    }
  )

  // CREATE
  app.post(
    '/',
    {
      schema: {
        tags: ['todos'],
        body: {
          type: 'object',
          properties: { title: { type: 'string', maxLength: 200 } },
          required: ['title'],
        },
        response: { 201: TodoSchema, 400: ErrorSchema },
      },
    },
    async (req, reply) => {
      try {
        const body = (req.body ?? {}) as Record<string, unknown>
        const title = validateTitle(body.title)
        const todo = await prisma.todo.create({ data: { title } })
        reply.header('Location', `/todos/${todo.id}`)
        return reply.code(201).send(todo)
      } catch (err: any) {
        return reply.code(400).send({ error: err.message ?? 'Bad Request' })
      }
    }
  )

  // PATCH
  app.patch(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 200 },
            completed: { type: 'boolean' },
          },
          additionalProperties: false,
        },
        response: { 200: TodoSchema, 400: ErrorSchema, 404: ErrorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const body = (req.body ?? {}) as Record<string, unknown>
      try {
        const data: Record<string, any> = {}
        if ('title' in body) data.title = validateTitle(body.title)
        if ('completed' in body) {
          if (typeof body.completed !== 'boolean') throw new Error('completed must be boolean')
          data.completed = body.completed
        }
        const updated = await prisma.todo.update({ where: { id }, data })
        return updated
      } catch (err: any) {
        if (err?.code === 'P2025') return reply.code(404).send({ error: 'Not found' })
        return reply.code(400).send({ error: err.message ?? 'Bad Request' })
      }
    }
  )

  // DELETE
  app.delete(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        response: { 204: { type: 'null' }, 404: ErrorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      try {
        await prisma.todo.delete({ where: { id } })
        return reply.code(204).send()
      } catch {
        return reply.code(404).send({ error: 'Not found' })
      }
    }
  )
}
