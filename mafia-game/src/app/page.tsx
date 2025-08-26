"use client";
import { useState } from "react";
import { store } from "./store/store";
import { Provider } from "react-redux";
import GamePage from "./pages/GamePage";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import { SnackbarProvider } from "notistack";

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div>
      <Provider store={store}>
        <SnackbarProvider maxSnack={3} preventDuplicate>
          {currentPage === "home" && <HomePage />}
          {currentPage === "lobby" && <LobbyPage />}
          {currentPage === "game" && <GamePage />}
        </SnackbarProvider>
      </Provider>
    </div>
  );
}
