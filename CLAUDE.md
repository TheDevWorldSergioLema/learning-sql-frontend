# Brick by Brick SQL: frontend

Browser-only React app (Vite) that teaches SQL in a toy brick shop, with SQLite (sql.js) running in the browser.
No backend: progress is stored in `localStorage`. See `README.md` for how to run it and for the architecture.
Its design is shared with the HTML/CSS app (`learning-html-frontend`): keep both consistent.

## Commands

```sh
npm run dev      # dev server on http://localhost:5173
npm test         # vitest (jsdom)
npm run lint     # eslint
npm run build    # production build in dist/
```

Run `npm test`, `npm run lint` and `npm run build` before reporting a change as done.

## Guidelines

- Avoid adding unnecessary comments, take into account I'm an experienced developer
- Components are grouped by feature
- No hard-coded user-facing text: every label, placeholder, attribute text (`title`, `aria-label`, `alt`), toast and error message goes through i18n, in every locale (`src/i18n/locales/<en|fr|es|it|de>/translation.json`, English is the default)
- The test suites must have at least two levels: first level is the name of the class/component, second level is the name of the test or another group of tests
- The `src` folder has the following structure:
  - assets with small images (icons, logos, background images)
  - components with the root components (buttons, inputs, dropdown...)
  - hooks with the shared React hooks
  - i18n with the translations: English, French, Spanish, Italian and German
  - layout with the private and public layouts
  - services to access the backend with or without the authentication
  - stores to manage the state of the application
  - styles with the style definition of all the design tokens: the style values are in `src/styles/_config.scss`, the typography definitions in `src/styles/_typography.scss`
  - types with all the entities and enums definitions
  - utils with the shared helper functions
  - views with all the pages
  - test with the shared test setup and helpers
- Never hard-code a color, spacing, radius or font that exists as a token in `src/styles/_config.scss` / `_typography.scss`; add a token when a new value is needed
- The SVG must be created inside components/icons as React components, with currentColor instead of hard coded colors
- Prefer using fluent method chaining for request calls (with then, catch and finally), instead of try-catch blocks
- Sort the definitions on each component as following:
  - first the context declaration (useTranslation, useNavigation...)
  - the useState variables
  - the useEffect
  - the constants
  - the useMemo
  - the private methods
  - the partial renders
  - the return statement

## Project specifics

- The project is plain JavaScript: entities are JSDoc typedefs in `src/types/entities.js`, enums are frozen objects in `src/types/*.js`.
- Utils return structured values (`CheckResult`, `QueryRun`, `Issue`), never sentences: components translate them. SQLite's error messages are the only untranslated text, shown as code.
- A step's code lives in `src/views/playground/levels.js`, its texts in the translations under `levels.<id>` (`title`, `intro`, `goal`, `hints`, `recap`). Text fields accept `` `inline code` `` rendered by `RichText`, kept identical in every language.
- Comments inside a step's code are `-- {{key}}` placeholders, translated under `codeComments.<key>` and filled with `fillComments`; a translation must stay on one line.
- The data of the shop (`src/views/playground/shopDatabase.js`) is code: table names, colors and statuses stay in English in every language.
- Each component has its own `.scss` file next to it, starting with `@use 'config' as *;` (and `typography`, `mixins` when needed). Only `global.scss` defines global rules and the CSS custom properties used by the CodeMirror theme.
- The app loads sql.js through `src/services/sqlEngine.js` (the `.wasm` URL comes from Vite). Tests load it from `node_modules` with `loadTestEngine` (`src/test/engine.js`) and mock `sqlEngine.js` to render `PlaygroundView`.
