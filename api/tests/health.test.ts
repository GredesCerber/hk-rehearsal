import { afterEach, expect, test } from 'vitest'
import { createApp } from '../src/app.js'

const apps: ReturnType<typeof createApp>[] = []
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()))
})

test('GET /api/health reports readiness', async () => {
  const app = createApp()
  apps.push(app)
  const response = await app.inject({ method: 'GET', url: '/api/health' })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({ status: 'ok' })
})

test('unknown routes return 404', async () => {
  const app = createApp()
  apps.push(app)
  const response = await app.inject({ method: 'GET', url: '/not-a-route' })
  expect(response.statusCode).toBe(404)
})
