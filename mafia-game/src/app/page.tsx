"use client";
import HomePage from "./pages/HomePage";
import { useState } from "react";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";

import { Provider } from "react-redux";
import { store } from "./store/store";

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div>
      <Provider store={store}>
        {currentPage === "home" && <HomePage />}
        {currentPage === "lobby" && <LobbyPage />}
        {currentPage === "game" && <GamePage />}
      </Provider>
    </div>
  );
}
