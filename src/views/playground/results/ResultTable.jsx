import { useTranslation } from 'react-i18next'
import './ResultTable.scss'

/** A result set as a table. With `matches`, each row is marked as expected or not. */
export function ResultTable({ result, caption, matches, expected = false }) {
  const { t } = useTranslation()

  const renderCell = (cell, i) => {
    if (cell === null) return <td key={i} className="cell-null">{t('results.null')}</td>
    return <td key={i} className={typeof cell === 'number' ? 'cell-number' : undefined}>{cell}</td>
  }

  const renderRow = (row, i) => {
    const match = matches?.[i]
    const className = match === undefined ? undefined : match ? 'row-ok' : 'row-off'
    return (
      <tr key={i} className={className} title={match === undefined ? undefined : t(match ? 'results.rowMatches' : 'results.rowOff')}>
        {row.map(renderCell)}
      </tr>
    )
  }

  return (
    <div className={`result${expected ? ' result-expected' : ''}`}>
      <div className="result-caption">
        <span>{caption}</span>
        <span className="result-count">{t('results.rows', { count: result.rows.length })}</span>
      </div>
      <div className="result-scroll">
        <table>
          <thead>
            <tr>
              {result.columns.map((c, i) => <th key={i} scope="col">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {result.rows.map(renderRow)}
            {result.rows.length === 0 && (
              <tr>
                <td className="cell-empty" colSpan={result.columns.length || 1}>{t('results.noRows')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
