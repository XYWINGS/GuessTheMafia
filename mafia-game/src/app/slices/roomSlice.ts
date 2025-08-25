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
  inspectorResult?: string | null;
}

const initialState: RoomState = {
  code: null,
  phase: "lobby",
  players: [],
  status: "idle",
  inspectorResult: null,
};

// --- Thunks ---
export const fetchRoom = createAsyncThunk("room/fetchRoom", async (code: string) => {
  const res = await fetch(`/api/rooms/${code}`);
  return await res.json();
});

export const startGame = createAsyncThunk("room/startGame", async (code: string) => {
  const res = await fetch(`/api/game/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return await res.json();
});

export const castVote = createAsyncThunk(
  "room/castVote",
  async ({ code, voterId, targetId }: { code: string; voterId: string; targetId: string }) => {
    const res = await fetch(`/api/game/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, voterId, targetId }),
    });
    return await res.json();
  }
);

export const endPhase = createAsyncThunk("room/endPhase", async (code: string) => {
  const res = await fetch(`/api/game/end-phase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
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
      // Fetch room
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.players = action.payload.players;
        state.phase = action.payload.phase;
      })
      // Start game
      .addCase(startGame.fulfilled, (state, action) => {
        state.phase = action.payload.room.phase;
        state.players = action.payload.room.players;
      })
      // Cast vote
      .addCase(castVote.fulfilled, (state, action) => {
        // You could optionally store live votes in Redux
        console.log("Vote result:", action.payload);
      })
      // End phase
      .addCase(endPhase.fulfilled, (state, action) => {
        state.phase = action.payload.room?.phase || state.phase;
        if (action.payload.inspectorResult) {
          state.inspectorResult = action.payload.inspectorResult;
        }
      });
  },
});

export const { setRoomCode } = roomSlice.actions;
export default roomSlice.reducer;
