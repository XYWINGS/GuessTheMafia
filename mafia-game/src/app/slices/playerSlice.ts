import { createSlice } from "@reduxjs/toolkit";

interface PlayerState {
  id: string | null;
  name: string | null;
  role: string | null;
  alive: boolean;
}

const initialState: PlayerState = {
  id: null,
  name: null,
  role: null,
  alive: true,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayer: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.alive = action.payload.alive;
    },
    killPlayer: (state) => {
      state.alive = false;
    },
  },
});

export const { setPlayer, killPlayer } = playerSlice.actions;
export default playerSlice.reducer;
