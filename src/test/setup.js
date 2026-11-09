import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import i18n from '../i18n/index.js'
import { Language } from '../types/language.js'

// jsdom has no layout: CodeMirror measures text ranges.
Range.prototype.getClientRects = () => []
Range.prototype.getBoundingClientRect = () => new DOMRect()

afterEach(async () => {
  cleanup()
  localStorage.clear()
  await i18n.changeLanguage(Language.English)
})
