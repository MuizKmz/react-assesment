import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { useAppSelector } from '@/app/hooks'
import { selectUserPosition } from '../selectors'

/** The familiar blue "you are here" dot with a soft pulse. */
export function UserLocationMarker() {
  const position = useAppSelector(selectUserPosition)
  if (!position) return null
  return (
    <AdvancedMarker position={position} title="You are here" zIndex={5}>
      <span className="pf-me" aria-hidden>
        <span className="pf-me-pulse" />
        <span className="pf-me-dot" />
      </span>
    </AdvancedMarker>
  )
}
