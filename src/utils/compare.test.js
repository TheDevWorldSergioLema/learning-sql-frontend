import { describe, expect, it } from 'vitest'
import { CheckItem } from '../types/checkItem.js'
import { QueryIssue } from '../types/queryIssue.js'
import { compareResults } from './compare.js'

const expected = { columns: ['name', 'price'], rows: [['Classic 2x4', 0.3], ['Plate 1x6', 0.2]] }

const item = (result, name) => result.items.find((it) => it.name === name)

describe('compareResults', () => {
  describe('a matching result', () => {
    it('passes whatever the row order, the column order and the column case', () => {
      const result = compareResults(expected, { columns: ['PRICE', 'Name'], rows: [[0.2, 'Plate 1x6'], [0.25 + 0.05, 'Classic 2x4']] })

      expect(result).toMatchObject({ done: true, passed: 3, total: 3, matches: [true, true] })
    })
  })

  describe('columns', () => {
    it('lists the missing and the extra columns, and waits for them to check the values', () => {
      const result = compareResults(expected, { columns: ['name', 'color'], rows: [['Classic 2x4', 'red'], ['Plate 1x6', 'yellow']] })

      expect(item(result, CheckItem.Columns).issues).toEqual([
        { type: QueryIssue.MissingColumns, columns: ['price'] },
        { type: QueryIssue.ExtraColumns, columns: ['color'] },
      ])
      expect(item(result, CheckItem.Values)).toMatchObject({ ok: false, pending: true })
      expect(result.matches).toEqual([false, false])
    })

    it('checks the values but fails with an extra column', () => {
      const result = compareResults(expected, { columns: ['id', 'name', 'price'], rows: [[1, 'Classic 2x4', 0.3], [3, 'Plate 1x6', 0.2]] })

      expect(item(result, CheckItem.Values).ok).toBe(true)
      expect(result.done).toBe(false)
    })

    it('is not checked for a table', () => {
      const result = compareResults(expected, expected, { columns: false })

      expect(result.items.map((it) => it.name)).toEqual([CheckItem.Rows, CheckItem.Values])
    })
  })

  describe('rows', () => {
    it('counts the rows too many and marks them', () => {
      const result = compareResults(expected, { ...expected, rows: [...expected.rows, ['Tile 2x2', 0.18]] })

      expect(item(result, CheckItem.Rows).issues).toEqual([{ type: QueryIssue.TooManyRows, count: 1 }])
      expect(item(result, CheckItem.Values).ok).toBe(true)
      expect(result.matches).toEqual([true, true, false])
    })

    it('counts the rows missing or different', () => {
      const result = compareResults(expected, { ...expected, rows: [['Classic 2x4', 0.5]] })

      expect(item(result, CheckItem.Rows).issues).toEqual([{ type: QueryIssue.TooFewRows, count: 1 }])
      expect(item(result, CheckItem.Values).issues).toEqual([{ type: QueryIssue.MissingRows, count: 2 }])
    })

    it('matches a duplicated row only once', () => {
      const result = compareResults(expected, { ...expected, rows: [expected.rows[0], expected.rows[0]] })

      expect(item(result, CheckItem.Values).issues).toEqual([{ type: QueryIssue.MissingRows, count: 1 }])
      expect(result.matches).toEqual([true, false])
    })
  })

  describe('order', () => {
    it('checks the order of the rows when asked', () => {
      const reversed = { ...expected, rows: [...expected.rows].reverse() }

      expect(item(compareResults(expected, reversed, { ordered: true }), CheckItem.Order).issues).toEqual([{ type: QueryIssue.WrongOrder }])
      expect(compareResults(expected, expected, { ordered: true }).done).toBe(true)
    })

    it('waits for the right rows before checking the order', () => {
      const result = compareResults(expected, { ...expected, rows: [] }, { ordered: true })

      expect(item(result, CheckItem.Order)).toMatchObject({ ok: false, pending: true })
    })
  })
})
