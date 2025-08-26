import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";
import { BASE_URL, RoomState } from "../configs/configs";
import { getErrorMessage } from "../configs/utils";
import { enqueueSnackbar } from "notistack";

export const initialState: RoomState = {
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

export const createNewRoom = createAsyncThunk("room/create", async (userName: string, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/rooms/create`, {
      params: { userName: userName },
    });

    if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
      return response.data;
    } else {
      throw new Error(response.data?.error?.message || "Unexpected error occurred when creating a room.");
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to create a room.");
    enqueueSnackbar(errorMessage, { variant: "error" });

    return rejectWithValue(errorMessage);
  }
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
      //Create room
      .addCase(createNewRoom.fulfilled, (state, action) => {
        // state.players = action.payload.players;
        state.status = action.payload.status;
      })
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
