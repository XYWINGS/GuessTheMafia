"use client";
import { GamePage } from "./pages/MainPage";
import { SnackbarProvider } from "notistack";
import { SocketProvider } from "./context/socketContext";

export default function MainPage() {
  return (
    <SocketProvider>
      <SnackbarProvider maxSnack={3} preventDuplicate>
        <GamePage />
      </SnackbarProvider>
    </SocketProvider>
  );
}
