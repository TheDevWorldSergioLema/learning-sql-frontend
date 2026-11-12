# Brick by Brick SQL

A browser-only playground where students learn SQL in a toy brick shop. The SQL editor is on the left, a
database client on the right. Each of the 20 steps explains one idea, runs the query live on a real SQLite
database, checks the result against the expected one and offers hints. It is the SQL companion of
[Brick by Brick](https://learning-html.sergiolema.dev) (HTML and CSS), with the same design.

| Steps | Concept | What the student does |
| --- | --- | --- |
| 1–4 | `SELECT`, `AS`, `ORDER BY` | read a table, pick, rename and sort columns |
| 5–8 | `WHERE` with `=`, `<`, `>`, `LIKE` | filter numbers and text (quotes) |
| 9 | dates | compare dates written `'YYYY-MM-DD'` |
| 10–13 | `AND`, `OR`, parentheses, `IN` | combine conditions, and the `AND`-before-`OR` trap |
| 14–15 | `BETWEEN`, `strftime` | periods and parts of a date (text vs number) |
| 16–17 | `INSERT` | value types, generated ids and defaults |
| 18–20 | `UPDATE` | change one row, compute from the old value, never forget the `WHERE` |

The shop database has two tables, `bricks` (numbers, text, a `REAL` price and a `DATE`) and `orders`.
Students can browse them, with their column types, in the tabs of the database window.

The interface and the lessons are available in English (default), French, Spanish, Italian and German, picked
from the selector at the right of the top bar. The data (table names, colors, statuses) stays in English.

There is no backend: progress, queries, hints and the chosen language are saved in the browser's `localStorage`.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```sh
npm install
npm run dev        # http://localhost:5173 (also exposed on the network)
npm test           # unit and component tests (vitest + Testing Library, jsdom)
npm run lint       # eslint
npm run build      # static files in dist/
npm run preview    # serves dist/ on http://localhost:4173
```

`dist/` is a static site: it can be served by any web server, no runtime configuration needed.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: lint, tests and build, then `dist/` is published to
GitHub Pages at https://learning-sql.sergiolema.dev.

One-time setup:

- DNS: a `CNAME` record `learning-sql` → `thedevworldsergiolema.github.io.`
- GitHub, repo **Settings → Pages**: source **GitHub Actions**, custom domain `learning-sql.sergiolema.dev`,
  then **Enforce HTTPS** once the certificate is issued

## Stack

- React 19, built with Vite
- sql.js: SQLite compiled to WebAssembly, loaded in its own chunk
- CodeMirror 6 (`@uiw/react-codemirror`, `@codemirror/lang-sql`) for the SQL editor, with completion of the shop's tables and columns
- zustand for the application state
- i18next / react-i18next for every user-facing text (English, French, Spanish, Italian, German)
- SCSS for the styles, with the design tokens in `src/styles`
- Vitest, Testing Library and jsdom for the tests

## Architecture

```
src/
├── main.jsx            entry point: loads i18n and the global styles, renders the view
├── components/         root components, shared by every feature
│   ├── button/         Button (primary, secondary, quiet)
│   ├── icons/          SVG icons as React components, drawn with currentColor
│   ├── language-select/ LanguageSelect: switches and saves the interface language
│   ├── rich-text/      RichText: text where `backticks` mark inline code
│   └── toggle/         Toggle switch
├── hooks/              useSqlEngine (loads SQLite), useCodeComments (translated code comments)
├── i18n/               i18next setup and locales/<en|fr|es|it|de>/translation.json
├── layout/             PublicLayout: top bar with the brand, the step strip and the language selector; Footer with the project links
├── services/           sqlEngine (loads sql.js and its .wasm once), progressService and languageService (localStorage)
├── stores/             progressStore (zustand): current step, completed steps, query and hints per step
├── styles/             _config.scss (tokens), _typography.scss, _mixins.scss, global.scss
├── test/               shared test setup, render helper, SQLite loader for node
├── types/              enums (CheckItem, QueryIssue, RunStatus, ResultTab, ButtonVariant, Language, FooterLink) and JSDoc entities
├── utils/              database (run a query on a fresh database), compare (check a result), codeComments
└── views/
    └── playground/     the only page, its components grouped by feature
        ├── PlaygroundView.jsx
        ├── levels.js       the 20 steps: starter query, solution, example
        ├── shopDatabase.js the tables and rows of the brick shop
        ├── check/          QueryCheck: SQLite error, checks passed, success
        ├── editor/         SqlEditor: query.sql
        ├── lesson/         LessonPanel: explanation, goal, hints, solution
        ├── results/        ResultsWindow (database client, tabs), QueryResult, ResultTable
        └── steps/          StepStrip: the 20 steps as studs in the top bar
```

### How a step is checked

```
progressStore ──► PlaygroundView ──► LessonPanel, SqlEditor ──(edits)──► progressStore ──► progressService (localStorage)
                        │
                        ├──► runQuery(student query)  ─┐
                        └──► runQuery(solution)       ─┴─► compareResults ─► QueryCheck, QueryResult
```

- Every run opens a fresh in-memory SQLite database from `shopDatabase.js` (`src/utils/database.js`), so a
  query that deletes or breaks data never affects the next one.
- A reading step compares the last table returned by the query with the solution's. A step with a `table`
  changes data: the check reads that whole table (`SELECT * FROM <table> ORDER BY id`) after the query.
- `src/utils/compare.js` matches the columns by name (any case, any order) and the rows by value (any order,
  unless the step is `ordered`), and returns structured checks (`CheckItem` with `QueryIssue` values), which
  `QueryCheck` turns into sentences through i18n ("2 rows too many", "missing price"). Numbers are rounded to
  avoid floating point surprises (`0.25 + 0.05`).
- SQLite's own error message is shown as is, after a translated "SQLite error:".

Because the target comes from the solution, any query that returns the same result passes.

## Adding or changing a step

- Code lives in `src/views/playground/levels.js`: the starter `sql`, the `solution`, an optional `example`, the
  `concept` badge, `ordered: true` when the row order matters and `table` when the step changes data.
- Texts live in every `src/i18n/locales/<language>/translation.json` under `levels.<id>`: `title`, `intro`
  (paragraphs), `goal`, progressive `hints` and the `recap` shown on success. They accept
  `` `inline code` ``, which must stay identical in every language.
- Comments in the code are written as `-- {{key}}` placeholders and translated under `codeComments.<key>`
  (`fillComments` in `src/utils/codeComments.js`), so the starter query and examples follow the chosen language.

`levels.test.js` runs every solution and starter on SQLite: each solution returns rows (and changes some for a
`table` step), no starter is already solved, every step has all its texts in every language and translated
comments don't change what the starter does. `locales.test.js` checks that every language has the same keys,
placeholders and inline code as English.

## Contributing

Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).
