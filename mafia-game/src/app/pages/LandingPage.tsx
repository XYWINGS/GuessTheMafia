"use client";

import { SnackbarProvider } from "notistack";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../store/store";
import GamePage from "./GamePage";
import HomePage from "./HomePage";
import LobbyPage from "./LobbyPage";

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState("home");

  const roomData = useAppSelector((state) => state.room);
  useEffect(() => {
    if (roomData.code) {
      if (roomData.phase === "lobby") {
        setCurrentPage("lobby");
      } else if (["day", "demons", "doctor", "inspector", "waiting"].includes(roomData.phase)) {
        setCurrentPage("game");
      } else {
        setCurrentPage("home");
      }
    } else {
      setCurrentPage("home");
    }
  }, [roomData]);

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
