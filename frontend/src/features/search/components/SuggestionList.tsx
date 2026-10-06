import type { ReactNode } from 'react'
import clsx from 'clsx'

export const optionId = (listId: string, index: number) => `${listId}-option-${index}`

interface SuggestionListProps<T> {
  id: string
  label: string
  items: T[]
  activeIndex: number
  getKey: (item: T) => string
  onChoose: (item: T) => void
  onActiveIndexChange: (index: number) => void
  /** Render prop: the caller decides how one row looks */
  renderItem: (item: T, state: { active: boolean; index: number }) => ReactNode
}

/**
 * Render-props listbox. It owns the ARIA roles, ids, hover and click wiring;
 * the caller only provides the row content.
 */
export function SuggestionList<T>({
  id,
  label,
  items,
  activeIndex,
  getKey,
  onChoose,
  onActiveIndexChange,
  renderItem,
}: SuggestionListProps<T>) {
  return (
    <ul id={id} role="listbox" aria-label={label} className="max-h-80 overflow-y-auto py-1">
      {items.map((item, index) => {
        const active = index === activeIndex
        return (
          <li
            key={getKey(item)}
            id={optionId(id, index)}
            role="option"
            aria-selected={active}
            // Keep focus in the input when a row is clicked.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChoose(item)}
            onMouseMove={() => !active && onActiveIndexChange(index)}
            className={clsx(
              'cursor-pointer px-3 py-2 transition-colors',
              active ? 'bg-app-light' : 'hover:bg-page',
            )}
          >
            {renderItem(item, { active, index })}
          </li>
        )
      })}
    </ul>
  )
}
