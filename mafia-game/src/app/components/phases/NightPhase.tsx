"use client";
import { Player } from "@/app/configs/configs";
import { useState, useEffect } from "react";

interface NightPhaseProps {
  players: Player[];
  currentPlayer: Player | null;
  onAction: (targetId: string, actionType: string) => void;
}

export default function NightPhase({ players, currentPlayer, onAction }: NightPhaseProps) {
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
