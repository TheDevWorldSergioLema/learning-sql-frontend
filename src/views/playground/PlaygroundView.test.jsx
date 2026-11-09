import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgressStore } from '../../stores/progressStore.js'
import { loadTestEngine } from '../../test/engine.js'
import { renderWithUser } from '../../test/render.js'
import { levels } from './levels.js'
import { PlaygroundView } from './PlaygroundView.jsx'

vi.mock('../../services/sqlEngine.js', () => ({ loadEngine: () => loadTestEngine() }))

const goTo = (id) => useProgressStore.setState({ current: levels.findIndex((l) => l.id === id), completed: [], code: {}, hints: {} })

describe('PlaygroundView', () => {
  beforeEach(() => goTo('select-all'))

  describe('a query step', () => {
    it('runs the starter query and checks it against the solution', async () => {
      renderWithUser(<PlaygroundView />)

      expect(await screen.findByText('8 rows')).toBeInTheDocument()
      expect(screen.getByText('0 of 3 checks passed')).toBeInTheDocument()
      expect(screen.getByText(/missing name, color/)).toBeInTheDocument()
    })

    it('completes the step with the solution', async () => {
      const { user } = renderWithUser(<PlaygroundView />)
      await screen.findByText('8 rows')

      for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: /hint/i }))
      await user.click(screen.getByRole('button', { name: 'Show me the solution' }))
      await user.click(screen.getByRole('button', { name: 'Replace my query' }))

      expect(await screen.findByText('Step complete!')).toBeInTheDocument()
      expect(screen.getByText('10 rows')).toBeInTheDocument()
      expect(useProgressStore.getState().completed).toEqual(['select-all'])
    })

    it('shows the tables of the shop with their types', async () => {
      const { user } = renderWithUser(<PlaygroundView />)
      await screen.findByText('8 rows')

      await user.click(screen.getByRole('tab', { name: 'bricks' }))

      const panel = within(screen.getByRole('tabpanel'))
      expect(panel.getByRole('columnheader', { name: 'added_on' })).toBeInTheDocument()
      expect(panel.getByText('DATE')).toBeInTheDocument()
      expect(panel.getByText('10 rows')).toBeInTheDocument()
    })
  })

  describe('a step that changes a table', () => {
    it('shows the SQLite error of the starter query', async () => {
      goTo('insert-row')
      renderWithUser(<PlaygroundView />)

      expect(await screen.findByText('unrecognized token: "1x2"')).toBeInTheDocument()
      expect(screen.getByText('Fix the error to see the result.')).toBeInTheDocument()
    })

    it('checks the whole table after the query', async () => {
      goTo('update-where')
      renderWithUser(<PlaygroundView />)

      expect(await screen.findByText(/8 rows changed/)).toBeInTheDocument()
      expect(screen.getByText('3 expected rows are missing or different')).toBeInTheDocument()
    })
  })
})
