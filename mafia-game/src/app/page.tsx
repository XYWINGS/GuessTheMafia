"use client";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import LandingPage from "./pages/LandingPage";
import { store } from "./store/store";

export default function MainPage() {
  return (
    <div>
      <Provider store={store}>
        <SnackbarProvider maxSnack={3} preventDuplicate>
          <LandingPage />
        </SnackbarProvider>
      </Provider>
    </div>
  );
}
