"use client";
import { Player } from "../configs/configs";
import { useSocket } from "../page";

interface GameLobbyProps {
  onStartGame: () => void;
}

export default function GameLobby({ onStartGame }: GameLobbyProps) {
  const { players } = useSocket();

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
