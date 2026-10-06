export const APP_TIME_ZONE = 'Asia/Kuala_Lumpur'

const dayKey = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dayMonth = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  day: 'numeric',
  month: 'short',
})

const time = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/**
 * "6 Oct, 10:05 AM", or "Today, 10:05 AM" when the date is today in Kuala Lumpur.
 * `now` is a parameter so tests are deterministic.
 */
export function formatDateTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = dayKey.format(date) === dayKey.format(now) ? 'Today' : dayMonth.format(date)
  // Newer ICU versions put a narrow no-break space before AM/PM; normalise to a plain space.
  return `${day}, ${time.format(date).replace(/\s/g, ' ')}`
}

/** "3.1490, 101.7133" */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
