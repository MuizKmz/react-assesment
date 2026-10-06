import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AsyncView } from '@/shared/components/AsyncView'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { copy } from '@/shared/copy'
import { selectHistoryItems } from '../selectors'
import { historyCleared } from '../slice'
import { HistoryRow } from './HistoryRow'

/** Every search the user tried, newest first. */
export function HistoryPanel() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectHistoryItems)
  const [confirming, setConfirming] = useState(false)

  return (
    <AsyncView
      status="succeeded"
      data={items}
      renderEmpty={() => (
        <EmptyState icon={<History className="size-6" />} message={copy.historyEmpty} />
      )}
    >
      {(rows) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <ul aria-label="Search history" className="min-h-0 flex-1 overflow-y-auto py-1">
            {rows.map((item, index) => (
              <HistoryRow key={item.id} item={item} index={index} />
            ))}
          </ul>

          <div className="border-t border-line px-4 py-2.5">
            {confirming ? (
              <div
                role="group"
                aria-label="Confirm clear history"
                className="pf-enter-up flex items-center gap-2"
              >
                <span className="flex-1">
                  Clear {rows.length} {rows.length === 1 ? 'search' : 'searches'}?
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  autoFocus
                  onClick={() => {
                    dispatch(historyCleared())
                    setConfirming(false)
                  }}
                >
                  Clear
                </Button>
                <Button size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
                <Trash2 aria-hidden className="size-3.5" />
                Clear history
              </Button>
            )}
          </div>
        </div>
      )}
    </AsyncView>
  )
}
