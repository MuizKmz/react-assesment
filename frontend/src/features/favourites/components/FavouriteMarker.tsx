import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { Star } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import type { Favourite } from '@/types/place'
import { favouriteFocused } from '../slice'

/** Small amber star on the map for each favourite. Grows on hover; click shows it in the card. */
export function FavouriteMarker({ favourite }: { favourite: Favourite }) {
  const dispatch = useAppDispatch()
  return (
    <AdvancedMarker
      position={{ lat: favourite.latitude, lng: favourite.longitude }}
      title={favourite.name}
      onClick={() => dispatch(favouriteFocused(favourite))}
    >
      <span className="pf-fav flex size-7 items-center justify-center rounded-full border-2 border-app-primary bg-app-dark shadow-lg shadow-black/30">
        <Star aria-hidden className="size-3.5 fill-app-primary text-app-primary" />
      </span>
    </AdvancedMarker>
  )
}
