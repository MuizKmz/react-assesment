import clsx from 'clsx'
import {
  BedDouble,
  GraduationCap,
  HeartPulse,
  Landmark,
  Map,
  MapPin,
  Plane,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { categoryOf, type PlaceCategory } from '@/shared/utils/placeCategory'

const ICONS: Record<PlaceCategory, LucideIcon> = {
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  nature: Trees,
  landmark: Landmark,
  transport: Plane,
  stay: BedDouble,
  education: GraduationCap,
  health: HeartPulse,
  area: Map,
  place: MapPin,
}

const sizes = {
  sm: { tile: 'size-7 rounded-lg', icon: 'size-3.5' },
  md: { tile: 'size-8 rounded-lg', icon: 'size-4' },
  lg: { tile: 'size-11 rounded-xl', icon: 'size-5' },
}

const variants = {
  /** Light gold tile (lists) */
  soft: 'bg-app-light text-app-ink',
  /** Filled gold tile (highlighted row, place card) */
  solid: 'bg-app-primary text-app-on-primary',
}

interface CategoryIconProps {
  types: string[]
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  className?: string
}

/** A rounded tile with an icon for the kind of place (mall, park, airport…). */
export function CategoryIcon({
  types,
  size = 'md',
  variant = 'soft',
  className,
}: CategoryIconProps) {
  const Icon = ICONS[categoryOf(types)]
  return (
    <span
      aria-hidden
      className={clsx(
        'flex shrink-0 items-center justify-center transition-colors',
        sizes[size].tile,
        variants[variant],
        className,
      )}
    >
      <Icon className={sizes[size].icon} />
    </span>
  )
}
