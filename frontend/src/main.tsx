import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import { App } from '@/app/App'
import { AppProviders } from '@/app/providers'
import { store } from '@/app/store'
import { favouritesLoadRequested } from '@/features/favourites/slice'

// Load favourites once on start. If the backend is down, only the Favourites tab is affected.
store.dispatch(favouritesLoadRequested())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders store={store}>
      <App />
    </AppProviders>
  </StrictMode>,
)
