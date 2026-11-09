import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'

let engine = null

/** Loads SQLite (WebAssembly) once, in its own chunk: every query then runs on a fresh in-memory database. */
export function loadEngine() {
  engine ??= import('sql.js').then(({ default: initSqlJs }) => initSqlJs({ locateFile: () => wasmUrl }))
  return engine
}
