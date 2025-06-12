import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Widget {
  id: string
  type: 'Weather' | 'Album'
  position: 'top-left' | 'top-center' | 'top-right'
           | 'center-left' | 'center' | 'center-right'
           | 'bottom-left' | 'bottom-center' | 'bottom-right'
  color?: string
}

interface WidgetsState { list: Widget[] }
const initialState: WidgetsState = { list: [] }

export const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget(state, action: PayloadAction<Omit<Widget, 'id'>>) {
      const id = Date.now().toString()
      state.list.push({ ...action.payload, id })
    },
  },
})

export const { addWidget } = widgetsSlice.actions
export default widgetsSlice.reducer
