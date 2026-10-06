import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { Star } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import type { Favourite } from '@/types/place'
import { favouriteFocused } from '../slice'

/** Small amber star on the map for each favourite. Click shows it in the card. */
export function FavouriteMarker({ favourite }: { favourite: Favourite }) {
  const dispatch = useAppDispatch()
  return (
    <AdvancedMarker
      position={{ lat: favourite.latitude, lng: favourite.longitude }}
      title={favourite.name}
      onClick={() => dispatch(favouriteFocused(favourite))}
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-white bg-star shadow-md">
        <Star aria-hidden className="size-3.5 fill-white text-white" />
      </span>
    </AdvancedMarker>
  )
}
