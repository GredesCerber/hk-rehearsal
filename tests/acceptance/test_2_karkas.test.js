// Приёмка T1 (#2): каркас web + api + /health.
// Given/When/Then:
// - Дано проект склонирован, Когда запускаю api, Тогда GET /health возвращает status ok
// - Дано страница открыта, Когда загружается, Тогда видна надпись "Список дел"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from '../../api/server.js';

test('GET /health возвращает status ok', async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, 'ok');
  } finally {
    server.close();
  }
});

test('страница содержит надпись «Список дел»', () => {
  assert.match(readFileSync('web/index.html', 'utf8'), /Список дел/);
});
