import React, { useState } from "react";

function Login({ onLogin, onOpenRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://localhost:7108/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        alert("Неверный логин или пароль");
        return;
      }

      const data = await res.json();

      localStorage.setItem("user", JSON.stringify({
        token: data.token,
        id: data.userId,
        role: data.role
      }));

      onLogin(data);

    } catch (err) {
      alert("Ошибка подключения к серверу");
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>

      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Войти</button>
      </form>

      <p>
        Нет аккаунта?{" "}
        <button className="link-btn" onClick={onOpenRegister}>
          Зарегистрироваться
        </button>
      </p>
    </div>
  );
}

export default Login;
