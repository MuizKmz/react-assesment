import { useState } from 'react'
import { MapPinned, Star } from 'lucide-react'
import { useAppSelector } from './hooks'
import { Tabs } from '@/shared/components/Tabs'
import { GoogleSearchBox } from '@/features/search/components/SearchBox'
import { GooglePlaceMap } from '@/features/place/components/PlaceMap'
import { PlaceCard } from '@/features/place/components/PlaceCard'
import { HistoryPanel } from '@/features/history/components/HistoryPanel'
import { selectHistoryCount } from '@/features/history/selectors'
import { FavouritesPanel } from '@/features/favourites/components/FavouritesPanel'
import { selectFavouriteCount } from '@/features/favourites/selectors'
import { GoogleKeyBanner } from '@/features/ui/components/GoogleKeyBanner'
import { Toaster } from '@/features/ui/components/Toaster'

type PanelTab = 'history' | 'favourites'

/**
 * Layout shell.
 * Desktop (lg+): 380px left panel (search on top, lists below) + map filling the rest.
 * Smaller screens: search, then map at 55vh, then the lists.
 */
export function App() {
  const historyCount = useAppSelector(selectHistoryCount)
  const favouriteCount = useAppSelector(selectFavouriteCount)
  const [tab, setTab] = useState<PanelTab>('history')

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="flex h-topbar shrink-0 items-center gap-3 bg-app-bar px-4 text-white lg:px-6">
        <MapPinned aria-hidden className="size-5" />
        <h1 className="flex-1 text-title font-bold">Place Finder</h1>
        <button
          type="button"
          onClick={() => setTab('favourites')}
          className="flex items-center gap-1.5 rounded-control px-2 py-1 font-medium hover:bg-app-hover focus-visible:outline-white"
        >
          <Star aria-hidden className="size-4 fill-star text-star" />
          {favouriteCount} {favouriteCount === 1 ? 'favourite' : 'favourites'}
        </button>
      </header>

      <GoogleKeyBanner />

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[var(--spacing-sidebar)_1fr] lg:grid-rows-[auto_minmax(0,1fr)]">
        <section
          aria-labelledby="find-heading"
          className="z-20 border-line bg-white px-4 pt-4 pb-3 lg:col-start-1 lg:row-start-1 lg:border-r"
        >
          <h2
            id="find-heading"
            className="mb-2 text-section font-semibold tracking-[0.04em] text-muted uppercase"
          >
            Find a place
          </h2>
          <GoogleSearchBox />
        </section>

        <section
          aria-label="Map"
          className="relative h-[55vh] overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto"
        >
          <GooglePlaceMap />
          <PlaceCard />
        </section>

        <section
          aria-label="Searches and favourites"
          className="flex min-h-[320px] flex-col border-line bg-white lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:border-r"
        >
          <Tabs
            idPrefix="panel"
            label="Searches and favourites"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'history', label: 'History', count: historyCount },
              { id: 'favourites', label: 'Favourites', count: favouriteCount },
            ]}
          >
            {tab === 'history' ? <HistoryPanel /> : <FavouritesPanel />}
          </Tabs>
        </section>
      </main>

      <Toaster />
    </div>
  )
}
