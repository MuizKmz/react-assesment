import { describe, expect, it } from 'vitest'
import { boundsCenter, distanceMeters, formatDistance } from '@/shared/utils/geo'
import { buildDirectionsUrl } from '@/shared/utils/googleMapsUrl'
import { categoryOf, typeLabel } from '@/shared/utils/placeCategory'

describe('place categories', () => {
  it('uses the first recognised type', () => {
    expect(categoryOf(['shopping_mall', 'point_of_interest'])).toBe('shopping')
    expect(categoryOf(['point_of_interest', 'airport'])).toBe('transport')
    expect(categoryOf(['administrative_area_level_1', 'political'])).toBe('area')
  })

  it('falls back to a generic place', () => {
    expect(categoryOf([])).toBe('place')
    expect(categoryOf(['something_new'])).toBe('place')
  })

  it('makes a readable label and skips generic types', () => {
    expect(typeLabel(['shopping_mall', 'establishment'])).toBe('Shopping mall')
    expect(typeLabel(['point_of_interest', 'tourist_attraction'])).toBe('Tourist attraction')
    expect(typeLabel(['administrative_area_level_1'])).toBe('Region')
    expect(typeLabel(['point_of_interest', 'establishment'])).toBeNull()
  })
})

describe('geo helpers', () => {
  it('measures great-circle distance', () => {
    // KLCC to KL Sentral is about 4.4 km.
    const d = distanceMeters({ lat: 3.1579, lng: 101.7116 }, { lat: 3.1342, lng: 101.6863 })
    expect(d).toBeGreaterThan(3800)
    expect(d).toBeLessThan(4200)
  })

  it('formats distances for people', () => {
    expect(formatDistance(843)).toBe('840 m')
    expect(formatDistance(3240)).toBe('3.2 km')
    expect(formatDistance(42_400)).toBe('42 km')
  })

  it('finds the centre of bounds, even across 180°', () => {
    expect(boundsCenter({ north: 2, south: 0, east: 4, west: 2 })).toEqual({ lat: 1, lng: 3 })
    expect(boundsCenter({ north: 1, south: -1, east: -170, west: 170 }).lng).toBeCloseTo(180, 6)
  })

  it('builds a Google Maps directions link', () => {
    const url = new URL(buildDirectionsUrl('ChIJ1', 3.149, 101.7133))
    expect(url.pathname).toBe('/maps/dir/')
    expect(url.searchParams.get('destination')).toBe('3.149,101.7133')
    expect(url.searchParams.get('destination_place_id')).toBe('ChIJ1')
  })
})
