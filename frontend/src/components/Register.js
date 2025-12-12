import { useState } from "react";
import "../App.css";
import { API_BASE_URL } from "../config";


export default function Register({ onRegister }) {
  const [nimi, setNimi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2); // vaikimisi klient

  const register = async () => {
    const res = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nimi, email, password, roleId })
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Registreerimise viga: " + err);
      return;
    }

    alert("Registreerimine õnnestus!");
    onRegister();
  };

  return (
    <div className="login-box">

      <h2>Registreerimine</h2>

      <input placeholder="Nimi" value={nimi} onChange={e => setNimi(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Parool" value={password} onChange={e => setPassword(e.target.value)} />

      <label>Vali roll:</label>
      <select value={roleId} onChange={e => setRoleId(Number(e.target.value))}>
        <option value={2}>Klient</option>
        <option value={1}>Töötaja</option>
      </select>

      <button onClick={register}>Loo konto</button>
      <button onClick={onRegister}>Tagasi sisselogimisele</button>

    </div>
  );
}
