import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { applyAuthResponse } from "../lib/auth.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ loginId, password, nickname })
      }, { auth: false });

      const authResult = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ loginId, password })
      }, { auth: false });
      applyAuthResponse(authResult, { loginId, fallbackNick: nickname });
      navigate("/lobby");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="top-bar">
        <div className="brand">
          <span>Y</span>
          Yacht Multiplayer
        </div>
        <div className="subtle">Create an account</div>
      </div>
      <div className="container">
        <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
          <h2>회원가입</h2>
          <p className="subtle">닉네임과 계정 정보를 입력하세요.</p>
          {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
          <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
            <input
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "가입 중..." : "Sign Up"}
            </button>
          </form>
          <div className="footer-actions" style={{ justifyContent: "space-between" }}>
            <span className="subtle">이미 계정이 있나요?</span>
            <button className="button ghost" onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
