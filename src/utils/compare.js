import { CheckItem } from '../types/checkItem.js'
import { QueryIssue } from '../types/queryIssue.js'

/** @typedef {import('../types/entities.js').ResultSet} ResultSet */

// 0.25 + 0.05 is 0.30000000000000004 in floating point: rounding keeps it equal to 0.3.
const PRECISION = 1e9

const cellKey = (cell) => (typeof cell === 'number' ? Math.round(cell * PRECISION) / PRECISION : cell)
const rowKey = (row) => JSON.stringify(row.map(cellKey))

const lower = (columns) => columns.map((c) => c.toLowerCase())

function checkColumns(expected, actual) {
  const wanted = lower(expected)
  const got = lower(actual)
  const missing = expected.filter((_, i) => !got.includes(wanted[i]))
  const extra = actual.filter((_, i) => !wanted.includes(got[i]))
  const issues = [
    ...(missing.length ? [{ type: QueryIssue.MissingColumns, columns: missing }] : []),
    ...(extra.length ? [{ type: QueryIssue.ExtraColumns, columns: extra }] : []),
  ]
  return { name: CheckItem.Columns, ok: issues.length === 0, issues }
}

function checkRows(expected, actual) {
  const diff = actual - expected
  if (diff === 0) return { name: CheckItem.Rows, ok: true, issues: [] }
  const type = diff > 0 ? QueryIssue.TooManyRows : QueryIssue.TooFewRows
  return { name: CheckItem.Rows, ok: false, issues: [{ type, count: Math.abs(diff) }] }
}

/** Matches each expected row with one row of the result, whatever their order. */
function matchRows(expectedKeys, actualKeys) {
  const available = new Map()
  expectedKeys.forEach((key) => available.set(key, (available.get(key) ?? 0) + 1))
  const matches = actualKeys.map((key) => {
    const left = available.get(key) ?? 0
    if (left > 0) available.set(key, left - 1)
    return left > 0
  })
  const missing = [...available.values()].reduce((sum, n) => sum + n, 0)
  return { matches, missing }
}

const pending = (name) => ({ name, ok: false, pending: true, issues: [] })

/**
 * Compares the student's result with the expected one. Columns are matched by name (any case, any order),
 * rows by value; their order only matters with `ordered`.
 * @param {ResultSet} expected
 * @param {ResultSet} actual
 * @param {{ columns?: boolean, ordered?: boolean }} [options] `columns: false` when the columns can't differ (a table)
 * @returns {import('../types/entities.js').CheckResult}
 */
export function compareResults(expected, actual, { columns = true, ordered = false } = {}) {
  const columnItem = checkColumns(expected.columns, actual.columns)
  const rowItem = checkRows(expected.rows.length, actual.rows.length)

  const got = lower(actual.columns)
  const positions = lower(expected.columns).map((c) => got.indexOf(c))
  const comparable = positions.every((p) => p >= 0)

  const expectedKeys = expected.rows.map(rowKey)
  const actualKeys = comparable ? actual.rows.map((row) => rowKey(positions.map((p) => row[p]))) : []
  const { matches, missing } = comparable
    ? matchRows(expectedKeys, actualKeys)
    : { matches: actual.rows.map(() => false), missing: expected.rows.length }

  const valueItem = !comparable
    ? pending(CheckItem.Values)
    : { name: CheckItem.Values, ok: missing === 0, issues: missing ? [{ type: QueryIssue.MissingRows, count: missing }] : [] }

  const sameRows = rowItem.ok && valueItem.ok
  const inOrder = sameRows && expectedKeys.every((key, i) => key === actualKeys[i])
  const orderItem = !sameRows
    ? pending(CheckItem.Order)
    : { name: CheckItem.Order, ok: inOrder, issues: inOrder ? [] : [{ type: QueryIssue.WrongOrder }] }

  const items = [...(columns ? [columnItem] : []), rowItem, valueItem, ...(ordered ? [orderItem] : [])]
  const passed = items.filter((it) => it.ok).length

  return { done: passed === items.length, passed, total: items.length, items, matches }
}
