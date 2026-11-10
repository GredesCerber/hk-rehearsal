import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../../', import.meta.url))

test('React frontend produces a production HTML page and JavaScript bundle', () => {
  const htmlPath = join(root, 'web/dist/index.html')
  assert.ok(existsSync(htmlPath), 'Run the web production build first')
  const html = readFileSync(htmlPath, 'utf8')
  assert.match(html, /<div id="root"><\/div>/)
  const entry = /<script[^>]+src="([^"]+\.js)"/.exec(html)?.[1]
  assert.ok(entry, 'The production page must load a JavaScript entry point')
  assert.ok(existsSync(join(root, 'web/dist', entry.replace(/^\//, ''))))
})

test('Built API serves GET /api/health over HTTP', { timeout: 15000 }, async (t) => {
  const entry = join(root, 'api/dist/server.js')
  assert.ok(existsSync(entry), 'Run the API production build first')
  const child = spawn(process.execPath, [entry], {
    cwd: join(root, 'api'),
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  t.after(() => child.kill())
  const address = await new Promise((resolve, reject) => {
    let output = ''
    let errors = ''
    const timer = setTimeout(() => reject(new Error(`API did not start: ${errors}`)), 10000)
    child.stderr.on('data', (data) => { errors += data.toString() })
    child.once('error', (error) => { clearTimeout(timer); reject(error) })
    child.once('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`API exited before readiness (${code}): ${errors}`))
    })
    child.stdout.on('data', (data) => {
      output += data.toString()
      const lines = output.split(/\r?\n/)
      output = lines.pop()
      for (const line of lines) {
        try {
          const ready = JSON.parse(line)
          if (typeof ready.address === 'string') {
            clearTimeout(timer)
            resolve(ready.address)
          }
        } catch { /* Other log lines are not readiness notifications. */ }
      }
    })
  })
  const response = await fetch(`${address}/api/health`, { signal: AbortSignal.timeout(5000) })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /application\/json/)
  assert.deepEqual(await response.json(), { status: 'ok' })
})
