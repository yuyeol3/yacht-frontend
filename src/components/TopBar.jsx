import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { clearAuth, getProfile } from "../lib/auth.js";

export default function TopBar({ subtitle }) {
  const navigate = useNavigate();
  const profile = getProfile();

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      // ignore
    }
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="top-bar">
      <div className="brand">
        <span>Y</span>
        Yacht Multiplayer
        {subtitle ? <span className="tag">{subtitle}</span> : null}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="subtle">{profile?.nickname ?? profile?.loginId ?? "Player"}</span>
        <button className="button ghost" onClick={() => navigate("/lobby")}>Lobby</button>
        <button className="button primary" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
