import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/button/Button.jsx'
import { RichText } from '../../../components/rich-text/RichText.jsx'
import { ButtonVariant } from '../../../types/buttonVariant.js'
import { RunStatus } from '../../../types/runStatus.js'
import './QueryCheck.scss'

const PROBLEMS = {
  [RunStatus.Empty]: 'check.empty',
  [RunStatus.NoTable]: 'check.noTable',
}

/**
 * @param {{ run: import('../../../types/entities.js').QueryRun | null, result: import('../../../types/entities.js').CheckResult | null,
 *   solved: boolean, recap: string, isLast: boolean, onNext: () => void }} props
 */
export function QueryCheck({ run, result, solved, recap, isLast, onNext }) {
  const { t } = useTranslation()

  const issueText = (issue) => t(`check.issues.${issue.type}`, { count: issue.count, columns: issue.columns?.join(', ') })

  const statusText = (item) => {
    if (item.ok) return t('check.ok')
    if (item.pending) return t('check.pending')
    return item.issues.map(issueText).join(', ')
  }

  const renderItem = (item) => (
    <li key={item.name} className={item.ok ? 'is-ok' : item.pending ? 'is-pending' : 'is-off'}>
      <span className="item-mark" aria-hidden="true" />
      <span className="item-name">{t(`check.items.${item.name}`)}</span>
      <span className="item-status">{statusText(item)}</span>
    </li>
  )

  const renderProblem = () => {
    if (run?.status === RunStatus.Error) {
      return (
        <p className="problem problem-error">
          {t('check.error')} <code>{run.message}</code>
        </p>
      )
    }
    const key = PROBLEMS[run?.status]
    return key ? <p className="problem">{t(key)}</p> : null
  }

  const renderSolved = () => (
    <section className="check check-solved" aria-live="polite">
      <div className="solved-studs" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="solved-text">
        <h2>{t(isLast ? 'check.finished' : 'check.solved')}</h2>
        <p>
          <RichText text={recap} />
        </p>
      </div>
      {!isLast && (
        <Button variant={ButtonVariant.Primary} onClick={onNext}>
          {t('check.nextStep')}
        </Button>
      )}
    </section>
  )

  if (solved) return renderSolved()

  return (
    <section className="check" aria-labelledby="check-title">
      <h2 id="check-title">
        {t('check.title')}
        {result && (
          <span className="check-count" aria-live="polite">
            {t('check.count', { passed: result.passed, count: result.total })}
          </span>
        )}
      </h2>
      {renderProblem()}
      {result && <ul className="check-list">{result.items.map(renderItem)}</ul>}
    </section>
  )
}
