import type { RootState } from '@/app/rootReducer'

export const selectUserPosition = (state: RootState) => state.location.position
export const selectLocateStatus = (state: RootState) => state.location.status
