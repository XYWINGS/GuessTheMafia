"use client";
import { useState, useEffect } from "react";
import { NightPhaseProps, GamePhase, Role } from "../configs/configs";
import { useSocket } from "../page";

export function NightPhase({ onAction }: NightPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [actionCompleted, setActionCompleted] = useState(false);
  const { players, currentPlayer, gamePhase, investigationResult, setInvestigationResult } = useSocket();

  useEffect(() => {
    if (gamePhase?.phase === GamePhase.DAY) {
      setActionCompleted(false);
      setSelectedPlayer("");
      setInvestigationResult(null);
    }
  }, [gamePhase]);

  const handleAction = () => {
    if (!selectedPlayer || !currentPlayer) return;

    let actionType = "";

    switch (currentPlayer.player.role) {
      case Role.DEMON:
      case "demonLeader":
        actionType = "kill";
        break;
      case Role.DOCTOR:
        actionType = "save";
        break;
      case Role.INSPECTOR:
        actionType = "investigate";
        break;
      default:
        return;
    }

    onAction(selectedPlayer, actionType);
    setActionCompleted(true);
  };

  const renderRoleInstructions = () => {
    if (!currentPlayer) return null;

    switch (currentPlayer.player.role) {
      case Role.DEMON:
        return (
          <div className="bg-red-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-red-400">Demon - Select a player to kill</h4>
            <p className="text-sm mb-2">Discuss with other demons and decide who to eliminate tonight.</p>
            <p className="text-xs text-gray-400">The player with the most votes from demons will be killed.</p>
          </div>
        );

      case Role.DEMON_LEADER:
        return (
          <div className="bg-purple-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-purple-400">Demon Leader - Select a player to kill</h4>
            <p className="text-sm mb-2">You appear as a villager to the inspector. Coordinate with other demons.</p>
            <p className="text-xs text-gray-400">The player with the most votes from demons will be killed.</p>
          </div>
        );

      case Role.DOCTOR:
        return (
          <div className="bg-green-900/30 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2 text-green-400">Doctor - Select a player to save</h4>
            <p className="text-sm mb-2">Choose someone to protect from demon attacks tonight.</p>
            <p className="text-xs text-gray-400">
              You can save yourself. If you save the same person the demons attack, they will survive.
            </p>
          </div>
        );

      case Role.INSPECTOR:
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
    if (!currentPlayer.player.isAlive) return false;
    const role = currentPlayer.player.role;
    return role === Role.DEMON || role === Role.DEMON_LEADER || role === Role.DOCTOR || role === Role.INSPECTOR;
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
      <h2 className="text-lg mb-4">
        {currentPlayer?.player.isAlive
          ? "You are alive. Discuss and vote to eliminate a suspect."
          : "You are dead. You can watch the discussion but cannot participate."}
      </h2>

      {renderRoleInstructions()}

      {canPerformAction() && !actionCompleted && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select a Player</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {players
              .filter((player) => {
                if (
                  (player.id === currentPlayer.player.id && currentPlayer.player.role !== Role.DOCTOR) ||
                  !player.isAlive
                )
                  return false;

                if (
                  (currentPlayer.player.role === Role.DEMON || currentPlayer.player.role === Role.DEMON_LEADER) &&
                  (player.role === Role.DEMON || player.role === Role.DEMON_LEADER)
                ) {
                  return false;
                }

                return true;
              })
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
                    {player.id === currentPlayer.player.id && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={handleAction}
            disabled={!selectedPlayer}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            {currentPlayer.player.role === Role.INSPECTOR ? "Investigate" : "Confirm Selection"}
          </button>
        </div>
      )}

      {actionCompleted && (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-semibold mb-2 text-green-400">Action Completed</h4>
          <p className="text-sm">
            {currentPlayer.player.role === Role.INSPECTOR
              ? "You have completed your investigation."
              : "Your selection has been recorded. Waiting for other players..."}
          </p>

          {investigationResult && (
            <div className="mt-3 p-3 bg-blue-900/30 rounded">
              <p className="font-semibold">Investigation Result:</p>
              <p>
                {investigationResult.targetName} is a {investigationResult.result}
              </p>
            </div>
          )}
        </div>
      )}

      {!canPerformAction() && (
        <div className="bg-gray-700 p-4 rounded-lg">
          {currentPlayer?.player.isAlive ? (
            <>
              <h4 className="text-lg font-semibold mb-2">Waiting</h4>
              <p className="text-sm">You don't have any night actions. Wait for the night to end.</p>
            </>
          ) : (
            <>
              <h4 className="text-lg font-semibold mb-2">Ghosting....</h4>
              <p className="text-sm">You have been killed by demons.... Now you are a ghost...</p>
            </>
          )}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Players</h3>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
