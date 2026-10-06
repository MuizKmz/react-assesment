import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createId } from '@/shared/utils/createId'

export type ToastKind = 'info' | 'error' | 'success'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

export interface UiState {
  toasts: Toast[]
  /** Google called gm_authFailure: the key is invalid or not allowed for this site */
  googleKeyRejected: boolean
}

export const initialState: UiState = { toasts: [], googleKeyRejected: false }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(input: { kind: ToastKind; message: string }) {
        return { payload: { ...input, id: createId() } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    googleKeyRejected(state) {
      state.googleKeyRejected = true
    },
  },
})

export const { toastShown, toastDismissed, googleKeyRejected } = uiSlice.actions

export default uiSlice.reducer
