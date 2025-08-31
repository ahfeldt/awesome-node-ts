import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../src/app'
import { prisma } from '../src/db'

let app: ReturnType<typeof buildApp>

beforeAll(async () => {
  app = buildApp()
  await app.ready()
  await prisma.todo.deleteMany({})   // rensa före test
})

afterAll(async () => {
  await prisma.$disconnect()
  await app.close()
})

describe('Todos API', () => {
  it('creates, lists, gets, updates and deletes a todo', async () => {
    // CREATE
    const create = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { title: 'Test todo' }
    })
    expect(create.statusCode).toBe(201)
    const created = create.json() as { id: string }

    // LIST
    const list = await app.inject({ method: 'GET', url: '/todos' })
    expect(list.statusCode).toBe(200)
    const items = list.json() as any[]
    expect(items.length).toBeGreaterThan(0)

    // GET ONE
    const one = await app.inject({ method: 'GET', url: `/todos/${created.id}` })
    expect(one.statusCode).toBe(200)
    expect((one.json() as any).id).toBe(created.id)

    // UPDATE
    const patch = await app.inject({
      method: 'PATCH',
      url: `/todos/${created.id}`,
      payload: { completed: true, title: 'Updated title' }
    })
    expect(patch.statusCode).toBe(200)
    const updated = patch.json() as any
    expect(updated.completed).toBe(true)
    expect(updated.title).toBe('Updated title')

    // DELETE
    const del = await app.inject({ method: 'DELETE', url: `/todos/${created.id}` })
    expect(del.statusCode).toBe(204)

    // GET after delete -> 404
    const gone = await app.inject({ method: 'GET', url: `/todos/${created.id}` })
    expect(gone.statusCode).toBe(404)
  })
})
