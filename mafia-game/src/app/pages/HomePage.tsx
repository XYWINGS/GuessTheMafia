"use client";
import React, { useState } from "react";

const HomePage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("kanna");
  const createGameRoom = () => {};

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🏘️ Village Secrets</h1>
          <p className="text-blue-100 text-lg">Uncover the demons hiding among you in this social deduction game</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Your Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              maxLength={20}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => createGameRoom()}
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            🎮 Create Game Room
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Room Code"
              className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              maxLength={6}
            />
            <button
              // onClick={() => onNavigate("lobby")}
              disabled={!username.trim() || !roomCode.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-white font-semibold mb-3">How to Play</h3>
          <div className="text-blue-100 text-sm space-y-1">
            <p>🧑 Villagers: Find and eliminate all demons</p>
            <p>👹 Demons: Eliminate villagers without being caught</p>
            <p>👩‍⚕️ Doctor: Heal players during night phase</p>
            <p>🔍 Inspector: Investigate players' roles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
