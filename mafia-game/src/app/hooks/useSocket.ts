"use client";
import {
  Role,
  Player,
  Session,
  GameState,
  GamePhase,
  GamePhaseState,
  CurrentPlayerState,
  BASE_URL,
} from "../configs/configs";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
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
    const newSocket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });

    setSocket(newSocket);

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

    newSocket.on("game-state-update", (data: any) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setGamePhase(data.gamePhase);
      console.log("game phase in update io", data.gamePhase);
      setDayCount(data.dayCount);
      setChatMessages(data.chatMessages || []);
      setWinningParty(data.winningParty);
    });

    newSocket.on("phase-change", setGamePhase);
    newSocket.on("sessions-list", setSessions);
    newSocket.on("your-role", setCurrentPlayer);
    newSocket.on("session-joined", setCurrentPlayer);
    newSocket.on("session-created", setCurrentPlayer);
    newSocket.on("investigation-result", setInvestigationResult);
    newSocket.on("chat-message", (msg: any) => setChatMessages((prev) => [...prev, msg]));

    newSocket.on("vote-update", (data: any) => {
      console.log("Vote update received:", data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return {
    socket,
    players,
    sessions,
    gameState,
    gamePhase,
    dayCount,
    isConnected,
    chatMessages,
    winningParty,
    currentPlayer,
    investigationResult,
    setInvestigationResult,
  };
}
