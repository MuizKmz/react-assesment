import type { ComponentType, ReactNode } from 'react'
import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import clsx from 'clsx'
import { MapPinOff } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { env } from '@/config/env'
import { copy } from '@/shared/copy'
import { selectGoogleKeyRejected } from '@/features/ui/selectors'

interface Options {
  /** Shown while the Google script loads */
  skeleton: ReactNode
  /** 'inline' for small widgets (search box), 'fill' for full-size ones (map) */
  layout: 'inline' | 'fill'
}

function Unavailable({ message, layout }: { message: string; layout: Options['layout'] }) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-center gap-2 text-muted',
        layout === 'fill'
          ? 'h-full flex-col justify-center bg-page p-6 text-center'
          : 'rounded-control border border-dashed border-input-line px-3 py-2.5',
      )}
    >
      <MapPinOff aria-hidden className="size-5 shrink-0" />
      <p className={clsx(layout === 'fill' && 'max-w-sm')}>{message}</p>
    </div>
  )
}

/**
 * HOC: renders the wrapped component only once Google Maps is ready.
 * Loading, missing-key and failure states are written here once, not in every component.
 */
export function withGoogleMaps<P extends object>(Component: ComponentType<P>, options: Options) {
  function WithGoogleMaps(props: P) {
    const status = useApiLoadingStatus()
    const keyRejected = useAppSelector(selectGoogleKeyRejected)

    if (!env.googleMapsApiKey)
      return <Unavailable message={copy.missingKey} layout={options.layout} />
    if (keyRejected || status === APILoadingStatus.AUTH_FAILURE) {
      return <Unavailable message={copy.keyRejected} layout={options.layout} />
    }
    if (status === APILoadingStatus.FAILED) {
      return <Unavailable message={copy.mapsLoadFailed} layout={options.layout} />
    }
    if (status !== APILoadingStatus.LOADED) return <>{options.skeleton}</>
    return <Component {...props} />
  }

  WithGoogleMaps.displayName = `withGoogleMaps(${Component.displayName ?? Component.name})`
  return WithGoogleMaps
}
