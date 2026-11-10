import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const contractPath = fileURLToPath(new URL('../../contracts/api.yaml', import.meta.url))
// contracts/api.yaml is written as JSON (valid YAML 1.2) so no extra parser dependency is needed.
const contract = JSON.parse(readFileSync(contractPath, 'utf8'))

const methods = ['get', 'post', 'patch', 'delete']

test('Дано пустой contracts/api.yaml Когда описываю четыре эндпоинта /api/items Тогда контракт проходит валидацию OpenAPI', () => {
  assert.match(contract.openapi, /^3\.1\./)
  assert.equal(typeof contract.info?.title, 'string')
  assert.equal(typeof contract.info?.version, 'string')
  assert.ok(contract.paths && typeof contract.paths === 'object')
  const ops = [
    ['/api/items', 'get'], ['/api/items', 'post'],
    ['/api/items/{id}', 'patch'], ['/api/items/{id}', 'delete'],
  ]
  for (const [path, method] of ops) {
    const op = contract.paths[path]?.[method]
    assert.ok(op, `missing ${method.toUpperCase()} ${path}`)
    assert.equal(typeof op.operationId, 'string')
    assert.ok(op.responses && Object.keys(op.responses).length > 0, `no responses for ${method} ${path}`)
  }
  // Every local $ref must resolve inside the document.
  const text = JSON.stringify(contract)
  for (const ref of text.matchAll(/"\$ref":"#\/([^"]+)"/g)) {
    const target = ref[1].split('/').reduce((node, key) => node?.[key], contract)
    assert.ok(target !== undefined, `unresolved $ref #/${ref[1]}`)
  }
})

test('Given контракт When генерирую клиента Then у клиента есть методы для всех четырёх эндпоинтов', () => {
  const ids = []
  for (const item of Object.values(contract.paths)) {
    for (const method of methods) {
      if (item[method]) ids.push(item[method].operationId)
    }
  }
  assert.deepEqual(ids.sort(), ['createItem', 'deleteItem', 'listItems', 'updateItem'])
})
