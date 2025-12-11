import React, { useState } from "react";

function Register({ onRegister }) {
  const [nimi, setNimi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const data = {
      nimi,
      email,
      password,
      roleId: 2 // клиент по умолчанию
    };

    try {
      const res = await fetch("https://localhost:7108/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(err);
        alert("Ошибка регистрации\n" + err);
        return;
      }

      alert("Регистрация успешна!");
      onRegister(); // переключение обратно на Login

    } catch (err) {
      alert("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>

      <form onSubmit={submit}>
        <input placeholder="Имя" value={nimi} onChange={e => setNimi(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Создать аккаунт</button>
      </form>

      <p>
        Уже есть аккаунт?{" "}
        <button className="link-btn" onClick={onRegister}>Войти</button>
      </p>
    </div>
  );
}

export default Register;
