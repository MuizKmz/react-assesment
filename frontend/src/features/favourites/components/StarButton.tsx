import clsx from 'clsx'
import { Star } from 'lucide-react'
import { IconButton } from '@/shared/components/IconButton'
import { copy } from '@/shared/copy'
import type { FavouriteDraft } from '@/types/place'
import { useFavourite } from '../hooks/useFavourite'

interface StarButtonProps {
  place: FavouriteDraft
  className?: string
}

/** Toggles a favourite. Filled amber when starred. */
export function StarButton({ place, className }: StarButtonProps) {
  const { isFavourite, isPending, toggle } = useFavourite(place)
  return (
    <IconButton
      label={isFavourite ? copy.removeFavourite : copy.addFavourite}
      aria-pressed={isFavourite}
      aria-busy={isPending}
      onClick={(event) => {
        event.stopPropagation()
        toggle()
      }}
      className={clsx(isPending && 'opacity-60', className)}
      icon={
        <Star
          aria-hidden
          className={clsx('size-4', isFavourite ? 'fill-star text-star' : 'text-muted')}
        />
      }
    />
  )
}
