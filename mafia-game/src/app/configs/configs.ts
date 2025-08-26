export const BASE_URL = "http://localhost:5000";

export interface RoomState {
  code: string | null;
  phase: "lobby" | "day" | "night" | "ended";
  players: Player[];
  status: "idle" | "loading" | "failed";
}

export type PlayerRole = "villager" | "demon" | "demonLeader" | "inspector" | "doctor" | "vampire";

export type KilledBy = "demons" | "vampire" | "villagers" | null;

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role: PlayerRole;
  isAlive: boolean;
  killedBy: KilledBy;
  votes: number;
}

export type GameState = "day" | "demons" | "doctor" | "inspector" | "lobby";

export interface Room {
  code: string;
  host: string;
  players: Player[];
  numOfPlayers: number;
  gameState: GameState;
}
