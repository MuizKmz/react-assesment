import { describe, expect, it } from 'vitest'
import {
  flightDuration,
  interpolateCamera,
  isLongFlight,
  MAX_FLIGHT_MS,
  MIN_FLIGHT_MS,
  offsetCenter,
  project,
  unproject,
  zoomForBounds,
  type Camera,
} from '../utils/camera'

const KL: Camera = { lat: 3.139, lng: 101.6869, zoom: 12 }
const PENANG: Camera = { lat: 5.4141, lng: 100.3288, zoom: 15 }

describe('camera maths (fly-to)', () => {
  it('starts and ends exactly on the given cameras', () => {
    expect(interpolateCamera(KL, PENANG, 0)).toEqual({ lat: KL.lat, lng: KL.lng, zoom: KL.zoom })
    const end = interpolateCamera(KL, PENANG, 1)
    expect(end.lat).toBeCloseTo(PENANG.lat, 6)
    expect(end.lng).toBeCloseTo(PENANG.lng, 6)
    expect(end.zoom).toBeCloseTo(PENANG.zoom, 6)
  })

  it('zooms out mid-flight between far-apart places', () => {
    const middle = interpolateCamera(KL, PENANG, 0.5)
    expect(middle.zoom).toBeLessThan(Math.min(KL.zoom, PENANG.zoom))
  })

  it('just glides (no zoom-out) for a nearby place', () => {
    const near: Camera = { lat: 3.1395, lng: 101.687, zoom: 15 }
    const zooms = [0.25, 0.5, 0.75].map((t) => interpolateCamera(KL, near, t).zoom)
    zooms.forEach((z) => expect(z).toBeGreaterThanOrEqual(KL.zoom - 1e-9))
  })

  it('takes the short way across the 180° line', () => {
    const fiji: Camera = { lat: -17, lng: 179, zoom: 8 }
    const samoa: Camera = { lat: -14, lng: -171, zoom: 8 }
    const middle = interpolateCamera(fiji, samoa, 0.5)
    expect(Math.abs(middle.lng)).toBeGreaterThan(170) // near 180°, not near 0°
  })

  it('on a long trip, only travels while zoomed out (no blank tiles at street level)', () => {
    expect(isLongFlight(KL, PENANG)).toBe(true)
    // Early on it is still zooming out on the spot…
    const early = interpolateCamera(KL, PENANG, 0.15)
    expect(early.lat).toBe(KL.lat)
    expect(early.zoom).toBeLessThan(KL.zoom)
    // …and near the end it is already above the target, just zooming in.
    const late = interpolateCamera(KL, PENANG, 0.85)
    expect(late.lat).toBeCloseTo(PENANG.lat, 9)
    expect(late.zoom).toBeLessThan(PENANG.zoom)
  })

  it('a near trip is one smooth glide', () => {
    const near: Camera = { lat: 3.1395, lng: 101.687, zoom: 15 }
    expect(isLongFlight(KL, near)).toBe(false)
    const middle = interpolateCamera(KL, near, 0.5)
    expect(middle.zoom).toBeCloseTo((KL.zoom + near.zoom) / 2, 6)
  })

  it('longer trips take longer, within calm limits', () => {
    const short = flightDuration(KL, { ...KL, lat: KL.lat + 0.001 })
    const long = flightDuration(KL, PENANG)
    expect(long).toBeGreaterThan(short)
    expect(short).toBeGreaterThanOrEqual(MIN_FLIGHT_MS)
    expect(long).toBeLessThanOrEqual(MAX_FLIGHT_MS)
  })

  it('project and unproject are inverses', () => {
    const p = project(PENANG)
    const back = unproject(p.x, p.y)
    expect(back.lat).toBeCloseTo(PENANG.lat, 9)
    expect(back.lng).toBeCloseTo(PENANG.lng, 9)
  })

  it('zoomForBounds: a smaller box needs a higher zoom', () => {
    const bounds = { north: 3.16, south: 3.14, east: 101.72, west: 101.7 }
    expect(zoomForBounds(bounds, 800, 600)).toBeGreaterThan(zoomForBounds(bounds, 200, 150))
    expect(zoomForBounds(bounds, 800, 600)).toBeCloseTo(15.2, 0)
  })

  it('offsetCenter moves the centre so the point lands at the offset', () => {
    const zoom = 15
    const center = offsetCenter(PENANG, zoom, 100, 0)
    const scale = 2 ** zoom
    // The point should be 100 px to the right of the new centre.
    expect((project(PENANG).x - project(center).x) * scale).toBeCloseTo(100, 6)
    expect(center.lat).toBeCloseTo(PENANG.lat, 9)
  })
})
