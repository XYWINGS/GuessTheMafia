'use client';
import React, { useState } from "react";

const GamePage = () => {
  const ROLES = {
    VILLAGER: "villager",
    DEMON: "demon",
    DEMON_LEADER: "demon_leader",
    DOCTOR: "doctor",
    INSPECTOR: "inspector",
  };

  const PHASES = {
    DAY: "day",
    NIGHT: "night",
    VOTING: "voting",
    RESULTS: "results",
  };
  const players = [
    { id: "1", name: "Alice", isAlive: true, role: ROLES.VILLAGER },
    { id: "2", name: "Bob", isAlive: true, role: ROLES.DEMON },
    { id: "3", name: "Charlie", isAlive: true, role: ROLES.DOCTOR },
    { id: "4", name: "Diana", isAlive: true, role: ROLES.INSPECTOR },
    { id: "5", name: "Eve", isAlive: false, role: ROLES.VILLAGER },
  ];
  const username = "Alice"; // Mock current user
  const [phase, setPhase] = useState(PHASES.DAY);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: "System", message: "Game started! Day phase begins.", isSystem: true },
    {
      id: 2,
      player: "Alice",
      message: "Good morning everyone! Let's discuss who might be suspicious.",
      isSystem: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [votes, setVotes] = useState({});
  const [timer, setTimer] = useState(120); // 2 minutes
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const currentPlayer = players.find((p) => p.name === username) || players[0];
  const alivePlayers = players.filter((p) => p.isAlive);
  const deadPlayers = players.filter((p) => !p.isAlive);

  const sendMessage = () => {
    if (newMessage.trim() && phase === PHASES.DAY) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          player: username,
          message: newMessage,
          isSystem: false,
        },
      ]);
      setNewMessage("");
    }
  };

  //   const castVote = (targetId) => {
  //     setVotes((prev) => ({
  //       ...prev,
  //       [currentPlayer.id]: targetId,
  //     }));
  //   };

  const renderDayPhase = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chat Section */}
      <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Village Discussion</h3>
        <div className="bg-black/20 rounded-xl p-4 h-64 overflow-y-auto mb-4">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.isSystem ? "text-yellow-300 italic" : "text-white"}`}>
              <span className="font-semibold text-blue-300">{msg.player}:</span> {msg.message}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={200}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Voting Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white">☀️ Day Phase</h3>
          <div className="text-2xl font-mono text-yellow-300 mt-2">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <h4 className="text-white font-medium mb-3">Vote to Eliminate:</h4>
        <div className="space-y-2 mb-4">
          {alivePlayers
            .filter((p) => p.name !== username)
            .map((player) => (
              <button
                key={player.id}
                // onClick={() =>

                //     castVote(player.id)}
                // className={`w-full p-3 rounded-xl text-left transition-all ${
                //   votes[currentPlayer.id] === player.id
                //     ? "bg-red-500/30 border-2 border-red-400"
                //     : "bg-white/10 hover:bg-white/20 border border-white/30"
                // }`}
              >
                <span className="text-white font-medium">{player.name}</span>
                <div className="text-sm text-blue-200">
                  Votes: {Object.values(votes).filter((v) => v === player.id).length}
                </div>
              </button>
            ))}
        </div>

        <button
          onClick={() => setPhase(PHASES.NIGHT)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl transition-colors"
        >
          Skip to Night →
        </button>
      </div>
    </div>
  );

  const renderNightPhase = () => {
    const isMyTurn = () => {
      if (currentPlayer.role === ROLES.DEMON || currentPlayer.role === ROLES.DEMON_LEADER) return true;
      if (currentPlayer.role === ROLES.DOCTOR) return true;
      if (currentPlayer.role === ROLES.INSPECTOR) return true;
      return false;
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">🌙 Night Phase</h2>

          {isMyTurn() ? (
            <div>
              <p className="text-blue-100 mb-6">
                {currentPlayer.role === ROLES.DEMON || currentPlayer.role === ROLES.DEMON_LEADER
                  ? "Choose a villager to eliminate:"
                  : currentPlayer.role === ROLES.DOCTOR
                  ? "Choose a player to heal:"
                  : "Choose a player to investigate:"}
              </p>

              <div className="grid gap-3 mb-6">
                {alivePlayers
                  .filter((p) => currentPlayer.role !== ROLES.DEMON || p.role !== ROLES.DEMON)
                  .filter((p) => currentPlayer.role !== ROLES.DEMON_LEADER || p.role !== ROLES.DEMON)
                  .map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedPlayer === player.id
                          ? "bg-purple-500/30 border-2 border-purple-400"
                          : "bg-white/10 hover:bg-white/20 border border-white/30"
                      }`}
                    >
                      <span className="text-white font-medium">{player.name}</span>
                    </button>
                  ))}
              </div>

              <button
                onClick={() => setPhase(PHASES.RESULTS)}
                disabled={!selectedPlayer}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-3 px-6 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                Confirm Action
              </button>
            </div>
          ) : (
            <div>
              <p className="text-blue-100 mb-4">Other players are making their moves...</p>
              <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResultsPhase = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">🌅 Dawn Results</h2>

        <div className="space-y-4 mb-6">
          <div className="bg-red-500/20 rounded-xl p-4">
            <p className="text-red-300 font-semibold">💀 Eve was eliminated by vote</p>
          </div>
          <div className="bg-red-500/20 rounded-xl p-4">
            <p className="text-red-300 font-semibold">⚰️ Charlie was killed during the night</p>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4">
            <p className="text-green-300 font-semibold">💚 Alice was saved by the doctor</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/20 rounded-xl p-4">
            <h4 className="text-green-300 font-semibold mb-2">Alive ({alivePlayers.length})</h4>
            {alivePlayers.map((p) => (
              <div key={p.id} className="text-white">
                {p.name}
              </div>
            ))}
          </div>
          <div className="bg-red-500/20 rounded-xl p-4">
            <h4 className="text-red-300 font-semibold mb-2">Dead ({deadPlayers.length})</h4>
            {deadPlayers.map((p) => (
              <div key={p.id} className="text-gray-400 line-through">
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setPhase(PHASES.DAY)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl transition-colors"
        >
          Continue to Day Phase →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Village Secrets</h1>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-300">Alive: {alivePlayers.length}</span>
            <span className="text-red-300">Dead: {deadPlayers.length}</span>
            <span className="text-blue-300">Your Role: {currentPlayer.role.replace("_", " ")}</span>
          </div>
        </div>

        {/* Game Content */}
        {phase === PHASES.DAY && renderDayPhase()}
        {phase === PHASES.NIGHT && renderNightPhase()}
        {phase === PHASES.RESULTS && renderResultsPhase()}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={
              () => {}
              // onNavigate("lobby")
            }
            className="text-blue-300 hover:text-white underline"
          >
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
