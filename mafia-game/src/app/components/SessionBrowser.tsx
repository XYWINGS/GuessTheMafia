"use client";
import { useState, useEffect } from "react";
import { useSocket } from "../page";

interface Session {
  sessionId: string;
  playerCount: number;
  hostName: string;
}

interface SessionBrowserProps {
  onJoinSession: (sessionId: string, playerName: string) => void;
  onCreateSession: (playerName: string) => void;
}

export default function SessionBrowser({ onJoinSession, onCreateSession }: SessionBrowserProps) {
  const { socket, isConnected } = useSocket();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("get-sessions");

      socket.on("sessions-list", (sessionsList: Session[]) => {
        setSessions(sessionsList);
        setLoading(false);
      });

      return () => {
        socket.off("sessions-list");
      };
    }
  }, [socket, isConnected]);

  const refreshSessions = () => {
    if (socket && isConnected) {
      setLoading(true);
      socket.emit("get-sessions");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Connecting to server...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span className="text-sm text-green-400">Connected to server</span>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Village Game Sessions</h1>

        <div className="mb-6">
          <label className="block mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-gray-700 text-white rounded p-2 mb-4"
          />

          <div className="flex gap-4">
            <button
              onClick={() => onCreateSession(playerName)}
              disabled={!playerName.trim() || !isConnected}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
            >
              Create New Game
            </button>

            <button
              onClick={refreshSessions}
              disabled={!isConnected}
              className="px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Join Existing Game</h2>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4">No active games found</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`p-4 rounded cursor-pointer transition-colors ${
                    selectedSession === session.sessionId ? "bg-purple-700" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedSession(session.sessionId)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Host: {session.hostName}</div>
                      <div className="text-sm">ID: {session.sessionId}</div>
                    </div>
                    <div className="text-right">
                      <div>{session.playerCount}/15 players</div>
                      <div className="text-sm">Waiting...</div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => onJoinSession(selectedSession, playerName)}
                disabled={!selectedSession || !playerName.trim() || !isConnected}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 rounded mt-4 transition-colors"
              >
                Join Selected Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
