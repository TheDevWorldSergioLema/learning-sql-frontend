import { beforeAll, describe, expect, it } from 'vitest'
import { locales } from '../../i18n/index.js'
import { loadTestEngine } from '../../test/engine.js'
import { RunStatus } from '../../types/runStatus.js'
import { compareResults } from '../../utils/compare.js'
import { fillComments } from '../../utils/codeComments.js'
import { runQuery, tableCheck } from '../../utils/database.js'
import { levels } from './levels.js'
import { SHOP_SEED } from './shopDatabase.js'

const codeOf = (l) => [l.sql, l.solution, l.example].filter(Boolean)

describe('levels', () => {
  let SQL

  beforeAll(async () => {
    SQL = await loadTestEngine()
  })

  const run = (level, sql) => runQuery(SQL, SHOP_SEED, sql, level.table && tableCheck(level.table))

  describe('steps', () => {
    it('has 20 steps with unique ids', () => {
      expect(levels).toHaveLength(20)
      expect(new Set(levels.map((l) => l.id)).size).toBe(20)
    })

    it('has a solution that runs and returns rows', () => {
      for (const l of levels) {
        const solved = run(l, l.solution)
        expect(solved.status, l.id).toBe(RunStatus.Ok)
        expect(solved.result.rows.length, l.id).toBeGreaterThan(0)
        if (l.table) expect(solved.changes, l.id).toBeGreaterThan(0)
      }
    })

    it('does not start solved', () => {
      for (const l of levels) {
        const expected = run(l, l.solution).result
        const starter = run(l, fillComments(l.sql, locales.en.codeComments))
        const solved = starter.status === RunStatus.Ok && compareResults(expected, starter.result, { columns: !l.table, ordered: l.ordered }).done
        expect(solved, l.id).toBe(false)
      }
    })
  })

  describe.each(Object.keys(locales))('texts in %s', (language) => {
    const translation = locales[language]

    it('has a title, an intro, a goal, hints and a recap for every step', () => {
      for (const l of levels) {
        const texts = translation.levels[l.id]
        expect(texts?.title && texts.goal && texts.recap && texts.intro.length && texts.hints.length >= 2, l.id).toBeTruthy()
      }
      expect(Object.keys(translation.levels)).toEqual(levels.map((l) => l.id))
    })

    it('has the same number of intro paragraphs and hints as English', () => {
      for (const l of levels) {
        expect(translation.levels[l.id].intro.length, l.id).toBe(locales.en.levels[l.id].intro.length)
        expect(translation.levels[l.id].hints.length, l.id).toBe(locales.en.levels[l.id].hints.length)
      }
    })

    it('fills every comment placeholder of the code', () => {
      for (const l of levels) {
        for (const code of codeOf(l)) {
          expect(fillComments(code, translation.codeComments), l.id).not.toMatch(/\{\{\w+\}\}/)
        }
      }
    })

    it('keeps the starter code running the same way once its comments are translated', () => {
      for (const l of levels) {
        const english = run(l, fillComments(l.sql, locales.en.codeComments))
        expect(run(l, fillComments(l.sql, translation.codeComments)), l.id).toEqual(english)
      }
    })
  })
})
