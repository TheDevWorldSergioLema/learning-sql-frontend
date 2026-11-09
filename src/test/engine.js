import { createRequire } from 'node:module'
import initSqlJs from 'sql.js/dist/sql-wasm.js'

const require = createRequire(import.meta.url)

/** SQLite for the tests, loaded from node_modules instead of the URL Vite serves. */
export const loadTestEngine = () => initSqlJs({ locateFile: (file) => require.resolve(`sql.js/dist/${file}`) })
