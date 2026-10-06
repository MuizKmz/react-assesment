import type { ReactNode } from 'react'
import type { AsyncStatus } from '@/types/async'
import { copy } from '@/shared/copy'
import { Banner } from './Banner'
import { Button } from './Button'
import { Spinner } from './Spinner'

interface AsyncViewProps<T> {
  status: AsyncStatus
  data: T
  error?: string | null
  onRetry?: () => void
  isEmpty?: (data: T) => boolean
  renderLoading?: () => ReactNode
  renderEmpty?: () => ReactNode
  /** Render prop: how to show the data once it is there */
  children: (data: T) => ReactNode
}

const defaultIsEmpty = (data: unknown) => Array.isArray(data) && data.length === 0

/**
 * Render-props component: one place that decides between loading, error, empty and data.
 * The caller only says how each state looks.
 */
export function AsyncView<T>({
  status,
  data,
  error,
  onRetry,
  isEmpty = defaultIsEmpty,
  renderLoading = () => (
    <div className="flex justify-center py-10">
      <Spinner />
    </div>
  ),
  renderEmpty = () => null,
  children,
}: AsyncViewProps<T>) {
  const empty = isEmpty(data)

  if (status === 'failed') {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Banner
          kind="error"
          action={
            onRetry && (
              <Button size="sm" onClick={onRetry}>
                {copy.retry}
              </Button>
            )
          }
        >
          {error}
        </Banner>
        {!empty && children(data)}
      </div>
    )
  }
  if ((status === 'loading' || status === 'idle') && empty) return renderLoading()
  if (empty) return renderEmpty()
  return children(data)
}
