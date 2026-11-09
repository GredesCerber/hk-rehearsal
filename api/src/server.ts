import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 3001)
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535')
}

const app = createApp()
const address = await app.listen({ port, host: process.env.HOST ?? '127.0.0.1' })
console.log(JSON.stringify({ address }))

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
  })
}
