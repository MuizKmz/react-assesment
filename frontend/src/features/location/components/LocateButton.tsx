import { ControlPosition, MapControl } from '@vis.gl/react-google-maps'
import clsx from 'clsx'
import { LocateFixed } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Spinner } from '@/shared/components/Spinner'
import { selectLocateStatus, selectUserPosition } from '../selectors'
import { locateRequested } from '../slice'

/** "Locate me" button, placed in Google's own control stack so it lines up with zoom. */
export function LocateButton() {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectLocateStatus)
  const located = useAppSelector(selectUserPosition) !== null
  const loading = status === 'loading'

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <button
        type="button"
        onClick={() => dispatch(locateRequested())}
        disabled={loading}
        aria-label="Show my location"
        title="Show my location"
        className={clsx(
          'm-2.5 flex size-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 hover:shadow-lg',
          located ? 'text-[#1A73E8]' : 'text-muted hover:text-ink',
        )}
      >
        {loading ? <Spinner label="Finding your location" /> : <LocateFixed className="size-5" />}
      </button>
    </MapControl>
  )
}
