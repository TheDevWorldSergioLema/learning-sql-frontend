import { SQLite, sql as sqlLang } from '@codemirror/lang-sql'
import { EditorView } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/button/Button.jsx'
import { ButtonVariant } from '../../../types/buttonVariant.js'
import './SqlEditor.scss'

const editorTheme = EditorView.theme({
  '&': { fontSize: 'var(--font-size-code)', height: '100%' },
  '.cm-scroller': { fontFamily: 'var(--font-code)', lineHeight: 'var(--line-height-editor)' },
  '.cm-content': { padding: 'var(--spacing-6) 0' },
  '.cm-gutters': { backgroundColor: 'var(--color-panel-sunk)', border: 'none', color: 'var(--color-ink-faint)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--color-ink)' },
  '.cm-activeLine': { backgroundColor: 'var(--color-active-line)' },
  '&.cm-focused': { outline: 'none' },
})

const SETUP = { foldGutter: false, highlightActiveLine: true, autocompletion: true }

export function SqlEditor({ value, schema, onChange, onReset }) {
  const { t } = useTranslation()

  const extensions = useMemo(() => [sqlLang({ dialect: SQLite, schema, upperCaseKeywords: true }), editorTheme], [schema])

  return (
    <section className="editor" aria-label={t('editor.label')}>
      <div className="editor-bar">
        <span className="file-tab">{t('editor.file')}</span>
        <Button variant={ButtonVariant.Quiet} onClick={onReset}>
          {t('editor.startOver')}
        </Button>
      </div>
      <p className="editor-note">{t('editor.note')}</p>
      <div className="editor-body">
        <CodeMirror
          value={value}
          height="100%"
          extensions={extensions}
          basicSetup={SETUP}
          onChange={onChange}
          aria-label={t('editor.code')}
        />
      </div>
    </section>
  )
}
