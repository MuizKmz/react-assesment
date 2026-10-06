/**
 * Groups Google's many place types into a few categories we can draw an icon for.
 * Pure data, so the mapping is easy to test and to extend.
 */
export type PlaceCategory =
  | 'food'
  | 'shopping'
  | 'nature'
  | 'landmark'
  | 'transport'
  | 'stay'
  | 'education'
  | 'health'
  | 'area'
  | 'place'

const CATEGORY_BY_TYPE: Record<string, PlaceCategory> = {}

const groups: Array<[PlaceCategory, string[]]> = [
  ['food', ['restaurant', 'cafe', 'coffee_shop', 'bakery', 'bar', 'food', 'meal_takeaway', 'fast_food_restaurant']],
  ['shopping', ['shopping_mall', 'store', 'supermarket', 'department_store', 'clothing_store', 'market', 'convenience_store']],
  ['nature', ['park', 'natural_feature', 'national_park', 'beach', 'hiking_area', 'garden', 'zoo', 'botanical_garden']],
  ['landmark', ['tourist_attraction', 'museum', 'place_of_worship', 'mosque', 'church', 'hindu_temple', 'historical_landmark', 'monument', 'amusement_park', 'stadium']],
  ['transport', ['airport', 'train_station', 'transit_station', 'subway_station', 'bus_station', 'light_rail_station', 'ferry_terminal']],
  ['stay', ['lodging', 'hotel', 'resort_hotel', 'hostel']],
  ['education', ['university', 'school', 'secondary_school', 'primary_school', 'library']],
  ['health', ['hospital', 'doctor', 'pharmacy', 'dentist', 'medical_lab']],
  ['area', ['locality', 'sublocality', 'neighborhood', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'postal_code', 'route', 'street_address', 'political', 'geocode']],
]
for (const [category, types] of groups) {
  for (const type of types) CATEGORY_BY_TYPE[type] = category
}

/** Types that say nothing useful on their own. */
const GENERIC_TYPES = new Set(['point_of_interest', 'establishment', 'premise', 'political', 'geocode'])

/** First recognised type wins; Google lists the most specific type first. */
export function categoryOf(types: string[]): PlaceCategory {
  for (const type of types) {
    const category = CATEGORY_BY_TYPE[type]
    if (category) return category
  }
  return 'place'
}

/** "shopping_mall" -> "Shopping mall"; null when there is nothing worth showing. */
export function typeLabel(types: string[]): string | null {
  const type = types.find((t) => !GENERIC_TYPES.has(t))
  if (!type) return null
  const words = type.replace(/_level_\d+$/, '').replace(/_/g, ' ')
  const label = words === 'administrative area' ? 'Region' : words
  return label.charAt(0).toUpperCase() + label.slice(1)
}
