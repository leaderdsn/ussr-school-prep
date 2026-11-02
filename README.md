# Школа СССР — школьная программа 1–11 класс

Тренажёр для ученика с 1 по 11 класс: теория, тест и контрольная работа по каждому предмету в каждом классе.

- Предметы, которые были в СССР, изложены по советским учебникам. Под каждой темой есть блок «Сейчас в российской школе».
- Предметы, которых в СССР не было, изложены по программе РФ (ФОП). Под темой есть блок «А как было в СССР».
- Классы нумеруются по-современному, 1–11. Если в СССР материал шёл в другом классе, это указано на странице класса.

Объяснения написаны своими словами по программе и логике учебников, тексты учебников не копируются.

## Запуск

Нужны Node.js `^22.18.0` или `>=24.12.0` и pnpm 11 (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Скрипт | Что делает |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm preview` | Dev-сервер, сборка с проверкой типов, просмотр сборки |
| `pnpm lint` / `pnpm test` | ESLint (включая границы FSD) и тесты Vitest |
| `pnpm content:status` | Какие классы написаны и что следующее в очереди |
| `pnpm content:index` | Пересобрать `grades-index.json` из файлов классов |
| `pnpm content:check` | Проверить каталог, все файлы классов и актуальность индекса |

## Стек

Vue 3.5, Vite 8, TypeScript (strict), Pinia, PrimeVue 4, Sass, Vitest. Архитектура — Feature-Sliced Design, границы слоёв
проверяет ESLint. Основа — [vue-fsd-starter](https://github.com/leaderdsn/vue-fsd-starter), отображение уроков и тестов —
по образцу [vue-interview-prep](https://github.com/leaderdsn/vue-interview-prep).

```
src/
  app/                    провайдеры, роутер, глобальные стили
  pages/home              выбор класса и предметов, общий прогресс
  pages/grade             темы класса, тест и контрольная: /grade/math-1/3, /test, /control
  widgets/subject-grid    карточки предметов выбранного класса
  features/run-quiz       тест: один ответ, несколько ответов, ввод ответа
  features/run-control    контрольная: баллы, оценка, разбор решений
  features/manage-progress  экспорт, импорт и сброс прогресса
  entities/subject        схема контента, загрузка, валидатор, проверка ответов
  entities/progress       прогресс в localStorage
  shared/                 конфиг и дизайн-токены
```

## Контент

Всё лежит в `src/entities/subject/data`:

- `subjects.json` — каталог предметов: эпоха (`ussr` / `rf`), классы, учебники, описания готовых классов;
- `grades/<предмет>-<класс>.json` — один класс: учебник, 4–6 тем с блоком сравнения, тест на 10–12 вопросов,
  контрольная на 5–7 заданий;
- `grades-index.json` — генерируется `pnpm content:index`, руками не правится.

Схема — [types.ts](src/entities/subject/model/types.ts), правила проверки — [validate.ts](src/entities/subject/lib/validate.ts),
образец — [math-1.json](src/entities/subject/data/grades/math-1.json). Правила написания и порядок работы описаны в
[docs/CONTENT.md](docs/CONTENT.md).

Новый класс: `pnpm content:status` → написать JSON → `pnpm content:index` → `pnpm content:check` → коммит
`feat(content): <предмет>-<класс>`.

## Прогресс

Прочитанные темы, результаты тестов и оценки за контрольные хранятся в браузере (`localStorage`). На главной странице
прогресс можно сохранить в файл и загрузить на другом устройстве. Тест засчитывается от 80%, контрольная — от оценки «3»
(50% баллов).
