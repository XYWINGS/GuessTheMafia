"use client";
import { SnackbarProvider } from "notistack";
import GamePage from "./pages/GamePage";
import { useState, useEffect, useContext, createContext } from "react";
import { io, Socket } from "socket.io-client";
import { Player, GameState } from "./configs/configs";

interface SocketContextType {
  socket: Socket | null;
  players: Player[];
  gameState: GameState;
  currentPlayer: Player | null;
  timeOfDay: "day" | "night";
  dayCount: number;
  chatMessages: any[];
  isConnected: boolean;
}

// Create the context with proper default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  players: [],
  gameState: "lobby",
  currentPlayer: null,
  timeOfDay: "day",
  dayCount: 1,
  chatMessages: [],
  isConnected: false,
});

export default function MainPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day");
  const [dayCount, setDayCount] = useState(1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: true,
      reconnection: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("Connected to server via connection");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Listen for game updates
    newSocket.on("game-state-update", (data: any) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setTimeOfDay(data.timeOfDay);
      setDayCount(data.dayCount);
      setIsConnected(true);
      setChatMessages(data.chatMessages || []);
    });

    newSocket.on("session-joined", (player: Player) => {
      console.log("Assigned current player:", player);
      setCurrentPlayer(player);
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
          timeOfDay,
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
