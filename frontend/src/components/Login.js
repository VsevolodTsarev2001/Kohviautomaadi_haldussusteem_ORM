import React, { useState } from "react";
import "../App.css";
import { API_BASE_URL } from "../config";


function Login({ onLogin, onOpenRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        alert("Vale email või parool");
        return;
      }

      const data = await res.json();

      console.log("Login response:", data);

      const userData = {
        token: data.token,
        id: data.userId,
        role: data.role
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token); // Сохраняем токен отдельно для совместимости

      console.log("Saved to localStorage:", JSON.parse(localStorage.getItem("user")));

      onLogin(userData);

    } catch (err) {
      alert("Viga ühenduses serveriga");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sisselogimine</h2>

      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Parool" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Logi sisse</button>
      </form>

      <p>
        Pole kontot?{" "}
        <button className="link-btn" onClick={onOpenRegister}>
          Registreeru
        </button>
      </p>
    </div>
  );
}

export default Login;
