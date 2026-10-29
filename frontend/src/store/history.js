// Saves a small log of results in the browser (no accounts, no database).
// Photos are never stored, only short text and numbers.
const KEY = 'foodverse.history.v1'
const LIMIT = 100

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function addHistory({ type, title, metrics = {} }) {
  const entry = { type, title, metrics, at: new Date().toISOString() }
  try {
    localStorage.setItem(KEY, JSON.stringify([entry, ...getHistory()].slice(0, LIMIT)))
  } catch {
    /* storage full or blocked: skip silently */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
