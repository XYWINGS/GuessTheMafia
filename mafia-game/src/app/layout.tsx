import "./globals.css";
import type { Metadata } from "next";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guess The Mafia",
  description: "Online Role Play Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.22.5/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <Provider store={store}>
        {" "}
        <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">{children}</body>
      </Provider>

      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body> */}
    </html>
  );
}
