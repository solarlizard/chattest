import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { MessageModel } from '../../generated/shared'


export interface ChatState {
    messages : MessageModel []
}

const initialState: ChatState = {
    messages : []
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<MessageModel>) => {
      
      state.messages.push (action.payload)
    }
  },
})

// Action creators are generated for each case reducer function
export const { add } = chatSlice.actions

export const reducer = chatSlice.reducer

export const store = configureStore({
  reducer: {
    chat: chatSlice.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
