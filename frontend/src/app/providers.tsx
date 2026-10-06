import { useEffect, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { APIProvider } from '@vis.gl/react-google-maps'
import { env } from '@/config/env'
import { onGoogleAuthFailure } from '@/services/google/authFailure'
import { googleKeyRejected } from '@/features/ui/slice'
import { useAppDispatch } from './hooks'
import type { AppStore } from './store'

/** Loads the Google Maps script once. Without a key we skip it and the UI shows a banner. */
function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => onGoogleAuthFailure(() => dispatch(googleKeyRejected())), [dispatch])

  if (!env.googleMapsApiKey) return <>{children}</>
  return (
    <APIProvider apiKey={env.googleMapsApiKey} libraries={['places', 'marker']} language="en">
      {children}
    </APIProvider>
  )
}

export function AppProviders({ store, children }: { store: AppStore; children: ReactNode }) {
  return (
    <Provider store={store}>
      <GoogleMapsProvider>{children}</GoogleMapsProvider>
    </Provider>
  )
}
