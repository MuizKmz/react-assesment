import type { Favourite, FavouriteDraft } from '@/types/place'
import { request } from './httpClient'

/** Client for the Spring Boot favourites API (base /api/v1). */

const path = (placeId: string) => `/favourites/${encodeURIComponent(placeId)}`

export function listFavourites(): Promise<Favourite[]> {
  return request<Favourite[]>('/favourites')
}

/** Idempotent: 201 when created, 200 when it already existed. */
export function saveFavourite({ placeId, ...body }: FavouriteDraft): Promise<Favourite> {
  return request<Favourite>(path(placeId), { method: 'PUT', body: JSON.stringify(body) })
}

/** 204 even when it did not exist, so double clicks are safe. */
export function removeFavourite(placeId: string): Promise<void> {
  return request<void>(path(placeId), { method: 'DELETE' })
}
