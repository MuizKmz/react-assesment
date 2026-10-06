import { useAppSelector } from '@/app/hooks'
import { env } from '@/config/env'
import { Banner } from '@/shared/components/Banner'
import { copy } from '@/shared/copy'
import { selectGoogleKeyRejected } from '../selectors'

/** App-wide banner when the Google key is missing or rejected. */
export function GoogleKeyBanner() {
  const rejected = useAppSelector(selectGoogleKeyRejected)
  if (env.googleMapsApiKey && !rejected) return null
  return (
    <Banner kind={rejected ? 'error' : 'warning'} className="mx-4 mt-3 lg:mx-6">
      {rejected ? copy.keyRejected : copy.missingKey}
    </Banner>
  )
}
