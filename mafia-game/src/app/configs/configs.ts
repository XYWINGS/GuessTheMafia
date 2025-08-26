export const BASE_URL = "http://localhost:5000";

export interface Player {
  _id: string;
  name: string;
  role: string;
  alive: boolean;
}

export interface RoomState {
  code: string | null;
  phase: "lobby" | "day" | "night" | "ended";
  players: Player[];
  status: "idle" | "loading" | "failed";
  inspectorResult?: string | null;
}
