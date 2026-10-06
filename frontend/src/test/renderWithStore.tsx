import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { setupStore, type RootState } from '@/app/store'

/** Renders with a fresh real store (real reducers + sagas). Services are mocked per test file. */
export function renderWithStore(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = setupStore(preloadedState)
  const user = userEvent.setup()
  return { store, user, ...render(<Provider store={store}>{ui}</Provider>) }
}

/** Let pending promises (and the sagas waiting on them) settle. */
export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))
