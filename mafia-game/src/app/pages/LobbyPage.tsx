"use client";
import React, { useState } from "react";
import { useAppSelector } from "../store/store";

const LobbyPage = () => {
  const roomData = useAppSelector((state) => state.room);
  const playerData = useAppSelector((state) => state.player);

  const [showRoleCard, setShowRoleCard] = useState(false);

  // Constants for roles
  const ROLES = {
    VILLAGER: "villager",
    DEMON: "demon",
    DEMON_LEADER: "demonLeader",
    DOCTOR: "doctor",
    INSPECTOR: "inspector",
    VAMPIRE: "vampire",
  };

  // Current player info
  const currentPlayer = playerData;

  // Room info
  const roomCode = roomData.code;
  const minPlayers = roomData.players.length >= 4;

  // Show role card before starting
  const startGame = () => {
    setShowRoleCard(true);
    setTimeout(() => {
      setShowRoleCard(false);
      // navigate to game screen
    }, 3000);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Role Card Modal */}
      {showRoleCard && currentPlayer.role && (
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
              {currentPlayer.role === ROLES.DOCTOR && "Heal players during the night phase."}
              {currentPlayer.role === ROLES.INSPECTOR && "Investigate players to find demons."}
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
            Room: {roomCode || "—"}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Players List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Players ({roomData.players.length}/8)</h2>
            <div className="space-y-3">
              {roomData.players.map((player) => (
                <div key={player._id} className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">
                      {player.name}
                      {player._id === currentPlayer.id ? " (You)" : ""}
                    </span>
                  </div>
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
                  <span>Minimum Players:</span>
                  <span className={minPlayers ? "text-green-400" : "text-red-400"}>{minPlayers ? "✅" : "❌"} 4+</span>
                </div>
              </div>
            </div>

            {/* Roles Distribution (Optional: you can calculate counts from roomData) */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Roles Distribution</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-red-500/20 rounded-xl">
                  <div className="text-2xl mb-1">👹</div>
                  <div className="text-red-300">
                    Demons:{" "}
                    {roomData.players.filter((p) => p.role === ROLES.DEMON || p.role === ROLES.DEMON_LEADER).length}
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-500/20 rounded-xl">
                  <div className="text-2xl mb-1">🧑</div>
                  <div className="text-blue-300">
                    Villagers: {roomData.players.filter((p) => p.role === ROLES.VILLAGER).length}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-xl">
                  <div className="text-2xl mb-1">👩‍⚕️</div>
                  <div className="text-green-300">
                    Doctor: {roomData.players.filter((p) => p.role === ROLES.DOCTOR).length}
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-500/20 rounded-xl">
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-yellow-300">
                    Inspector: {roomData.players.filter((p) => p.role === ROLES.INSPECTOR).length}
                  </div>
                </div>
              </div>
            </div>
            {/*
            {currentPlayer.isHost && (
              <button
                onClick={startGame}
                disabled={!allPlayersReady || !minPlayers}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
              >
                🚀 Start Game
              </button>
            )} */}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => {}} className="text-blue-300 hover:text-white underline">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
