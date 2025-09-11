"use client";
import { useSocket } from "../page";
import { DayPhase } from "./DayPhase";
import { NightPhase } from "./NightPhase";
import { GamePhase } from "../configs/configs";

export function GameInterface() {
  const { players, currentPlayer, gamePhase, dayCount, socket } = useSocket();
  const phase = gamePhase?.phase;

  const handleVote = (targetId: string, targetName: string) => {
    if (socket && currentPlayer) {
      socket.emit("vote", {
        sessionId: currentPlayer.sessionId,
        voterId: currentPlayer.player.id,
        voterName: currentPlayer.player.name,
        targetId,
        targetName,
      });
    }
  };

  const handleNightAction = (targetId: string, actionType: string) => {
    if (socket && currentPlayer) {
      socket.emit("night-action", {
        sessionId: currentPlayer.sessionId,
        playerId: currentPlayer.player.id,
        targetId,
        actionType,
      });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && currentPlayer) {
      socket.emit("chat-message", {
        sessionId: currentPlayer.sessionId,
        playerId: currentPlayer.player.id,
        message,
      });
    }
  };

  const alivePlayers = players.filter((player) => player.isAlive);
  const demonPlayers = 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
        <div>
          <span
            className={`px-3 py-1 rounded-full ${
              phase === GamePhase.DAY ? "bg-yellow-500 text-black" : "bg-blue-900 text-white"
            }`}
          >
            {phase === GamePhase.DAY ? "☀️ Day" : "🌙 Night"} {dayCount}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm">Alive: {alivePlayers.length}</p>
          <p className="text-sm">Demons: {demonPlayers}</p>
        </div>

        <div>
          <span className="bg-purple-600 px-3 py-1 rounded-full capitalize">{currentPlayer?.player.role}</span>
        </div>
      </div>

      {phase === GamePhase.DAY ? (
        <DayPhase
          players={alivePlayers}
          currentPlayer={currentPlayer}
          onVote={handleVote}
          onSendMessage={sendChatMessage}
        />
      ) : (
        <NightPhase players={alivePlayers} currentPlayer={currentPlayer} onAction={handleNightAction} />
      )}
    </div>
  );
}
