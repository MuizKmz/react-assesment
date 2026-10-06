import { useId, useRef, useState } from 'react'
import { Search, SearchX, Sparkles, X } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CategoryIcon } from '@/shared/components/CategoryIcon'
import { IconButton } from '@/shared/components/IconButton'
import { Spinner } from '@/shared/components/Spinner'
import { copy } from '@/shared/copy'
import { withGoogleMaps } from '@/shared/hoc/withGoogleMaps'
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside'
import { formatDistance } from '@/shared/utils/geo'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import { HighlightedText } from './HighlightedText'
import { optionId, SuggestionList } from './SuggestionList'

/** One-click examples, so a reviewer can see the whole flow without typing. */
export const EXAMPLES = ['Petronas Twin Towers', 'Batu Caves', 'Penang Hill', 'Legoland Malaysia']

/** WAI-ARIA combobox. All logic lives in usePlaceSearch; this file is markup. */
export function SearchBox() {
  const search = usePlaceSearch()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const inputId = useId()
  const [focused, setFocused] = useState(false)

  useOnClickOutside(rootRef, search.close)
  useSearchShortcut(inputRef)

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
      <div className="group relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-app-ink"
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
          aria-keyshortcuts="/ Control+K"
          autoComplete="off"
          spellCheck={false}
          placeholder={copy.searchPlaceholder}
          value={search.query}
          onChange={search.onChange}
          onKeyDown={search.onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-11 w-full rounded-xl border border-input-line bg-white pr-16 pl-10 text-body text-ink shadow-sm transition placeholder:text-muted focus:border-app-hover focus:shadow-[0_0_0_4px_rgb(255_199_44/0.35)] focus:outline-none"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          {search.isLoading && <Spinner label="Searching" />}
          {search.query ? (
            <IconButton
              label="Clear search"
              size="sm"
              icon={<X className="size-4" />}
              onClick={clearAndFocus}
            />
          ) : (
            !focused && (
              <span aria-hidden className="mr-1.5 hidden items-center gap-0.5 sm:flex">
                <kbd>/</kbd>
              </span>
            )
          )}
        </div>
      </div>

      {/* Announce result counts to screen readers */}
      <p className="sr-only" aria-live="polite">
        {showList
          ? `${search.suggestions.length} suggestions available. Use up and down arrows to choose.`
          : ''}
      </p>

      {!search.query && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-label text-muted">
            <Sparkles aria-hidden className="size-3.5 text-star" />
            Try
          </span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => search.tryExample(example)}
              className="rounded-full border border-line bg-white px-2.5 py-1 text-label font-medium text-ink transition hover:-translate-y-px hover:border-app-light-border hover:bg-app-light hover:text-app-ink"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {showDropdown && (
        <div className="pf-enter-up absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-ink/10">
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
                <div className="flex items-center gap-3">
                  <CategoryIcon types={s.types} variant={active ? 'solid' : 'soft'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      <HighlightedText text={s.primaryText} matches={s.primaryMatches} />
                    </p>
                    {s.secondaryText && (
                      <p className="truncate text-label text-muted">{s.secondaryText}</p>
                    )}
                  </div>
                  {s.distanceMeters !== null && (
                    <span
                      className="shrink-0 text-label font-medium text-muted tabular-nums"
                      title="Straight-line distance"
                    >
                      {formatDistance(s.distanceMeters)}
                    </span>
                  )}
                </div>
              )}
            />
          )}
          {showNoMatch && (
            <div role="status" className="flex items-start gap-3 px-4 py-4 text-muted">
              <SearchX aria-hidden className="mt-0.5 size-5 shrink-0" />
              <p>{copy.noSuggestions(search.query.trim())}</p>
            </div>
          )}
          {showError && (
            <div role="alert" className="flex items-center gap-3 px-4 py-3">
              <p className="flex-1 text-danger-text">{search.error}</p>
              <Button size="sm" onClick={search.retry}>
                {copy.retry}
              </Button>
            </div>
          )}
          <p className="border-t border-line bg-page/60 px-4 py-1.5 text-right text-section text-muted">
            powered by <span className="font-semibold">Google</span>
          </p>
        </div>
      )}
    </div>
  )
}

function SearchBoxSkeleton() {
  return <div aria-hidden className="pf-shimmer h-11 rounded-xl" />
}

/** The version used in the app: waits for Google Maps to load. */
export const GoogleSearchBox = withGoogleMaps(SearchBox, {
  skeleton: <SearchBoxSkeleton />,
  layout: 'inline',
})
