import { useEffect, useState } from 'react'
import { loadEngine } from '../services/sqlEngine.js'

/** The sql.js module once loaded: `{ SQL }` when ready, `{ failed: true }` when it can't load. */
export function useSqlEngine() {
  const [engine, setEngine] = useState({ SQL: null, failed: false })

  useEffect(() => {
    let active = true
    loadEngine()
      .then((SQL) => active && setEngine({ SQL, failed: false }))
      .catch(() => active && setEngine({ SQL: null, failed: true }))
    return () => {
      active = false
    }
  }, [])

  return engine
}
