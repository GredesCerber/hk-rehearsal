# Web

Node.js 22+, React, TypeScript, Vite.

    npm ci
    npm run dev

Открыть адрес, который напечатает Vite (обычно http://localhost:5173).
Предварительно запустить API по инструкции в ../api/README.md.
Запросы /api/* проксируются в http://127.0.0.1:3001.
На странице отображается состояние /api/health; ошибка подключения видна пользователю.

    npm test        # production build + unit tests
    npm run lint
    npm run build

Задача #15 реализует список в src/features/items/: точка подключения уже добавлена в App.
Полная проверка обоих пакетов и приёмочные HTTP-тесты выполняются командой hk check из корня.
