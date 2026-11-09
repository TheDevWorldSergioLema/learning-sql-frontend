import { useTranslation } from 'react-i18next'
import { RichText } from '../../../components/rich-text/RichText.jsx'
import { RunStatus } from '../../../types/runStatus.js'
import { ResultTable } from './ResultTable.jsx'

/**
 * The student's result, or the reason there is none. For a level that changes a table, the result is that table.
 * @param {{ run: import('../../../types/entities.js').QueryRun | null, expected: import('../../../types/entities.js').ResultSet | null,
 *   matches: boolean[] | undefined, table: string | undefined, showExpected: boolean, failed: boolean }} props
 */
export function QueryResult({ run, expected, matches, table, showExpected, failed }) {
  const { t } = useTranslation()

  const caption = () => {
    if (!table) return t('results.yours')
    const after = t('results.tableAfter', { table })
    return run.changes ? `${after} · ${t('results.changes', { count: run.changes })}` : after
  }

  const renderRun = () => {
    if (failed) return <p className="results-message results-error">{t('results.loadError')}</p>
    if (!run) return <p className="results-message">{t('results.loading')}</p>
    if (run.status === RunStatus.Empty) return <p className="results-message">{t('results.empty')}</p>
    if (run.status === RunStatus.Error) return <p className="results-message results-error">{t('results.error')}</p>
    if (run.status === RunStatus.NoTable) return <p className="results-message"><RichText text={t('results.noTable')} /></p>
    return <ResultTable result={run.result} caption={<RichText text={caption()} />} matches={matches} />
  }

  return (
    <>
      {renderRun()}
      {showExpected && expected && <ResultTable result={expected} caption={t('results.expected')} expected />}
    </>
  )
}
