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
 * Desktop (lg+): the map fills the screen; a frosted panel floats on the left
 *   (brand, search, history/favourites) and the place card floats on the right.
 * Smaller screens: the panel uses `display: contents`, so its parts stack around
 *   the map in this order: header, search, map (+ card), lists.
 */
export function App() {
  const historyCount = useAppSelector(selectHistoryCount)
  const favouriteCount = useAppSelector(selectFavouriteCount)
  const [tab, setTab] = useState<PanelTab>('history')

  return (
    <div className="relative flex min-h-dvh flex-col bg-page lg:block lg:h-dvh lg:overflow-hidden">
      <section aria-label="Map" className="relative order-3 flex flex-col lg:absolute lg:inset-0">
        <div className="relative h-[55vh] lg:h-full">
          <GooglePlaceMap />
        </div>
        <PlaceCard />
      </section>

      <aside
        aria-label="Search panel"
        className="contents lg:absolute lg:top-4 lg:bottom-10 lg:left-4 lg:z-20 lg:flex lg:w-sidebar lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/70 lg:shadow-2xl lg:shadow-ink/20 lg:glass"
      >
        <header className="brand-gradient order-1 flex shrink-0 items-center gap-3 px-4 py-3 text-app-on-primary lg:px-5 lg:py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/45 ring-1 ring-black/10 backdrop-blur-sm">
            <MapPinned aria-hidden className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-title leading-tight font-bold">Place Finder</h1>
            <p className="text-label text-app-on-primary/70">Search · remember · favourite</p>
          </div>
          <button
            type="button"
            onClick={() => setTab('favourites')}
            aria-label={`${favouriteCount} favourites. Show favourites`}
            className="flex items-center gap-1.5 rounded-full bg-app-dark px-3 py-1.5 font-semibold text-app-primary shadow-sm transition hover:bg-black"
          >
            <Star aria-hidden className="size-4 fill-app-primary text-app-primary" />
            {favouriteCount}
          </button>
        </header>

        <section
          aria-labelledby="find-heading"
          className="relative z-30 order-2 bg-white px-4 pt-4 pb-4 lg:bg-transparent lg:px-5"
        >
          <GoogleKeyBanner />
          <h2
            id="find-heading"
            className="mb-2 text-section font-semibold tracking-[0.04em] text-muted uppercase"
          >
            Find a place
          </h2>
          <GoogleSearchBox />
        </section>

        <section
          aria-label="Searches and favourites"
          className="order-4 flex min-h-90 flex-col border-t border-line bg-white pt-3 lg:min-h-0 lg:flex-1 lg:bg-transparent"
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
      </aside>

      <Toaster />
    </div>
  )
}
