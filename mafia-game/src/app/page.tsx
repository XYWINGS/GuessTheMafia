"use client";
import { GamePage } from "./pages/MainPage";
import { SnackbarProvider } from "notistack";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, useContext, createContext } from "react";
import { GamePhase, GameState, SocketContextType, CurrentPlayerState, GamePhaseState, Player } from "./configs/configs";

// Create the context with proper default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  players: [],
  gameState: "lobby",
  currentPlayer: null,
  gamePhase: { phase: GamePhase.DAY, duration: 0 },
  dayCount: 1,
  chatMessages: [],
  isConnected: false,
});

export default function MainPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentPlayer, setCurrentPlayer] = useState<CurrentPlayerState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhaseState>({ phase: GamePhase.DAY, duration: 0 });
  const [dayCount, setDayCount] = useState(1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<any>(null);

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
    });

    // Listen for game updates
    newSocket.on("game-state-update", (data: any) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setGamePhase(data.gamePhase);
      setDayCount(data.dayCount);
      setIsConnected(true);
      setChatMessages(data.chatMessages || []);
    });

    newSocket.on("session-joined", (player: CurrentPlayerState) => {
      setCurrentPlayer(player);
    });

    newSocket.on("session-created", (player: CurrentPlayerState) => {
      setCurrentPlayer(player);
    });

    newSocket.on("your-role", (player: CurrentPlayerState) => {
      console.log("Received your-role event:", player);
      setCurrentPlayer(player);
    });

    newSocket.on("phase-change", (data: GamePhaseState) => {
      console.log("Phase changed to:", data.phase);
      setGamePhase(data);
    });

    newSocket.on("investigation-result", (data: any) => {
      setInvestigationResult(data);
      console.log("Investigation result received:", data);
    });

    newSocket.on("chat-message", (message: any) => {
      setChatMessages((prev) => [...prev, message]);
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
          gameState,
          currentPlayer,
          gamePhase,
          dayCount,
          chatMessages,
          isConnected,
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
