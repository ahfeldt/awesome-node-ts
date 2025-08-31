import { buildApp } from './app'
import { config } from './config'

const app = buildApp()
const port = config.port

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
