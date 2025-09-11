"use client";
import {
  Role,
  Player,
  Session,
  GamePhase,
  GameState,
  GamePhaseState,
  SocketContextType,
  CurrentPlayerState,
  InvestigationResult,
} from "./configs/configs";
import { GamePage } from "./pages/MainPage";
import { SnackbarProvider } from "notistack";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, useContext, createContext } from "react";

// Create the context with proper default values
const SocketContext = createContext<SocketContextType>({
  dayCount: 1,
  players: [],
  socket: null,
  sessions: [],
  chatMessages: [],
  isConnected: false,
  winningParty: null,
  currentPlayer: null,
  investigationResult: null,
  gameState: GameState.PRE_LOBBY,
  setInvestigationResult: () => {},
  gamePhase: { phase: GamePhase.DAY, duration: 0 },
});

export default function MainPage() {
  const [dayCount, setDayCount] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [winningParty, setWinningParty] = useState<Role | null>(null);
  const [investigationResult, setInvestigationResult] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.PRE_LOBBY);
  const [currentPlayer, setCurrentPlayer] = useState<CurrentPlayerState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhaseState>({ phase: GamePhase.DAY, duration: 0 });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: true,
      reconnection: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      newSocket.emit("get-sessions");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setPlayers([]);
      setGameState(GameState.PRE_LOBBY);
      setGamePhase({ phase: GamePhase.DAY, duration: 0 });
      setDayCount(0);
      setChatMessages([]);
      setWinningParty(null);
      setCurrentPlayer(null);
      setInvestigationResult(null);
    });

    // Listen for game updates
    newSocket.on("game-state-update", (data: any) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setGamePhase(data.gamePhase);
      setDayCount(data.dayCount);
      setIsConnected(true);
      setChatMessages(data.chatMessages || []);
      setWinningParty(data.winningParty);
    });

    newSocket.on("session-joined", (player: CurrentPlayerState) => {
      setCurrentPlayer(player);
    });

    newSocket.on("session-created", (player: CurrentPlayerState) => {
      setCurrentPlayer(player);
    });

    newSocket.on("your-role", (player: CurrentPlayerState) => {
      setCurrentPlayer(player);
    });

    newSocket.on("phase-change", (data: GamePhaseState) => {
      setGamePhase(data);
    });

    newSocket.on("investigation-result", (data: InvestigationResult) => {
      setInvestigationResult(data);
    });

    newSocket.on("chat-message", (message: any) => {
      setChatMessages((prev) => [...prev, message]);
    });

    newSocket.on("sessions-list", (sessionsList: Session[]) => {
      setSessions(sessionsList);
    });

    // Cleanup on unmount
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("game-state-update");
      newSocket.off("player-assigned");
      newSocket.off("chat-message");
      newSocket.close();
    };
  }, []);

  return (
    <div>
      <SocketContext.Provider
        value={{
          socket,
          players,
          dayCount,
          sessions,
          gameState,
          gamePhase,
          isConnected,
          chatMessages,
          winningParty,
          currentPlayer,
          investigationResult,
          setInvestigationResult,
        }}
      >
        <SnackbarProvider maxSnack={3} preventDuplicate>
          <GamePage />
        </SnackbarProvider>
      </SocketContext.Provider>
    </div>
  );
}

export const useSocket = () => useContext(SocketContext);
