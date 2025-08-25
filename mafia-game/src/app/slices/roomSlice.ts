import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Player {
  _id: string;
  name: string;
  role: string;
  alive: boolean;
}

interface RoomState {
  code: string | null;
  phase: "lobby" | "day" | "night" | "ended";
  players: Player[];
  status: "idle" | "loading" | "failed";
}

const initialState: RoomState = {
  code: null,
  phase: "lobby",
  players: [],
  status: "idle",
};

// --- Async Thunks for API calls ---
export const fetchRoom = createAsyncThunk("room/fetchRoom", async (code: string) => {
  const res = await fetch(`/api/rooms/${code}`);
  return await res.json();
});

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomCode: (state, action) => {
      state.code = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoom.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.status = "idle";
        state.players = action.payload.players;
        state.phase = action.payload.phase;
      })
      .addCase(fetchRoom.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setRoomCode } = roomSlice.actions;
export default roomSlice.reducer;
