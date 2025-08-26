"use client";
import { useState } from "react";
import { Player } from "@/app/configs/configs";
import { useSocket } from "@/app/page";

interface DayPhaseProps {
  players: Player[];
  currentPlayer: Player | null;
  onVote: (targetId: string) => void;
  onSendMessage: (message: string) => void;
}

export default function DayPhase({ players, currentPlayer, onVote, onSendMessage }: DayPhaseProps) {
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
