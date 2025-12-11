import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  return (
    <div style={{ padding: "20px" }}>
      <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>

      {/* Переключатель */}
      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => setMode("login")}>Войти</button>
        <button onClick={() => setMode("register")} style={{ marginLeft: "10px" }}>
          Регистрация
        </button>
      </div>

      {mode === "login" ? (
        <Login onLogin={onLogin} />
      ) : (
        <Register />
      )}
    </div>
  );
}

export default AuthPage;
