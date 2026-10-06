import type { Bounds, LatLng } from '@/types/place'

/**
 * Pure Web Mercator camera maths for the "fly-to" animation.
 * No Google objects here, so every function is unit-tested.
 */

export interface Camera extends LatLng {
  zoom: number
}

const TILE_SIZE = 256
const MIN_ZOOM = 2
const MAX_ZOOM = 18
/** While travelling, zoom out until start and end both fit in this many px. */
const OVERVIEW_PX = 520

export const MIN_FLIGHT_MS = 900
export const MAX_FLIGHT_MS = 3200

/**
 * Timeline of a long flight (fractions of the total time). The phases overlap a little
 * so the motion never stops:
 *   0.00 ─ zoom out ─ 0.35
 *          0.20 ─────── glide across ─────── 0.80
 *                                      0.60 ─ zoom in ─ 1.00
 * The map only travels while zoomed out, where tiles are large and load quickly,
 * so no blank (unloaded) areas flash past at street level.
 */
const ZOOM_OUT_END = 0.35
const GLIDE_START = 0.2
const GLIDE_END = 0.8
const ZOOM_IN_START = 0.6

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
/** Gentler than cubic: used for the short glide so it feels calm, not snappy. */
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
/** Progress of a phase that runs from `start` to `end` of the timeline, eased. */
const phase = (t: number, start: number, end: number) =>
  easeInOutCubic(clamp((t - start) / (end - start), 0, 1))

/** lat/lng -> world pixels at zoom 0 */
export function project({ lat, lng }: LatLng): { x: number; y: number } {
  const sin = clamp(Math.sin((lat * Math.PI) / 180), -0.9999, 0.9999)
  return {
    x: ((lng + 180) / 360) * TILE_SIZE,
    y: TILE_SIZE * (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)),
  }
}

export function unproject(x: number, y: number): LatLng {
  const n = Math.PI - (2 * Math.PI * y) / TILE_SIZE
  return {
    lat: (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
    lng: (x / TILE_SIZE) * 360 - 180,
  }
}

/** The zoom at which `bounds` fills a `width` x `height` px box. */
export function zoomForBounds(bounds: Bounds, width: number, height: number): number {
  const ne = project({ lat: bounds.north, lng: bounds.east })
  const sw = project({ lat: bounds.south, lng: bounds.west })
  let dx = ne.x - sw.x
  if (dx < 0) dx += TILE_SIZE // crosses 180°
  const dy = sw.y - ne.y
  if (dx <= 0 || dy <= 0 || width <= 0 || height <= 0) return MAX_ZOOM
  return clamp(Math.log2(Math.min(width / dx, height / dy)), MIN_ZOOM, MAX_ZOOM)
}

/**
 * The map centre that puts `point` at (dx, dy) px from the middle of the map.
 * Used so the place lands in the middle of the *visible* map, not under a floating panel.
 */
export function offsetCenter(point: LatLng, zoom: number, dx: number, dy: number): LatLng {
  const scale = 2 ** zoom
  const p = project(point)
  return unproject(p.x - dx / scale, p.y - dy / scale)
}

/** Shortest way round: from 170° to -170° is 20°, not 340°. */
function lngDelta(from: number, to: number): number {
  let delta = to - from
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta
}

/**
 * Camera at time t (0..1). Position eases in and out; zoom follows a curve that pulls
 * out far enough to see both ends, then dives in. Near places get a plain glide.
 */
function wrapLng(lng: number): number {
  if (lng > 180) return lng - 360
  if (lng < -180) return lng + 360
  return lng
}

/** The zoom at which start and end both fit in OVERVIEW_PX. */
function overviewZoom(from: Camera, to: Camera): number {
  const distance = Math.hypot(to.lat - from.lat, lngDelta(from.lng, to.lng))
  return Math.log2((OVERVIEW_PX * 360) / (TILE_SIZE * Math.max(distance, 1e-9)))
}

/** Far apart = the destination is not on screen at the lower of the two zooms. */
export function isLongFlight(from: Camera, to: Camera): boolean {
  return overviewZoom(from, to) < Math.min(from.zoom, to.zoom)
}

/**
 * Camera at time t (0..1).
 * Near places: one calm glide, position and zoom together.
 * Far places: zoom out, glide across while zoomed out, zoom in (see the timeline above).
 */
export function interpolateCamera(from: Camera, to: Camera, t: number): Camera {
  t = clamp(t, 0, 1)
  const dLng = lngDelta(from.lng, to.lng)

  if (!isLongFlight(from, to)) {
    const e = easeInOutSine(t)
    return {
      lat: lerp(from.lat, to.lat, e),
      lng: wrapLng(from.lng + dLng * e),
      zoom: lerp(from.zoom, to.zoom, e),
    }
  }

  const peak = clamp(overviewZoom(from, to), MIN_ZOOM, Math.min(from.zoom, to.zoom))
  const glide = phase(t, GLIDE_START, GLIDE_END)
  const zoom =
    t <= ZOOM_OUT_END
      ? lerp(from.zoom, peak, phase(t, 0, ZOOM_OUT_END))
      : t < ZOOM_IN_START
        ? peak
        : lerp(peak, to.zoom, phase(t, ZOOM_IN_START, 1))

  return {
    lat: lerp(from.lat, to.lat, glide),
    lng: wrapLng(from.lng + dLng * glide),
    zoom,
  }
}

/** Longer trips take longer, within calm limits. */
export function flightDuration(from: Camera, to: Camera): number {
  if (!isLongFlight(from, to)) {
    return clamp(900 + Math.abs(to.zoom - from.zoom) * 120, MIN_FLIGHT_MS, 1400)
  }
  const peak = clamp(overviewZoom(from, to), MIN_ZOOM, Math.min(from.zoom, to.zoom))
  const zoomTravel = from.zoom - peak + (to.zoom - peak)
  return clamp(1600 + zoomTravel * 130, 2000, MAX_FLIGHT_MS)
}
