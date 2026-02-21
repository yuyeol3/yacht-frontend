import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import LobbyPage from "./components/LobbyPage.jsx";
import RoomPage from "./components/RoomPage.jsx";
import GamePage from "./components/GamePage.jsx";
import { getAccessToken } from "./lib/auth.js";
import { disconnectWs } from "./lib/wsClient.js";

function isRealtimePath(pathname) {
  return pathname.startsWith("/rooms/") || pathname.startsWith("/game/");
}

function SocketLifecycle() {
  const location = useLocation();

  useEffect(() => {
    if (!isRealtimePath(location.pathname)) {
      disconnectWs();
    }
  }, [location.pathname]);

  return null;
}

function RequireAuth({ children }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnly({ children }) {
  const token = getAccessToken();
  if (token) {
    return <Navigate to="/lobby" replace />;
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <SocketLifecycle />
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnly>
                <SignupPage />
              </PublicOnly>
            }
          />
          <Route
            path="/lobby"
            element={
              <RequireAuth>
                <LobbyPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rooms/:roomId"
            element={
              <RequireAuth>
                <RoomPage />
              </RequireAuth>
            }
          />
          <Route
            path="/game/:roomId"
            element={
              <RequireAuth>
                <GamePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
