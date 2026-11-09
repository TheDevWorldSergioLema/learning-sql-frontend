import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithUser } from '../../../test/render.js'
import { RunStatus } from '../../../types/runStatus.js'
import { compareResults } from '../../../utils/compare.js'
import { QueryCheck } from './QueryCheck.jsx'

const props = { solved: false, recap: 'Well done', isLast: false, onNext: () => {} }

const expected = { columns: ['name', 'price'], rows: [['Car', 2], ['Kite', 3]] }

describe('QueryCheck', () => {
  describe('while writing', () => {
    it('counts the checks passed and explains the others', () => {
      const actual = { columns: ['name'], rows: [['Car'], ['Kite'], ['Ball']] }
      render(<QueryCheck {...props} run={{ status: RunStatus.Ok, result: actual }} result={compareResults(expected, actual)} />)

      expect(screen.getByText('0 of 3 checks passed')).toBeInTheDocument()
      expect(screen.getByText('missing price')).toBeInTheDocument()
      expect(screen.getByText('1 row too many')).toBeInTheDocument()
      expect(screen.getByText('fix the lines above first')).toBeInTheDocument()
    })

    it('marks the passed checks as correct', () => {
      const actual = { ...expected, rows: [['Car', 2]] }
      render(<QueryCheck {...props} run={{ status: RunStatus.Ok, result: actual }} result={compareResults(expected, actual)} />)

      expect(screen.getByText('1 of 3 checks passed')).toBeInTheDocument()
      expect(screen.getByText('correct')).toBeInTheDocument()
      expect(screen.getByText('1 expected row is missing or different')).toBeInTheDocument()
    })

    it('shows the SQLite error', () => {
      render(<QueryCheck {...props} run={{ status: RunStatus.Error, message: 'no such column: blue' }} result={null} />)

      expect(screen.getByText('SQLite error:')).toBeInTheDocument()
      expect(screen.getByText('no such column: blue')).toBeInTheDocument()
    })

    it('says when the editor is empty', () => {
      render(<QueryCheck {...props} run={{ status: RunStatus.Empty }} result={null} />)

      expect(screen.getByText('The editor is empty.')).toBeInTheDocument()
    })
  })

  describe('when solved', () => {
    it('shows the recap and goes to the next step', async () => {
      const onNext = vi.fn()
      const { user } = renderWithUser(<QueryCheck {...props} solved run={null} result={null} onNext={onNext} />)

      expect(screen.getByText('Step complete!')).toBeInTheDocument()
      expect(screen.getByText('Well done')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Next step' }))
      expect(onNext).toHaveBeenCalledOnce()
    })

    it('has no next step after the last one', () => {
      render(<QueryCheck {...props} solved isLast run={null} result={null} />)

      expect(screen.getByText('You finished every step!')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
