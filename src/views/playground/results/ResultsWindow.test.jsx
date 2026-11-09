import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithUser } from '../../../test/render.js'
import { ResultTab } from '../../../types/resultTab.js'
import { RunStatus } from '../../../types/runStatus.js'
import { QueryResult } from './QueryResult.jsx'
import { ResultsWindow } from './ResultsWindow.jsx'

const toys = {
  name: 'toys',
  columns: [{ name: 'id', type: 'INTEGER' }, { name: 'name', type: 'TEXT' }],
  data: { columns: ['id', 'name'], rows: [[1, 'Car'], [2, null]] },
}

const props = { address: 'shop.db', tables: [toys], showExpected: false, onToggleExpected: () => {}, onTab: () => {} }
const resultProps = { expected: { columns: ['name'], rows: [['Car']] }, matches: [true, false], table: undefined, showExpected: false, failed: false }
const run = { status: RunStatus.Ok, result: { columns: ['name'], rows: [['Car'], ['Kite']] }, changes: 0 }

describe('ResultsWindow', () => {
  describe('tabs', () => {
    it('shows the result in the first tab and reports the chosen table', async () => {
      const onTab = vi.fn()
      const { user } = renderWithUser(
        <ResultsWindow {...props} tab={ResultTab.Result} onTab={onTab}>
          <p>the result</p>
        </ResultsWindow>,
      )

      expect(screen.getByRole('tab', { name: 'Result' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('the result')).toBeInTheDocument()
      await user.click(screen.getByRole('tab', { name: 'toys' }))
      expect(onTab).toHaveBeenCalledWith('toys')
    })

    it('shows the columns, types and rows of a table', () => {
      render(<ResultsWindow {...props} tab="toys" />)

      expect(screen.getByText('INTEGER')).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Car' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'NULL' })).toHaveClass('cell-null')
    })
  })

  describe('QueryResult', () => {
    it('marks the expected rows and the others', () => {
      render(<QueryResult {...resultProps} run={run} />)

      const [, car, kite] = screen.getAllByRole('row')
      expect(car).toHaveClass('row-ok')
      expect(kite).toHaveClass('row-off')
      expect(screen.getByText('2 rows')).toBeInTheDocument()
    })

    it('shows the expected result next to it on demand', () => {
      render(<QueryResult {...resultProps} run={run} showExpected />)

      const [, expectedTable] = screen.getAllByRole('table')
      expect(screen.getByText('Expected result')).toBeInTheDocument()
      expect(within(expectedTable).getAllByRole('row')).toHaveLength(2)
    })

    it('names the changed table and counts the changed rows', () => {
      render(<QueryResult {...resultProps} run={{ ...run, changes: 1 }} table="toys" />)

      expect(screen.getByText('toys', { selector: 'code' })).toBeInTheDocument()
      expect(screen.getByText(/1 row changed/)).toBeInTheDocument()
    })

    it('explains why there is no result', () => {
      render(<QueryResult {...resultProps} run={{ status: RunStatus.Error, message: 'oops' }} />)

      expect(screen.getByText('Fix the error to see the result.')).toBeInTheDocument()
    })
  })
})
