"use client";
import { useSocket } from "../page";
import { GameLobby } from "./GameLobby";
import { useState, useEffect } from "react";
import { Player } from "../configs/configs";
import { GameInterface } from "./GameInterface";
import { SessionBrowser } from "./SessionBrowser";

// GamePage Component
export function GamePage() {
  const { socket, players, gameState, isConnected } = useSocket();
  const [currentSession, setCurrentSession] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [localCurrentPlayer, setLocalCurrentPlayer] = useState<Player | null>(null);

  // Show loading state until connection is established
  useEffect(() => {
    if (socket !== null) {
      setIsLoading(false);
    }
  }, [socket]);

  const createSession = (playerName: string) => {
    if (socket && isConnected) {
      socket.once("session-created", (data: any) => {
        setCurrentSession(data.sessionId);
        setLocalCurrentPlayer(data.player);
      });

      socket.emit("create-session", playerName);
    } else {
      console.error("Socket is not connected");
      alert("Unable to connect to game server. Please refresh the page.");
    }
  };

  const joinSession = (sessionId: string, playerName: string) => {
    if (socket && isConnected) {
      console.log("Joining session:", sessionId, "with player:", playerName);

      // Set up the listener first
      socket.once("session-joined", (data: any) => {
        setCurrentSession(data.sessionId);
        setLocalCurrentPlayer(data.player);
      });

      // Then emit the event
      socket.emit("join-session", { sessionId, playerName });
    } else {
      console.error("Socket is not connected");
      alert("Unable to connect to game server. Please refresh the page.");
    }
  };

  const startGame = () => {
    if (socket && currentSession && isConnected) {
      socket.emit("start-game", currentSession);
    } else {
      console.error("Socket is not connected or no session");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("error", (data: any) => {
        alert(data.message);
      });

      return () => {
        socket.off("error");
        socket.off("session-created");
        socket.off("session-joined");
      };
    }
  }, [socket]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Connecting to game server...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show connection error if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Connection Error</h1>
          <p className="mb-4">Unable to connect to the game server.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return <SessionBrowser onCreateSession={createSession} onJoinSession={joinSession} />;
  }

  if (!localCurrentPlayer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Joining game session...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-purple-400">Guess the Demon</h1>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
            <div className="text-sm bg-gray-800 px-3 py-1 rounded">Session: {currentSession.slice(0, 8)}...</div>
          </div>
        </div>

        {gameState === "lobby" ? (
          <GameLobby players={players} onStartGame={startGame} currentPlayer={localCurrentPlayer} />
        ) : (
          <GameInterface />
        )}
      </main>
    </div>
  );
}
