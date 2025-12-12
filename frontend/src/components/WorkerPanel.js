import { useState } from "react";
import "../App.css";
import { API_BASE_URL, getAuthHeaders } from "../config";

export default function WorkerPanel({ drinks, setDrinks }) {
  const [name,setName] = useState("");
  const [price,setPrice] = useState("");
  const [qty,setQty] = useState("");
  const [desc,setDesc] = useState("");
  const [categoryId, setCategoryId] = useState(1); // По умолчанию категория "Kohv"

  const addDrink = async () => {
    if(!name||!qty) return alert("Täida vähemalt nimi ja kogus!");
    
    const newDrink = {
      joogiNimi: name,
      kogus: parseInt(qty),
      topsiTüüp: "Keskmine",
      maksimisViis: "Kaart",
      price: parseFloat(price) || 0,
      categoryId: categoryId
    };

    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const res = await fetch(`${API_BASE_URL}/Drinks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newDrink)
      });

      if (!res.ok) {
        throw new Error("Viga joogi lisamisel");
      }

      const createdDrink = await res.json();
      setDrinks([...drinks, createdDrink]);
      setName(""); setPrice(""); setQty(""); setDesc("");
      alert("Jook lisatud!");
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Kas oled kindel?")) return;
    
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const res = await fetch(`${API_BASE_URL}/Drinks/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Viga joogi kustutamisel");
      }

      setDrinks(drinks.filter(x => x.id !== id));
      alert("Jook kustutatud!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2>☕ Töötaja paneel</h2>

      <h3>Olemasolevad joogid:</h3>
      <ul>
        {drinks.map(d=>(
          <li key={d.id} className="drink-item">
            <b>{d.joogiNimi}</b> — {d.kogus} tk ( {d.price}€ )
            {d.kogus===0 && <button onClick={()=>remove(d.id)}>🗑 Kustuta</button>}
          </li>
        ))}
      </ul>

      <h3>Lisa uus jook:</h3>
      <input placeholder="Nimi" value={name} onChange={e=>setName(e.target.value)}/>
      <input placeholder="Hind (€)" value={price} onChange={e=>setPrice(e.target.value)}/>
      <input placeholder="Kogus" value={qty} onChange={e=>setQty(e.target.value)}/>
      <textarea placeholder="Kirjeldus.." value={desc} onChange={e=>setDesc(e.target.value)}/>

      <button onClick={addDrink}>➕ Lisa jook</button>
    </div>
  );
}
