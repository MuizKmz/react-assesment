import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as placesService from '@/services/google/placesService'
import { copy } from '@/shared/copy'
import { makeEntry, pavilionPlace } from '@/test/fixtures'
import { renderWithStore } from '@/test/renderWithStore'
import { HistoryPanel } from '../components/HistoryPanel'

vi.mock('@/services/google/placesService')
vi.mock('@/services/api/favouritesApi')

describe('HistoryPanel', () => {
  afterEach(() => vi.resetAllMocks())

  it('shows the empty message', () => {
    renderWithStore(<HistoryPanel />)
    expect(screen.getByText(copy.historyEmpty)).toBeTruthy()
  })

  it('lists every attempt with the right chip', () => {
    renderWithStore(<HistoryPanel />, {
      history: {
        entries: [
          makeEntry({ id: 'a' }),
          makeEntry({ id: 'b', query: 'asdfgh', status: 'no-results', place: null }),
          makeEntry({ id: 'c', query: 'mid valley', status: 'error', place: null }),
        ],
        selectedId: null,
      },
    })

    const rows = within(screen.getByRole('list', { name: 'Search history' })).getAllByRole(
      'listitem',
    )
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByText('Pavilion Kuala Lumpur')).toBeTruthy()
    expect(within(rows[0]).getByText('Found')).toBeTruthy()
    expect(within(rows[1]).getByText('No results')).toBeTruthy()
    expect(within(rows[2]).getByText('Error')).toBeTruthy()
  })

  it('clicking a found row shows it on the map with no Google call', async () => {
    const { store, user } = renderWithStore(<HistoryPanel />, {
      history: { entries: [makeEntry({ id: 'a' })], selectedId: null },
    })

    await user.click(screen.getByRole('button', { name: 'Show Pavilion Kuala Lumpur on the map' }))

    expect(store.getState().place.selected).toEqual(pavilionPlace)
    expect(placesService.getPlaceDetails).not.toHaveBeenCalled()
    expect(placesService.fetchSuggestions).not.toHaveBeenCalled()
  })

  it('clear history asks inline first', async () => {
    const { store, user } = renderWithStore(<HistoryPanel />, {
      history: { entries: [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })], selectedId: null },
    })

    await user.click(screen.getByRole('button', { name: 'Clear history' }))
    expect(screen.getByText('Clear 2 searches?')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(store.getState().history.entries).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Clear history' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(store.getState().history.entries).toHaveLength(0)
    expect(screen.getByText(copy.historyEmpty)).toBeTruthy()
  })
})
