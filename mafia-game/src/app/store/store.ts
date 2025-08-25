import roomReducer from "../slices/roomSlice";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../slices/playerSlice";

export const store = configureStore({
  reducer: {
    room: roomReducer,
    player: playerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
