import { Socket } from "socket.io-client";

export const BASE_URL = "https://guess-the-demon-backend-git-main-xywingss-projects.vercel.app";


export type KilledBy = "demons" | "vampire" | "villagers" | null;

export enum GameState {
  PRE_LOBBY = "pre-lobby",
  PLAYING = "playing",
  LOBBY = "lobby",
  ENDED = "ended",
}

export enum GamePhase {
  DAY = "day",
  DEMONS = "demons",
  DOCTOR = "doctor",
  INSPECTOR = "inspector",
}

export enum Role {
  VILLAGER = "villager",
  DEMON = "demon",
  DEMON_LEADER = "demonLeader",
  DOCTOR = "doctor",
  INSPECTOR = "inspector",
}

export interface Session {
  sessionId: string;
  playerCount: number;
  hostName: string;
}
export interface NightPhaseProps {
  onAction: (targetId: string, actionType: string) => void;
}

export interface SessionBrowserProps {
  onJoinSession: (sessionId: string, playerName: string) => void;
  onCreateSession: (playerName: string) => void;
}

export interface GameLobbyProps {
  players: Player[];
  onStartGame: () => void;
  currentPlayer: Player;
}

export type CurrentPlayerState = {
  sessionId: string;
  player: Player;
};

export type GamePhaseState = {
  phase: GamePhase;
  duration: number;
};

export interface DayPhaseProps {
  onVote: (targetId: string, targetName: string) => void;
  onSendMessage: (message: string) => void;
}

export interface GamePageProps {
  createSession: (targetId: string, targetName: string) => void;
  onSendMessage: (message: string) => void;
  onJoinSession: (sessionId: string, playerName: string) => void;
  onCreateSession: (playerName: string) => void;
  onStartGame: () => void;
  onVote: (targetId: string, targetName: string) => void;
  onAction: (targetId: string, actionType: string) => void;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isHost: boolean;
  isAlive: boolean;
  voteCount?: number;
}

export interface SocketContextType {
  socket: Socket | null;
  players: Player[];
  sessions: Session[];
  gameState: GameState;
  currentPlayer: CurrentPlayerState | null;
  gamePhase: GamePhaseState;
  dayCount: number;
  chatMessages: any[];
  isConnected: boolean;
  investigationResult: InvestigationResult | null;
  setInvestigationResult: (result: InvestigationResult | null) => void;
  winningParty: Role | null;
}

export type InvestigationResult = {
  inspectorId: string;
  targetId: string;
  targetName: string;
  result: string;
};
