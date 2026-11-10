<!-- hk:prd status: approved by: GredesCerber at: 2026-11-09T13:29:34Z -->
# PRD: Список покупок

> Пишет planner по `docs/tz.md` и `docs/tz-analysis.md` (навык `hk-kickoff`), не больше страницы текста + блоки задач.
> Формат блоков — `agents/skills/hk-kickoff/task-format.md`. Проверка: `hk task lint`. План: `hk kickoff`.
> Шапка в первой строке — одобрение. `hk kickoff --apply` создаёт issues только при
> `<!-- hk:prd status: approved by: <github-login> at: <ISO-время> -->`
> (нет ответа product lead 20 минут — planner ставит `by: auto-timeout`).

## Проблема и для кого

Семье нужен общий список покупок в браузере, без регистрации и настроек. Список хранится на сервере в памяти, поэтому не теряется при перезагрузке страницы.

## Демо-путь

Шаги, которые жюри увидит на демо. Требования на этом пути — must, `risk: high`, делаются первыми.

1. Добавить «Молоко» и «Хлеб» — R1, R6
2. Нажать «Добавить» с пустым полем и увидеть «Введите название» — R2
3. Отметить «Молоко» купленным, счётчик стал 1 — R3, R5
4. Перезагрузить страницу: всё на месте — R6
5. Удалить «Хлеб» — R4, R5

## Сценарии

- Основной: добавить товары, отметить купленные, удалить ненужные, видеть счётчик оставшихся.
- Ошибочный: пустое название не добавляется, показывается подсказка.

## НЕ делаем

- Вход и регистрация.
- Несколько списков.
- База данных (только память сервера).
- Деплой.
- Красивый дизайн (только аккуратный).
- Редактирование названия товара.

## Критерии жюри → как закрываем

| Критерий | Чем закрываем |
|---|---|
| Демо работает | T7 каркас, T8 контракт, T9 API, T11 интерфейс; сценарий демо выше |
| Есть тесты на каждый эндпоинт API | T10 приёмочные тесты API (по каждому эндпоинту), T9 с unit-тестами |

## Стек

Из `hk.config.json → stack`: web-node (React + Node.js API). Генераторы каркаса — `hk.config.json → scaffold`.

## Эпики и задачи

```hk-epic
id: E2
title: Список покупок
scenario: Семья добавляет товары, отмечает купленные, видит счётчик и удаляет лишнее; список переживает перезагрузку страницы
demo: Пять шагов из раздела «Демо-путь»
```

Первый блок `hk-task` — всегда сквозной каркас. Остальные задачи неявно ждут его (`after` писать не нужно).

```hk-task
id: T7
title: Сквозной каркас web и api
epic: E2
area: infra
tier: high
risk: high
skeleton: true
paths: [web/**, api/**, infra/**, .github/**]
goal: Пустой React-интерфейс и пустой Node-сервер собираются и проходят hk check
acceptance:
  - Given чистый репозиторий When запускаю генераторы из hk.config.json → scaffold Then hk check зелёный
  - Given собранный api When GET /api/health Then ответ 200
tests: [e2e]
req: [R6]
```

```hk-task
id: T8
title: Контракт API списка покупок в contracts/api.yaml
epic: E2
area: contracts
tier: mid
risk: med
paths: [contracts/**]
goal: Web и api договорились о GET, POST, PATCH и DELETE для /api/items до реализации
acceptance:
  - Дано пустой contracts/api.yaml Когда описываю четыре эндпоинта /api/items Тогда контракт проходит валидацию OpenAPI
  - Given контракт When генерирую клиента Then у клиента есть методы для всех четырёх эндпоинтов
tests: [contract]
req: [R6]
```

```hk-task
id: T9
title: API списка покупок в памяти сервера
epic: E2
area: api
tier: mid
risk: high
after: [T8]
contract: contracts/api.yaml#/paths/~1api~1items
paths: [api/src/items/**]
goal: Сервер хранит список товаров в памяти и отдаёт его по контракту
acceptance:
  - Given пустой список When GET /api/items Then 200 и пустой массив
  - Given название Молоко When POST /api/items Then 201 и товар с id и полем bought равным false
  - Given пустое название When POST /api/items Then 400 с кодом empty_name
  - Given товар существует When PATCH /api/items/:id с bought true Then 200 и товар отмечен купленным
  - Given товар существует When DELETE /api/items/:id Then 204 и товар пропадает из GET
  - Given несуществующий id When PATCH или DELETE /api/items/:id Then 404
out_of_scope: [редактирование названия, база данных]
tests: [unit, contract, e2e]
req: [R6, R2, R3, R4]
```

```hk-task
id: T10
title: Приёмочные тесты API списка покупок
area: e2e
tier: mid
tests_for: T9
tests: [e2e]
```

```hk-task
id: T11
title: Интерфейс списка покупок в web
epic: E2
area: web
tier: mid
risk: high
after: [T8, T9]
contract: contracts/api.yaml#/paths/~1api~1items
paths: [web/src/features/items/**]
goal: Семья добавляет, отмечает, удаляет товары и видит счётчик оставшихся
acceptance:
  - Given открыта страница When ввожу Молоко и нажимаю Добавить Then Молоко появляется в списке
  - Given поле пустое When нажимаю Добавить Then под полем появляется надпись Введите название и товар не добавлен
  - Given в списке Молоко и Хлеб оба не куплены When кликаю по Молоко Then Молоко зачёркнут и счётчик показывает 1 осталось
  - Given товар зачёркнут When кликаю по нему повторно Then отметка снимается
  - Given товар в списке When нажимаю Удалить Then товар исчезает и счётчик обновляется
  - Given страница с товарами When перезагружаю страницу Then все товары и отметки на месте
out_of_scope: [вход, несколько списков, красивый дизайн]
tests: [unit, e2e]
req: [R1, R2, R3, R4, R5, R6]
```

```hk-task
id: T12
title: Приёмочные тесты интерфейса списка покупок
area: e2e
tier: mid
tests_for: T11
tests: [e2e]
```
