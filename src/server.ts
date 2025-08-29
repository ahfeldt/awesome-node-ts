import Fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({
  logger: true
})

app.get('/health', async () => ({ status: 'ok' }))
app.get('/', async () => ({ hello: 'world' }))

const port = Number(process.env.PORT || 3000)
const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' })
    app.log.info(`Server running at http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
