import { RunStatus } from '../types/runStatus.js'

/** @typedef {import('../types/entities.js').ResultSet} ResultSet */

const COMMENTS = /--[^\n]*|\/\*[\s\S]*?(\*\/|$)/g

/** True when the SQL holds nothing but comments, spaces and semicolons. */
export function isBlank(sql) {
  return sql.replace(COMMENTS, '').replace(/[\s;]/g, '') === ''
}

function open(SQL, seed) {
  const db = new SQL.Database()
  db.exec(seed)
  return db
}

/** Runs every statement, keeping the last table returned and counting the changed rows. */
function execute(db, sql) {
  let result = null
  let changes = 0
  for (const statement of db.iterateStatements(sql)) {
    const columns = statement.getColumnNames()
    const rows = []
    while (statement.step()) rows.push(statement.get())
    statement.free()
    if (columns.length > 0) result = { columns, rows }
    else changes += db.getRowsModified()
  }
  return { result, changes }
}

/**
 * Runs the student's SQL on a fresh copy of the database. With `checkSql`, the result is what `checkSql` reads
 * afterwards (the changed table), otherwise the last table returned by the SQL.
 * @param {any} SQL the sql.js module
 * @param {string} seed
 * @param {string} sql
 * @param {string} [checkSql]
 * @returns {import('../types/entities.js').QueryRun}
 */
export function runQuery(SQL, seed, sql, checkSql) {
  if (isBlank(sql)) return { status: RunStatus.Empty }
  const db = open(SQL, seed)
  try {
    const { result, changes } = execute(db, sql)
    const checked = checkSql ? execute(db, checkSql).result : result
    return checked ? { status: RunStatus.Ok, result: checked, changes } : { status: RunStatus.NoTable, changes }
  } catch (error) {
    return { status: RunStatus.Error, message: error.message }
  } finally {
    db.close()
  }
}

/**
 * The columns, types and rows of the tables as the seed creates them.
 * @returns {import('../types/entities.js').ShopTable[]}
 */
export function readTables(SQL, seed, names) {
  const db = open(SQL, seed)
  try {
    return names.map((name) => ({
      name,
      columns: execute(db, `PRAGMA table_info(${name})`).result.rows.map(([, column, type]) => ({ name: column, type })),
      data: execute(db, `SELECT * FROM ${name}`).result,
    }))
  } finally {
    db.close()
  }
}

/** The query that reads a whole table, in a stable order, to check what a query changed in it. */
export const tableCheck = (table) => `SELECT * FROM ${table} ORDER BY id`
