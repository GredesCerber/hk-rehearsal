import Fastify from 'fastify'
import { itemsRoutes } from './items/index.js'

export function createApp() {
  const app = Fastify()

  app.get('/api/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: { status: { type: 'string', enum: ['ok'] } },
          required: ['status'],
          additionalProperties: false,
        },
      },
    },
  }, async () => ({ status: 'ok' }))

  app.register(itemsRoutes, { prefix: '/api' })
  return app
}
