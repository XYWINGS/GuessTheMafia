"use client";
import { SnackbarProvider } from "notistack";
import { useState, useEffect, useContext, createContext } from "react";
import { io, Socket } from "socket.io-client";

// Types
export type Role = "villager" | "demon" | "demonLeader" | "doctor" | "inspector";
export type GameState = "lobby" | "playing" | "finished";

export interface Player {
  id: string;
  name: string;
  role: Role;
  isHost: boolean;
  isAlive: boolean;
  voteCount?: number;
}

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

// SessionBrowser Component
interface Session {
  sessionId: string;
  playerCount: number;
  hostName: string;
}

interface SessionBrowserProps {
  onJoinSession: (sessionId: string, playerName: string) => void;
  onCreateSession: (playerName: string) => void;
}

function SessionBrowser({ onJoinSession, onCreateSession }: SessionBrowserProps) {
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

        <h1 className="text-2xl font-bold mb-6 text-center">Game Sessions</h1>

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

// GameLobby Component
interface GameLobbyProps {
  players: Player[];
  onStartGame: () => void;
  currentPlayer: Player;
}

function GameLobby({ players, onStartGame }: GameLobbyProps) {
  console.log("Rendering GameLobby with players:", players);
  const { currentPlayer } = useSocket();
  console.log("Current player in GameLobby:", currentPlayer);

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Game Lobby</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Players ({players.length}/10)</h3>
        <ul className="bg-gray-700 rounded p-4">
          {players.map((player) => (
            <li key={player.id} className="py-2 border-b border-gray-600 last:border-0">
              {player.name} {player.isHost && "(Host)"}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={onStartGame}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          disabled={players.length < 5}
        >
          Start Game
        </button>
        {players.length < 5 && <p className="mt-2 text-yellow-400">Need at least 5 players to start</p>}
      </div>

      <div className="mt-6 bg-gray-700 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Game Rules</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Villagers must identify and eliminate all demons</li>
          <li>Demons try to eliminate villagers without being discovered</li>
          <li>Doctor can save one person each night</li>
          <li>Inspector can investigate one person each night</li>
          <li>Demon Leader appears as villager to Inspector</li>
        </ul>
      </div>
    </div>
  );
}

// DayPhase Component
interface DayPhaseProps {
  players: Player[];
  currentPlayer: Player | null;
  onVote: (targetId: string) => void;
  onSendMessage: (message: string) => void;
}

function DayPhase({ players, currentPlayer, onVote, onSendMessage }: DayPhaseProps) {
  const [message, setMessage] = useState("");
  const { chatMessages } = useSocket();

  const sendMessage = () => {
    if (message.trim() && currentPlayer) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Day Phase - Discussion</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Chat</h3>
          <div className="bg-gray-700 h-80 rounded p-4 overflow-y-auto mb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 py-10">No messages yet. Start the discussion!</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <span className="font-semibold text-purple-300">{msg.player}:</span> {msg.message}
                </div>
              ))
            )}
          </div>

          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-grow bg-gray-600 text-white rounded-l p-2"
              placeholder="Type your message..."
              disabled={!currentPlayer?.isAlive}
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-r"
              disabled={!currentPlayer?.isAlive}
            >
              Send
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Vote to Eliminate</h3>
          <div className="bg-gray-700 rounded p-4">
            {currentPlayer?.isAlive ? (
              players
                .filter((player) => player.id !== currentPlayer?.id && player.isAlive)
                .map((player) => (
                  <div key={player.id} className="flex items-center justify-between mb-2 p-2 hover:bg-gray-600 rounded">
                    <span>{player.name}</span>
                    <button
                      onClick={() => onVote(player.id)}
                      className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-400"
                    >
                      Vote
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-400 py-4">You cannot vote while dead</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// NightPhase Component
interface NightPhaseProps {
  players: Player[];
  currentPlayer: Player | null;
  onAction: (targetId: string, actionType: string) => void;
}

function NightPhase({ players, currentPlayer, onAction }: NightPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [actionCompleted, setActionCompleted] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);

  // Reset action when phase changes
  useEffect(() => {
    setActionCompleted(false);
    setSelectedPlayer("");
    setInvestigationResult(null);
  }, [players]);

  const handleAction = () => {
    if (!selectedPlayer || !currentPlayer) return;

    let actionType = "";

    switch (currentPlayer.role) {
      case "demon":
      case "demonLeader":
        actionType = "kill";
        break;
      case "doctor":
        actionType = "save";
        break;
      case "inspector":
        actionType = "investigate";
        // Simulate investigation result
        const targetPlayer = players.find((p) => p.id === selectedPlayer);
        if (targetPlayer) {
          // Demon leader appears as villager to inspector
          const apparentRole = targetPlayer.role === "demonLeader" ? "villager" : targetPlayer.role;
          setInvestigationResult(`${targetPlayer.name} is a ${apparentRole}`);
        }
        break;
      default:
        return;
    }

    onAction(selectedPlayer, actionType);
    setActionCompleted(true);
  };

  const renderRoleInstructions = () => {
    if (!currentPlayer) return null;

    switch (currentPlayer.role) {
      case "demon":
        return (
          <div className="bg-red-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-red-400">Demon - Select a player to kill</h4>
            <p className="text-sm mb-2">Discuss with other demons and decide who to eliminate tonight.</p>
            <p className="text-xs text-gray-400">The player with the most votes from demons will be killed.</p>
          </div>
        );

      case "demonLeader":
        return (
          <div className="bg-purple-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-purple-400">Demon Leader - Select a player to kill</h4>
            <p className="text-sm mb-2">You appear as a villager to the inspector. Coordinate with other demons.</p>
            <p className="text-xs text-gray-400">The player with the most votes from demons will be killed.</p>
          </div>
        );

      case "doctor":
        return (
          <div className="bg-green-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-green-400">Doctor - Select a player to save</h4>
            <p className="text-sm mb-2">Choose someone to protect from demon attacks tonight.</p>
            <p className="text-xs text-gray-400">
              You can save yourself. If you save the same person the demons attack, they will survive.
            </p>
          </div>
        );

      case "inspector":
        return (
          <div className="bg-blue-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-blue-400">Inspector - Select a player to investigate</h4>
            <p className="text-sm mb-2">Discover if this player is a demon (demon leader appears as villager).</p>
            <p className="text-xs text-gray-400">Use this information to guide the village during the day.</p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2">Night Time</h4>
            <p className="text-sm mb-2">You're a villager. Sleep tight while others take action.</p>
            <p className="text-xs text-gray-400">Wait for the night to end and discuss findings tomorrow.</p>
          </div>
        );
    }
  };

  const canPerformAction = () => {
    if (!currentPlayer) return false;

    const role = currentPlayer.role;
    return role === "demon" || role === "demonLeader" || role === "doctor" || role === "inspector";
  };

  if (!currentPlayer) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Night Phase</h2>
        <div className="text-center">Loading player information...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Night Phase - Special Actions</h2>

      {renderRoleInstructions()}

      {canPerformAction() && !actionCompleted && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select a Player</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {players
              .filter(
                (player) =>
                  // Demons can't kill other demons (except in some game variants)
                  currentPlayer.role === "demon" ||
                  currentPlayer.role === "demonLeader" ||
                  currentPlayer.role !== player.role
              )
              .map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedPlayer === player.id ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPlayer(player.id)}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                    <span>{player.name}</span>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={handleAction}
            disabled={!selectedPlayer}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            {currentPlayer.role === "inspector" ? "Investigate" : "Confirm Selection"}
          </button>
        </div>
      )}

      {actionCompleted && (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-semibold mb-2 text-green-400">Action Completed</h4>
          <p className="text-sm">
            {currentPlayer.role === "inspector"
              ? "You have completed your investigation."
              : "Your selection has been recorded. Waiting for other players..."}
          </p>

          {investigationResult && (
            <div className="mt-3 p-3 bg-blue-900/30 rounded">
              <p className="font-semibold">Investigation Result:</p>
              <p>{investigationResult}</p>
            </div>
          )}
        </div>
      )}

      {!canPerformAction() && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Waiting</h4>
          <p className="text-sm">You don't have any night actions. Wait for the night to end.</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Player Status</h3>
        <div className="bg-gray-700 rounded p-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 border-b border-gray-600 last:border-0"
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${player.isAlive ? "bg-green-400" : "bg-red-400"}`}></div>
                <span>{player.name}</span>
              </div>
              <span className="text-xs bg-gray-600 px-2 py-1 rounded capitalize">{player.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// GameInterface Component
interface GameInterfaceProps {
  players: Player[];
  currentPlayer: Player;
  timeOfDay: "day" | "night";
  dayCount: number;
  onToggleTime: () => void;
}

function GameInterface({ onToggleTime }: GameInterfaceProps) {
  const { players, currentPlayer, timeOfDay, dayCount, socket } = useSocket();

  const handleVote = (targetId: string) => {
    if (socket && currentPlayer) {
      socket.emit("vote", {
        voterId: currentPlayer.id,
        targetId,
      });
    }
  };

  const handleNightAction = (targetId: string, actionType: string) => {
    if (socket && currentPlayer) {
      socket.emit("night-action", {
        playerId: currentPlayer.id,
        targetId,
        actionType,
      });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && currentPlayer) {
      socket.emit("chat-message", {
        playerId: currentPlayer.id,
        message,
      });
    }
  };

  const alivePlayers = players.filter((player) => player.isAlive);
  const demonPlayers = players.filter(
    (player) => (player.role === "demon" || player.role === "demonLeader") && player.isAlive
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
        <div>
          <span
            className={`px-3 py-1 rounded-full ${
              timeOfDay === "day" ? "bg-yellow-500 text-black" : "bg-blue-900 text-white"
            }`}
          >
            {timeOfDay === "day" ? "☀️ Day" : "🌙 Night"} {dayCount}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm">Alive: {alivePlayers.length}</p>
          <p className="text-sm">Demons: {demonPlayers.length}</p>
        </div>

        <div>
          <span className="bg-purple-600 px-3 py-1 rounded-full capitalize">{currentPlayer?.role}</span>
        </div>
      </div>

      {timeOfDay === "day" ? (
        <DayPhase
          players={alivePlayers}
          currentPlayer={currentPlayer}
          onVote={handleVote}
          onSendMessage={sendChatMessage}
        />
      ) : (
        <NightPhase players={alivePlayers} currentPlayer={currentPlayer} onAction={handleNightAction} />
      )}

      <div className="mt-6 text-center">
        <button
          onClick={onToggleTime}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          disabled={!currentPlayer?.isHost}
        >
          {timeOfDay === "day" ? "End Day" : "End Night"}
        </button>
      </div>
    </div>
  );
}

// GamePage Component
function GamePage() {
  const { socket, players, gameState, currentPlayer, timeOfDay, dayCount, isConnected } = useSocket();
  const [currentSession, setCurrentSession] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [localCurrentPlayer, setLocalCurrentPlayer] = useState<Player | null>(null);

  // Show loading state until connection is established
  useEffect(() => {
    if (socket !== null) {
      setIsLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    console.log("currentPlayer changed:", currentPlayer);
  }, [currentPlayer]);

  const createSession = (playerName: string) => {
    if (socket && isConnected) {
      console.log("Creating session with player:", playerName);

      // Set up the listener first
      socket.once("session-created", (data: any) => {
        console.log("Session created:", data.sessionId);
        console.log("Player data in create session:", data.player);
        setCurrentSession(data.sessionId);
        setLocalCurrentPlayer(data.player);
      });

      // Then emit the event
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
        console.log("Joined session:", data.sessionId);
        console.log("Player data in join session:", data.player);
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

  const toggleTimeOfDay = () => {
    if (socket && currentSession && isConnected) {
      socket.emit("toggle-time", currentSession);
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
          <GameInterface
            players={players}
            currentPlayer={localCurrentPlayer}
            timeOfDay={timeOfDay}
            dayCount={dayCount}
            onToggleTime={toggleTimeOfDay}
          />
        )}
      </main>
    </div>
  );
}
