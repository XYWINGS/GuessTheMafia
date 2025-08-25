"use client";
import HomePage from "./pages/HomePage";
import { useState } from "react";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState("lobby");

  return (
    <div>
      {currentPage === "home" && <HomePage />}
      {currentPage === "lobby" && <LobbyPage />}
      {currentPage === "game" && <GamePage />}
    </div>
  );
}
