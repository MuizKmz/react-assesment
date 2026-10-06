import type { RootState } from '@/app/rootReducer'

export const selectToasts = (state: RootState) => state.ui.toasts
export const selectGoogleKeyRejected = (state: RootState) => state.ui.googleKeyRejected
