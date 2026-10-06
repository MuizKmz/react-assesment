import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import clsx from 'clsx'

export interface TabItem<Id extends string> {
  id: Id
  label: string
  count?: number
}

interface TabsProps<Id extends string> {
  /** Prefix for element ids, so tabs and panels can reference each other */
  idPrefix: string
  label: string
  tabs: TabItem<Id>[]
  value: Id
  onChange: (id: Id) => void
  children: ReactNode
}

export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`
export const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`

/** WAI-ARIA tabs: ← → Home End move between tabs; only the active tab is in the Tab order. */
export function Tabs<Id extends string>({
  idPrefix,
  label,
  tabs,
  value,
  onChange,
  children,
}: TabsProps<Id>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const last = tabs.length - 1
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label={label}
        className="mx-4 mb-1 flex gap-1 rounded-xl bg-page p-1 ring-1 ring-line/60"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === value
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="tab"
              id={tabId(idPrefix, tab.id)}
              aria-selected={selected}
              aria-controls={panelId(idPrefix, tab.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={clsx(
                'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 font-semibold transition-all',
                selected
                  ? 'bg-white text-app-ink shadow-sm ring-1 ring-line'
                  : 'text-muted hover:text-ink',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'rounded-full px-1.5 text-section font-semibold',
                    selected ? 'bg-app-light text-app-ink' : 'bg-line/70 text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId(idPrefix, value)}
        aria-labelledby={tabId(idPrefix, value)}
        className="flex min-h-0 flex-1 flex-col"
      >
        {children}
      </div>
    </div>
  )
}
