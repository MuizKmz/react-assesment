import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import type { FavouriteDraft, PlaceDetails } from '@/types/place'
import { selectIsFavourite, selectIsFavouritePending } from '../selectors'
import { favouriteToggleRequested } from '../slice'

/** The minimum we need to save a place as a favourite. */
export function toFavouriteDraft(place: PlaceDetails): FavouriteDraft {
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    latitude: place.location.lat,
    longitude: place.location.lng,
  }
}

/** { isFavourite, isPending, toggle } for one place. */
export function useFavourite(place: FavouriteDraft) {
  const dispatch = useAppDispatch()
  const isFavourite = useAppSelector((state) => selectIsFavourite(state, place.placeId))
  const isPending = useAppSelector((state) => selectIsFavouritePending(state, place.placeId))
  const toggle = useCallback(() => dispatch(favouriteToggleRequested(place)), [dispatch, place])
  return { isFavourite, isPending, toggle }
}
