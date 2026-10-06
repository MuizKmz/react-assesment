import type { SearchEntry, SearchStatus } from '@/types/place'
import { HISTORY_LIMIT, initialState, type HistoryState } from './slice'

export const HISTORY_STORAGE_KEY = 'placeFinder.history.v1'

const STATUSES: SearchStatus[] = ['found', 'no-results', 'error']

function isSearchEntry(value: unknown): value is SearchEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.query === 'string' &&
    typeof entry.searchedAt === 'string' &&
    STATUSES.includes(entry.status as SearchStatus) &&
    (entry.place === null || typeof entry.place === 'object')
  )
}

/**
 * Reads saved history for the store's preloadedState.
 * Bad or old data is ignored and removed, so a broken value can never crash the app.
 */
export function loadHistory(storage: Storage | undefined = globalThis.localStorage): HistoryState {
  try {
    const raw = storage?.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return initialState
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('History is not an array')
    return { entries: parsed.filter(isSearchEntry).slice(0, HISTORY_LIMIT), selectedId: null }
  } catch {
    try {
      storage?.removeItem(HISTORY_STORAGE_KEY)
    } catch {
      // Storage blocked (private mode); nothing to clean up.
    }
    return initialState
  }
}

export function saveHistory(
  entries: SearchEntry[],
  storage: Storage | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Quota full or storage blocked: history still works for this session.
  }
}
