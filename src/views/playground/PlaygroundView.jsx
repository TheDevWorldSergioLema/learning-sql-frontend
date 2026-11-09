import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCodeComments } from '../../hooks/useCodeComments.js'
import { useSqlEngine } from '../../hooks/useSqlEngine.js'
import { PublicLayout } from '../../layout/PublicLayout.jsx'
import { useProgressStore } from '../../stores/progressStore.js'
import { ResultTab } from '../../types/resultTab.js'
import { RunStatus } from '../../types/runStatus.js'
import { fillComments } from '../../utils/codeComments.js'
import { compareResults } from '../../utils/compare.js'
import { readTables, runQuery, tableCheck } from '../../utils/database.js'
import { QueryCheck } from './check/QueryCheck.jsx'
import { SqlEditor } from './editor/SqlEditor.jsx'
import { LessonPanel } from './lesson/LessonPanel.jsx'
import { levels } from './levels.js'
import { QueryResult } from './results/QueryResult.jsx'
import { ResultsWindow } from './results/ResultsWindow.jsx'
import { SHOP_SEED, SHOP_TABLES } from './shopDatabase.js'
import { StepStrip } from './steps/StepStrip.jsx'
import './PlaygroundView.scss'

export function PlaygroundView() {
  const { t } = useTranslation()
  const comments = useCodeComments()
  const { SQL, failed } = useSqlEngine()
  const progress = useProgressStore()
  const [tabChoice, setTabChoice] = useState(null)
  const [showExpected, setShowExpected] = useState(false)

  const index = Math.min(progress.current, levels.length - 1)
  const level = levels[index]
  const sql = progress.code[level.id] ?? fillComments(level.sql, comments)
  const query = useDeferredValue(sql)
  const tab = tabChoice?.id === level.id ? tabChoice.tab : ResultTab.Result
  const hintsShown = progress.hints[level.id] ?? 0
  const isLast = index === levels.length - 1
  const step = index + 1
  const checkSql = level.table && tableCheck(level.table)

  const tables = useMemo(() => (SQL ? readTables(SQL, SHOP_SEED, SHOP_TABLES) : []), [SQL])
  const schema = useMemo(() => Object.fromEntries(tables.map((it) => [it.name, it.columns.map((c) => c.name)])), [tables])
  const expected = useMemo(() => (SQL ? runQuery(SQL, SHOP_SEED, level.solution, checkSql).result : null), [SQL, level, checkSql])
  const run = useMemo(() => (SQL ? runQuery(SQL, SHOP_SEED, query, checkSql) : null), [SQL, query, checkSql])
  const result = useMemo(
    () => (expected && run?.status === RunStatus.Ok ? compareResults(expected, run.result, { columns: !level.table, ordered: level.ordered }) : null),
    [expected, run, level],
  )
  const solved = Boolean(result?.done) && query === sql

  const { complete } = progress
  useEffect(() => {
    if (solved) complete(level.id)
  }, [solved, complete, level.id])

  const renderCodeColumn = () => (
    <div className="column column-code">
      <LessonPanel
        key={level.id}
        step={step}
        total={levels.length}
        level={level}
        hintsShown={hintsShown}
        onHint={() => progress.showHint(level.id)}
        onSolution={() => progress.setCode(level.id, level.solution)}
      />
      <SqlEditor
        value={sql}
        schema={schema}
        onChange={(value) => progress.setCode(level.id, value)}
        onReset={() => progress.resetCode(level.id)}
      />
    </div>
  )

  const renderResultColumn = () => (
    <div className="column column-preview">
      <ResultsWindow
        address={t('results.address', { step: String(step).padStart(2, '0') })}
        tables={tables}
        tab={tab}
        onTab={(next) => setTabChoice({ id: level.id, tab: next })}
        showExpected={showExpected}
        onToggleExpected={setShowExpected}
      >
        <QueryResult
          run={run}
          expected={expected}
          matches={result?.matches}
          table={level.table}
          showExpected={showExpected}
          failed={failed}
        />
      </ResultsWindow>
      <QueryCheck
        run={run}
        result={result}
        solved={solved}
        recap={t(`levels.${level.id}.recap`)}
        isLast={isLast}
        onNext={() => progress.goTo(index + 1)}
      />
    </div>
  )

  return (
    <PublicLayout
      navigation={<StepStrip levels={levels} current={index} completed={progress.completed} onSelect={progress.goTo} />}
    >
      <main className="workspace">
        {renderCodeColumn()}
        {renderResultColumn()}
      </main>
    </PublicLayout>
  )
}
