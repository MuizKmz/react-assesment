import type { LatLng } from '@/types/place'

export interface AppEnv {
  /** null when missing: the app shows a banner instead of crashing */
  googleMapsApiKey: string | null
  mapId: string
  apiBaseUrl: string
  /** Empty means worldwide */
  regionCodes: string[]
  defaultCenter: LatLng
  defaultZoom: number
}

type RawEnv = Record<string, string | boolean | undefined>

const FALLBACK_CENTER: LatLng = { lat: 3.139, lng: 101.6869 } // Kuala Lumpur
const FALLBACK_ZOOM = 12

function text(raw: RawEnv, key: string): string {
  const value = raw[key]
  return typeof value === 'string' ? value.trim() : ''
}

function parseCenter(value: string): LatLng {
  const [lat, lng] = value.split(',').map((part) => Number(part.trim()))
  const valid =
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  return valid ? { lat, lng } : FALLBACK_CENTER
}

function parseZoom(value: string): number {
  const zoom = Number(value)
  return Number.isInteger(zoom) && zoom >= 1 && zoom <= 21 ? zoom : FALLBACK_ZOOM
}

/** Reads and validates the VITE_* variables once. Pure, so it is easy to test. */
export function readEnv(raw: RawEnv): AppEnv {
  return {
    googleMapsApiKey: text(raw, 'VITE_GOOGLE_MAPS_API_KEY') || null,
    mapId: text(raw, 'VITE_GOOGLE_MAP_ID') || 'DEMO_MAP_ID',
    apiBaseUrl: (text(raw, 'VITE_API_BASE_URL') || '/api/v1').replace(/\/+$/, ''),
    regionCodes: text(raw, 'VITE_PLACES_REGION_CODES')
      .split(',')
      .map((code) => code.trim().toLowerCase())
      .filter(Boolean),
    defaultCenter: parseCenter(text(raw, 'VITE_DEFAULT_CENTER')),
    defaultZoom: parseZoom(text(raw, 'VITE_DEFAULT_ZOOM')),
  }
}

export const env: AppEnv = readEnv(import.meta.env)
