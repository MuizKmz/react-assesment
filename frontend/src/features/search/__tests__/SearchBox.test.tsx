import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as placesService from '@/services/google/placesService'
import { copy } from '@/shared/copy'
import { klccSuggestion, pavilionPlace, pavilionSuggestion } from '@/test/fixtures'
import { renderWithStore } from '@/test/renderWithStore'
import { PlaceCard } from '@/features/place/components/PlaceCard'
import { SearchBox } from '../components/SearchBox'

vi.mock('@/services/google/placesService')
vi.mock('@/services/api/favouritesApi')
const fetchSuggestions = vi.mocked(placesService.fetchSuggestions)
const getPlaceDetails = vi.mocked(placesService.getPlaceDetails)

function renderSearch() {
  return renderWithStore(
    <>
      <SearchBox />
      <PlaceCard />
    </>,
  )
}

describe('SearchBox', () => {
  afterEach(() => vi.resetAllMocks())

  it('type → ↓ → Enter shows the place card', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion, klccSuggestion])
    getPlaceDetails.mockResolvedValue(pavilionPlace)
    const { user, store } = renderSearch()

    const input = screen.getByRole('combobox')
    await user.type(input, 'pavi')
    expect(await screen.findAllByRole('option')).toHaveLength(2)
    expect(input.getAttribute('aria-expanded')).toBe('true')

    await user.keyboard('{ArrowDown}')
    const [first] = screen.getAllByRole('option')
    expect(first.getAttribute('aria-selected')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id)

    await user.keyboard('{Enter}')

    expect(await screen.findByRole('heading', { name: 'Pavilion Kuala Lumpur' })).toBeTruthy()
    expect(getPlaceDetails).toHaveBeenCalledWith('place-pavilion')
    expect((input as HTMLInputElement).value).toBe('Pavilion Kuala Lumpur')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(input)
    expect(store.getState().history.entries[0]).toMatchObject({ query: 'pavi', status: 'found' })
  })

  it('bolds the matched part of the name', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion])
    const { user } = renderSearch()

    await user.type(screen.getByRole('combobox'), 'pavi')
    await screen.findByRole('option')
    expect(screen.getByText('Pavi').tagName).toBe('STRONG')
  })

  it('↑ wraps to the last suggestion', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion, klccSuggestion])
    const { user } = renderSearch()

    await user.type(screen.getByRole('combobox'), 'pa')
    await screen.findAllByRole('option')
    await user.keyboard('{ArrowUp}')

    expect(screen.getAllByRole('option')[1].getAttribute('aria-selected')).toBe('true')
  })

  it('Esc closes first, then clears', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion])
    const { user } = renderSearch()
    const input = screen.getByRole('combobox') as HTMLInputElement

    await user.type(input, 'pavi')
    await screen.findByRole('option')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input.value).toBe('pavi')

    await user.keyboard('{Escape}')
    expect(input.value).toBe('')
  })

  it('Enter with no match shows the message and records the attempt', async () => {
    fetchSuggestions.mockResolvedValue([])
    const { user, store } = renderSearch()

    await user.type(screen.getByRole('combobox'), 'asdfgh{Enter}')

    expect(await screen.findByText(copy.noSuggestions('asdfgh'))).toBeTruthy()
    expect(store.getState().history.entries[0]).toMatchObject({ status: 'no-results' })
  })

  it('shows Retry when Google fails', async () => {
    fetchSuggestions
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([pavilionSuggestion])
    const { user } = renderSearch()

    await user.type(screen.getByRole('combobox'), 'pavi')
    await user.click(await screen.findByRole('button', { name: copy.retry }))

    expect(await screen.findByRole('option')).toBeTruthy()
  })

  it('shows category and distance on each suggestion', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion])
    const { user } = renderSearch()

    await user.type(screen.getByRole('combobox'), 'pavi')
    const option = await screen.findByRole('option')
    expect(option.textContent).toContain('2.4 km')
  })

  it('a "Try" chip runs the whole search in one click', async () => {
    fetchSuggestions.mockResolvedValue([pavilionSuggestion])
    getPlaceDetails.mockResolvedValue(pavilionPlace)
    const { user, store } = renderSearch()

    await user.click(screen.getByRole('button', { name: 'Batu Caves' }))

    expect(await screen.findByRole('heading', { name: 'Pavilion Kuala Lumpur' })).toBeTruthy()
    expect(store.getState().history.entries[0]).toMatchObject({ query: 'Batu Caves' })
  })

  it('"/" focuses the search box from anywhere', async () => {
    const { user } = renderSearch()
    const input = screen.getByRole('combobox')
    expect(document.activeElement).not.toBe(input)

    await user.keyboard('/')
    expect(document.activeElement).toBe(input)
    expect((input as HTMLInputElement).value).toBe('')
  })
})
