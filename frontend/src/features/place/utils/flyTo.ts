import { flightDuration, interpolateCamera, type Camera } from './camera'

/**
 * Animates the Google map to `to`, one frame at a time.
 * Returns a cancel function; dragging the map also cancels, so the user stays in control.
 */
export function flyTo(map: google.maps.Map, to: Camera): () => void {
  const center = map.getCenter()
  const zoom = map.getZoom()
  if (!center || zoom === undefined) {
    map.moveCamera({ center: { lat: to.lat, lng: to.lng }, zoom: to.zoom })
    return () => {}
  }

  const from: Camera = { lat: center.lat(), lng: center.lng(), zoom }
  const duration = flightDuration(from, to)
  const start = performance.now()
  let frame = 0

  const stop = () => {
    cancelAnimationFrame(frame)
    dragListener.remove()
  }
  const dragListener = map.addListener('dragstart', stop)

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const camera = interpolateCamera(from, to, t)
    map.moveCamera({ center: { lat: camera.lat, lng: camera.lng }, zoom: camera.zoom })
    if (t < 1) frame = requestAnimationFrame(step)
    else dragListener.remove()
  }
  frame = requestAnimationFrame(step)

  return stop
}
