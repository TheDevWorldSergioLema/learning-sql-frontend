import { beforeAll, describe, expect, it } from 'vitest'
import { loadTestEngine } from '../test/engine.js'
import { RunStatus } from '../types/runStatus.js'
import { isBlank, readTables, runQuery, tableCheck } from './database.js'

const SEED = `
CREATE TABLE toys (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL);
INSERT INTO toys VALUES (1, 'Car', 2.5), (2, 'Kite', NULL);
`

describe('database', () => {
  let SQL

  beforeAll(async () => {
    SQL = await loadTestEngine()
  })

  describe('isBlank', () => {
    it('ignores comments, spaces and semicolons', () => {
      expect(isBlank('-- nothing yet\n /* still nothing */ ;\n')).toBe(true)
      expect(isBlank('-- read\nSELECT 1;')).toBe(false)
    })
  })

  describe('runQuery', () => {
    it('returns the columns and rows of the last table, even without rows', () => {
      expect(runQuery(SQL, SEED, "SELECT * FROM toys; SELECT name FROM toys WHERE name = 'Ball';")).toEqual({
        status: RunStatus.Ok,
        result: { columns: ['name'], rows: [] },
        changes: 0,
      })
    })

    it('reads the changed table with a check query, and counts the changed rows', () => {
      const run = runQuery(SQL, SEED, 'UPDATE toys SET price = 1', tableCheck('toys'))

      expect(run.changes).toBe(2)
      expect(run.result.rows).toEqual([[1, 'Car', 1], [2, 'Kite', 1]])
    })

    it('starts every run from the seed', () => {
      runQuery(SQL, SEED, 'DELETE FROM toys')

      expect(runQuery(SQL, SEED, 'SELECT * FROM toys').result.rows).toHaveLength(2)
    })

    it('reports an empty query, a query without table and SQLite errors', () => {
      expect(runQuery(SQL, SEED, '  -- todo')).toEqual({ status: RunStatus.Empty })
      expect(runQuery(SQL, SEED, 'DELETE FROM toys WHERE id = 1')).toEqual({ status: RunStatus.NoTable, changes: 1 })
      expect(runQuery(SQL, SEED, 'SELECT * FROM boats')).toEqual({ status: RunStatus.Error, message: 'no such table: boats' })
    })
  })

  describe('readTables', () => {
    it('returns the columns with their types and the rows of each table', () => {
      const [toys] = readTables(SQL, SEED, ['toys'])

      expect(toys.columns).toEqual([
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'price', type: 'REAL' },
      ])
      expect(toys.data.rows).toEqual([[1, 'Car', 2.5], [2, 'Kite', null]])
    })
  })
})
