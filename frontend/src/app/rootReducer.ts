import { combineReducers } from '@reduxjs/toolkit'
import search from '@/features/search/slice'
import place from '@/features/place/slice'
import history from '@/features/history/slice'
import favourites from '@/features/favourites/slice'
import ui from '@/features/ui/slice'

export const rootReducer = combineReducers({ search, place, history, favourites, ui })

export type RootState = ReturnType<typeof rootReducer>
