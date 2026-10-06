import { describe, expect, it } from 'vitest'
import { readEnv } from '@/config/env'
import { toPlaceDetails, toPlaceSuggestion } from '@/services/google/mappers'
import { nextListIndex } from '@/shared/hooks/useListNavigation'
import { formatCoordinates, formatDateTime } from '@/shared/utils/formatDateTime'
import { splitByMatches } from '@/shared/utils/highlight'

describe('formatDateTime (Asia/Kuala_Lumpur)', () => {
  const iso = '2026-10-06T02:05:00.000Z' // 10:05 AM in Kuala Lumpur

  it('says Today for the same KL day', () => {
    expect(formatDateTime(iso, new Date('2026-10-06T12:00:00.000Z'))).toBe('Today, 10:05 AM')
  })

  it('shows the date otherwise', () => {
    expect(formatDateTime(iso, new Date('2026-10-07T12:00:00.000Z'))).toBe('6 Oct, 10:05 AM')
  })

  it('formats coordinates with 4 decimals', () => {
    expect(formatCoordinates(3.149, 101.71329)).toBe('3.1490, 101.7133')
  })
})

describe('splitByMatches', () => {
  it('splits text around matches', () => {
    expect(splitByMatches('Pavilion KL', [{ start: 0, end: 4 }])).toEqual([
      { text: 'Pavi', match: true },
      { text: 'lion KL', match: false },
    ])
  })

  it('survives overlapping and out-of-range ranges', () => {
    expect(
      splitByMatches('abc', [
        { start: 1, end: 9 },
        { start: 0, end: 2 },
      ]),
    ).toEqual([
      { text: 'ab', match: true },
      { text: 'c', match: true },
    ])
  })
})

describe('nextListIndex', () => {
  it('wraps around with arrows', () => {
    expect(nextListIndex('ArrowDown', 2, 3)).toBe(0)
    expect(nextListIndex('ArrowUp', 0, 3)).toBe(2)
    expect(nextListIndex('ArrowDown', -1, 3)).toBe(0)
  })

  it('Home/End only work once inside the list', () => {
    expect(nextListIndex('Home', -1, 3)).toBeNull()
    expect(nextListIndex('End', 0, 3)).toBe(2)
  })

  it('ignores other keys and empty lists', () => {
    expect(nextListIndex('a', 0, 3)).toBeNull()
    expect(nextListIndex('ArrowDown', -1, 0)).toBeNull()
  })
})

describe('readEnv', () => {
  it('parses and validates values', () => {
    const env = readEnv({
      VITE_GOOGLE_MAPS_API_KEY: ' key ',
      VITE_PLACES_REGION_CODES: 'MY, sg',
      VITE_DEFAULT_CENTER: '1.5,103.7',
      VITE_DEFAULT_ZOOM: '10',
      VITE_API_BASE_URL: '/api/v1/',
    })
    expect(env).toMatchObject({
      googleMapsApiKey: 'key',
      regionCodes: ['my', 'sg'],
      defaultCenter: { lat: 1.5, lng: 103.7 },
      defaultZoom: 10,
      apiBaseUrl: '/api/v1',
      mapId: 'DEMO_MAP_ID',
    })
  })

  it('falls back safely on missing or bad values', () => {
    const env = readEnv({ VITE_DEFAULT_CENTER: 'nonsense', VITE_DEFAULT_ZOOM: '99' })
    expect(env.googleMapsApiKey).toBeNull()
    expect(env.regionCodes).toEqual([])
    expect(env.defaultCenter).toEqual({ lat: 3.139, lng: 101.6869 })
    expect(env.defaultZoom).toBe(12)
  })
})

describe('Google mappers', () => {
  it('maps a prediction to a plain suggestion', () => {
    const prediction = {
      placeId: 'p1',
      text: { text: 'Pavilion Kuala Lumpur, Jalan Bukit Bintang', matches: [] },
      mainText: { text: 'Pavilion Kuala Lumpur', matches: [{ startOffset: 0, endOffset: 4 }] },
      secondaryText: { text: 'Jalan Bukit Bintang' },
    } as unknown as google.maps.places.PlacePrediction

    expect(toPlaceSuggestion(prediction)).toEqual({
      placeId: 'p1',
      primaryText: 'Pavilion Kuala Lumpur',
      secondaryText: 'Jalan Bukit Bintang',
      primaryMatches: [{ start: 0, end: 4 }],
    })
  })

  it('maps a Place to plain details (no Google objects left)', () => {
    const place = {
      id: 'p1',
      displayName: 'Pavilion',
      formattedAddress: '168 Jalan Bukit Bintang',
      location: { lat: () => 3.149, lng: () => 101.7133 },
      viewport: { toJSON: () => ({ north: 1, south: 0, east: 1, west: 0 }) },
      googleMapsURI: 'https://maps.google.com/?cid=1',
      types: ['shopping_mall'],
    } as unknown as google.maps.places.Place

    const details = toPlaceDetails(place)
    expect(details).toEqual({
      placeId: 'p1',
      name: 'Pavilion',
      address: '168 Jalan Bukit Bintang',
      location: { lat: 3.149, lng: 101.7133 },
      viewport: { north: 1, south: 0, east: 1, west: 0 },
      googleMapsUri: 'https://maps.google.com/?cid=1',
      types: ['shopping_mall'],
    })
    // Survives JSON, so it is safe for Redux and localStorage.
    expect(JSON.parse(JSON.stringify(details))).toEqual(details)
  })

  it('returns null when Google gave no location', () => {
    expect(
      toPlaceDetails({ id: 'p1', location: null } as unknown as google.maps.places.Place),
    ).toBeNull()
  })
})
