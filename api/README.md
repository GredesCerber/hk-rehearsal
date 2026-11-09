# API

Node.js 22+, Fastify, TypeScript.

```sh
npm ci
npm run dev
```

По умолчанию сервер слушает `http://127.0.0.1:3001`.
`GET /api/health` отвечает `200` и `{"status":"ok"}`.
`HOST` и `PORT` задаются через окружение; `PORT=0` выбирает свободный порт.
После старта в stdout выводится JSON с фактическим `address`.

```sh
npm test       # production build + unit tests
npm run build
npm start      # runs dist/server.js
```

Маршруты товаров добавляются в `src/items/` задачей #13.
Плагин уже подключён в приложении с префиксом `/api`.
