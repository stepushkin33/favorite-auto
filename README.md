# Деталь — подбор автозапчастей

React 18 + Redux Toolkit, JavaScript, Vite, npm. Адаптивный интерфейс поиска
производителей, оригинальных деталей, аналогов и складских предложений.

## Запуск с реальным API

Требуется Node.js 22.12+.

```bash
npm ci
cp .env.example .env
# Указать свой FAVORIT_API_KEY в .env.
npm run dev
```

Если `.env` уже настроен, не перезаписывайте его командой копирования.
Откройте адрес Vite. Сервер разработки обслуживает `/api/parts` и добавляет
ключ покупателя к запросам Favorit Parts. Сам ключ не попадает в браузер.
Для проверки можно использовать артикул `01089` из документации.

Деморежим включается явно и не делает запросов к поставщику:

```bash
npm run dev:demo
```

В live-режиме нет скрытого переключения на демоданные при ошибках.


## Серверный прокси и публикация

Секрет хранится в `FAVORIT_API_KEY` на сервере. Опционально `FAVORIT_API_URL`
задаёт HTTPS endpoint поставщика, `VITE_API_URL` — URL собственного gateway
(по умолчанию `/api/parts`). Клиентские параметры `key`, `url` и другие
неизвестные поля игнорируются. Прокси не следует редиректам, не возвращает
технические тексты поставщика и отдаёт API-ответы с `Cache-Control: no-store`.
Таймаут поставщика — 12 с, клиента — 15 с. Отмена клиентского запроса отменяет
обращение к поставщику.

Обычный Node.js запуск собранной версии:

```bash
npm run build
npm start
```

Сервер читает `.env`, слушает `127.0.0.1:3000` (порт настраивается через `PORT`),
обслуживает клиентскую сборку и тот же gateway. При внешнем развёртывании нужен
обычный reverse proxy. `npm run preview` предназначен только для просмотра
клиентской сборки, без серверного API; для реального поиска используйте `npm start`.

Для Sites сборка также создаёт самостоятельный `dist/server/index.js` с
`default.fetch(request, env)` и встроенными клиентскими ресурсами.
Это тонкий адаптер хостинга, React-приложение остаётся клиентским.
Существующий приватный Site переведён со статической раздачи на Worker;
его идентификатор и аудитория сохранены. `FAVORIT_API_KEY` настроен как secret
в окружении Sites. В `.openai/hosting.json` и исходниках секретов нет.

`.env` исключён из Git. Не помещайте ключ в `VITE_*`, query string браузера,
исходники или скриншоты. Сборка проверяет ESM entrypoint, HTML и API-маршрут
Worker до упаковки. Скрипт публикации использует npm.

## Структура и поведение

```text
src/
  app/                          # UI, Redux store, базовые стили
  features/parts-search/
    model/                      # slice, thunks, selectors, эффекты запросов
    ui/                         # форма, бренды, таблица, фильтры, строка
  shared/
    api/                        # HTTP-клиент, Favorit adapter, demo adapter
    lib/                        # проверка артикула и форматирование
    ui/                         # loading/error/empty состояния
  widgets/                      # шапка, hero, инструкция
server/
  favorit-gateway.js             # общий gateway для Vite, Node.js и Sites
  node-gateway.js                # адаптация Node.js HTTP к Request/Response
  index.js                       # production Node.js сервер
  worker.js                      # адаптер хостинга Sites
scripts/
  build-worker.mjs               # упаковка и проверка Sites Worker
```

## Проверки

```bash
npm run check
# ESLint + Prettier + Vitest + production build и валидация Worker.
```