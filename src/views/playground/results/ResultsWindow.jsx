import { useTranslation } from 'react-i18next'
import { Toggle } from '../../../components/toggle/Toggle.jsx'
import { ResultTab } from '../../../types/resultTab.js'
import { ResultTable } from './ResultTable.jsx'
import './ResultsWindow.scss'

/** A database client: the query result in the first tab, the tables of the shop in the others. */
export function ResultsWindow({ address, tables, tab, onTab, showExpected, onToggleExpected, children }) {
  const { t } = useTranslation()

  const table = tables.find((it) => it.name === tab)

  const renderTab = (value, label) => (
    <button
      key={value}
      type="button"
      role="tab"
      id={`results-tab-${value}`}
      aria-selected={tab === value}
      aria-controls="results-panel"
      className={`results-tab${value === ResultTab.Result ? '' : ' results-tab-table'}`}
      onClick={() => onTab(value)}
    >
      {label}
    </button>
  )

  const renderTable = () => (
    <>
      <p className="schema">
        {table.columns.map((c) => (
          <span key={c.name}>
            {c.name} <span className="schema-type">{c.type}</span>
          </span>
        ))}
      </p>
      <ResultTable result={table.data} caption={table.name} />
    </>
  )

  return (
    <section className="results" aria-label={t('results.label')}>
      <div className="results-bar">
        <span className="results-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="results-address">{address}</span>
        <Toggle checked={showExpected} onChange={onToggleExpected}>
          {t('results.showExpected')}
        </Toggle>
      </div>
      <div role="tablist" aria-label={t('results.tabs')} className="results-tabs">
        {renderTab(ResultTab.Result, t('results.result'))}
        {tables.map((it) => renderTab(it.name, it.name))}
      </div>
      <div className="results-body" id="results-panel" role="tabpanel" aria-labelledby={`results-tab-${tab}`}>
        {table ? renderTable() : children}
      </div>
    </section>
  )
}
