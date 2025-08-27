"use client";

import { Player } from "../configs/configs";
import { useSocket } from "../page";
import DayPhase from "./phases/DayPhase";
import NightPhase from "./phases/NightPhase";

interface GameInterfaceProps {
  players: Player[];
  currentPlayer: Player;
  timeOfDay: "day" | "night";
  dayCount: number;
  onToggleTime: () => void;
}

export default function GameInterface({ onToggleTime }: GameInterfaceProps) {
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
          onSendMessage={function (message: string): void {
            throw new Error("Function not implemented.");
          }}
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
