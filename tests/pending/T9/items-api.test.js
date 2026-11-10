// Приёмка T9 (задача #12): API списка покупок в памяти сервера.
// Пишет агент-тестировщик (#12). CI пока не запускает tests/pending/.
// Адрес API: переменная API_URL (по умолчанию http://127.0.0.1:3000).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.API_URL ?? 'http://127.0.0.1:3000';
const req = (method, path, body) =>
  fetch(BASE + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

// Каждый тест начинает с пустого списка: API должен уметь сбрасываться или тесты создают свои данные.
const json = async (res) => res.json();

test('Given пустой список When GET /api/items Then 200 и пустой массив', async () => {
  const res = await req('GET', '/api/items');
  assert.equal(res.status, 200);
  const body = await json(res);
  assert.ok(Array.isArray(body) || Array.isArray(body.items), 'ответ — массив или { items: [] }');
  assert.equal((Array.isArray(body) ? body : body.items).length, 0);
});

test('Given название Молоко When POST /api/items Then 201 и товар с id и bought false', async () => {
  const res = await req('POST', '/api/items', { name: 'Молоко' });
  assert.equal(res.status, 201);
  const item = await json(res);
  assert.ok(item.id !== undefined && item.id !== null, 'есть id');
  assert.equal(item.name, 'Молоко');
  assert.equal(item.bought, false);
});

test('Given пустое название When POST /api/items Then 400 с кодом empty_name', async () => {
  const res = await req('POST', '/api/items', { name: '' });
  assert.equal(res.status, 400);
  const body = await json(res);
  assert.equal(body.error ?? body.code, 'empty_name');
});

test('Given товар существует When PATCH /api/items/:id с bought true Then 200 и товар отмечен купленным', async () => {
  const created = await json(await req('POST', '/api/items', { name: 'Хлеб' }));
  const res = await req('PATCH', `/api/items/${created.id}`, { bought: true });
  assert.equal(res.status, 200);
  const item = await json(res);
  assert.equal(item.bought, true);
});

test('Given товар существует When DELETE /api/items/:id Then 204 и товар пропадает из GET', async () => {
  const created = await json(await req('POST', '/api/items', { name: 'Сыр' }));
  const res = await req('DELETE', `/api/items/${created.id}`);
  assert.equal(res.status, 204);
  const list = await json(await req('GET', '/api/items'));
  const items = Array.isArray(list) ? list : list.items;
  assert.ok(!items.some((i) => i.id === created.id), 'товар не должен быть в списке');
});

test('Given несуществующий id When PATCH /api/items/:id Then 404', async () => {
  const res = await req('PATCH', '/api/items/does-not-exist', { bought: true });
  assert.equal(res.status, 404);
});

test('Given несуществующий id When DELETE /api/items/:id Then 404', async () => {
  const res = await req('DELETE', '/api/items/does-not-exist');
  assert.equal(res.status, 404);
});
