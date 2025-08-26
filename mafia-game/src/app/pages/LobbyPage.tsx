'use client';
import React, { useState } from "react";

const LobbyPage = () => {
  const ROLES = {
    VILLAGER: "villager",
    DEMON: "demon",
    DEMON_LEADER: "demon_leader",
    DOCTOR: "doctor",
    INSPECTOR: "inspector",
  };

  const mockPlayers = [
    { id: "1", name: "Alice", isAlive: true, role: ROLES.VILLAGER, isReady: true },
    { id: "2", name: "Bob", isAlive: true, role: ROLES.DEMON, isReady: true },
    { id: "3", name: "Charlie", isAlive: true, role: ROLES.DOCTOR, isReady: false },
    { id: "4", name: "Diana", isAlive: true, role: ROLES.INSPECTOR, isReady: true },
    { id: "5", name: "Eve", isAlive: false, role: ROLES.VILLAGER, isReady: true },
  ];

  const [isHost] = useState(true); // Mock host status
  const roomCode = "ABC123";
  const [showRoleCard, setShowRoleCard] = useState(false);
  const currentPlayer = mockPlayers[0];

  const allPlayersReady = mockPlayers.every((p) => p.isReady);
  const minPlayers = mockPlayers.length >= 4;

  const startGame = () => {
    setShowRoleCard(true);
    setTimeout(() => {
      setShowRoleCard(false);
      //   onNavigate("game");
    }, 3000);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Role Card Modal */}
      {showRoleCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pulse">
            <div className="text-6xl mb-4">
              {currentPlayer.role === ROLES.DEMON_LEADER
                ? "👹"
                : currentPlayer.role === ROLES.DEMON
                ? "😈"
                : currentPlayer.role === ROLES.DOCTOR
                ? "👩‍⚕️"
                : currentPlayer.role === ROLES.INSPECTOR
                ? "🔍"
                : "🧑"}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Role</h2>
            <p className="text-xl text-blue-100 capitalize">{currentPlayer.role.replace("_", " ")}</p>
            <div className="mt-4 text-sm text-blue-200">
              {currentPlayer.role === ROLES.DEMON_LEADER &&
                "Lead the demons to victory! You appear innocent to the inspector."}
              {currentPlayer.role === ROLES.DEMON && "Work with other demons to eliminate villagers."}
              {currentPlayer.role === ROLES.DOCTOR && "Heal mockPlayers during the night phase."}
              {currentPlayer.role === ROLES.INSPECTOR && "Investigate mockPlayers to find demons."}
              {currentPlayer.role === ROLES.VILLAGER && "Find and vote out all the demons!"}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="text-2xl font-mono text-blue-300 bg-white/10 rounded-xl px-4 py-2 inline-block">
            Room: {roomCode}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Players List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Players ({mockPlayers.length}/8)</h2>
            <div className="space-y-3">
              {mockPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">
                      {player.name}
                      {player.name === " (You)"}
                    </span>
                  </div>
                  <div className="text-2xl">{player.isReady ? "✅" : "⏳"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Game Status</h3>
              <div className="space-y-3 text-blue-100">
                <div className="flex justify-between">
                  <span>Ready Players:</span>
                  <span className={allPlayersReady ? "text-green-400" : "text-yellow-400"}>
                    {mockPlayers.filter((p) => p.isReady).length}/{mockPlayers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Players:</span>
                  <span className={minPlayers ? "text-green-400" : "text-red-400"}>{minPlayers ? "✅" : "❌"} 4+</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Roles Distribution</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-red-500/20 rounded-xl">
                  <div className="text-2xl mb-1">👹</div>
                  <div className="text-red-300">Demons: 2</div>
                </div>
                <div className="text-center p-3 bg-blue-500/20 rounded-xl">
                  <div className="text-2xl mb-1">🧑</div>
                  <div className="text-blue-300">Villagers: 2</div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-xl">
                  <div className="text-2xl mb-1">👩‍⚕️</div>
                  <div className="text-green-300">Doctor: 1</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/20 rounded-xl">
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-yellow-300">Inspector: 1</div>
                </div>
              </div>
            </div>

            {isHost && (
              <button
                onClick={startGame}
                disabled={!allPlayersReady || !minPlayers}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
              >
                🚀 Start Game
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={
              () => {}
              // onNavigate("home")
            }
            className="text-blue-300 hover:text-white underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
