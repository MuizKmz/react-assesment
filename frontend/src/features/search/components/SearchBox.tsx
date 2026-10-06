import { useId, useRef } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { IconButton } from '@/shared/components/IconButton'
import { Spinner } from '@/shared/components/Spinner'
import { copy } from '@/shared/copy'
import { withGoogleMaps } from '@/shared/hoc/withGoogleMaps'
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { HighlightedText } from './HighlightedText'
import { optionId, SuggestionList } from './SuggestionList'

/** WAI-ARIA combobox. All logic lives in usePlaceSearch; this file is markup. */
export function SearchBox() {
  const search = usePlaceSearch()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const inputId = useId()

  useOnClickOutside(rootRef, search.close)

  const hasSuggestions = search.suggestions.length > 0
  const showList = search.isOpen && hasSuggestions
  const showNoMatch =
    search.isOpen && search.status === 'succeeded' && !hasSuggestions && search.query.trim() !== ''
  const showError = search.isOpen && search.status === 'failed'
  const showDropdown = showList || showNoMatch || showError

  const clearAndFocus = () => {
    search.clear()
    inputRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search for a place
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && search.activeIndex >= 0 ? optionId(listId, search.activeIndex) : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder={copy.searchPlaceholder}
          value={search.query}
          onChange={search.onChange}
          onKeyDown={search.onKeyDown}
          className="h-input w-full rounded-control border border-input-line bg-white pr-16 pl-9 text-body text-ink placeholder:text-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/25 focus:outline-none"
        />
        <div className="absolute inset-y-0 right-1 flex items-center gap-1">
          {search.isLoading && <Spinner label="Searching" />}
          {search.query && (
            <IconButton
              label="Clear search"
              size="sm"
              icon={<X className="size-4" />}
              onClick={clearAndFocus}
            />
          )}
        </div>
      </div>

      {/* Announce result counts to screen readers */}
      <p className="sr-only" aria-live="polite">
        {showList
          ? `${search.suggestions.length} suggestions available. Use up and down arrows to choose.`
          : ''}
      </p>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-card border border-line bg-white shadow-lg">
          {showList && (
            <SuggestionList
              id={listId}
              label="Suggestions"
              items={search.suggestions}
              activeIndex={search.activeIndex}
              getKey={(s) => s.placeId}
              onChoose={search.choose}
              onActiveIndexChange={search.setActiveIndex}
              renderItem={(s, { active }) => (
                <div className="flex items-start gap-2.5">
                  <MapPin
                    aria-hidden
                    className={
                      active ? 'mt-0.5 size-4 text-app-primary' : 'mt-0.5 size-4 text-muted'
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate text-ink">
                      <HighlightedText text={s.primaryText} matches={s.primaryMatches} />
                    </p>
                    {s.secondaryText && (
                      <p className="truncate text-label text-muted">{s.secondaryText}</p>
                    )}
                  </div>
                </div>
              )}
            />
          )}
          {showNoMatch && (
            <p role="status" className="px-3 py-3 text-muted">
              {copy.noSuggestions(search.query.trim())}
            </p>
          )}
          {showError && (
            <div role="alert" className="flex items-center gap-3 px-3 py-3">
              <p className="flex-1 text-danger-text">{search.error}</p>
              <Button size="sm" onClick={search.retry}>
                {copy.retry}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SearchBoxSkeleton() {
  return <div aria-hidden className="h-input animate-pulse rounded-control bg-page" />
}

/** The version used in the app: waits for Google Maps to load. */
export const GoogleSearchBox = withGoogleMaps(SearchBox, {
  skeleton: <SearchBoxSkeleton />,
  layout: 'inline',
})
