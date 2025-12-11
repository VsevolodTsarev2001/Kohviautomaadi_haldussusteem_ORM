import { useState } from "react";

export default function WorkerPanel({ drinks, setDrinks }) {
  const [name,setName] = useState("");
  const [price,setPrice] = useState("");
  const [qty,setQty] = useState("");
  const [desc,setDesc] = useState("");

  const addDrink = () => {
    if(!name||!price||!qty) return alert("Täida kõik väljad!");
    setDrinks([...drinks,{
      id:Date.now(), joogiNimi:name, hind:price, kogus:qty, kirjeldus:desc
    }]);
    setName(""); setPrice(""); setQty(""); setDesc("");
  };

  const remove = id => setDrinks(drinks.filter(x=>x.id!==id));

  return (
    <div className="card">
      <h2>☕ Töötaja paneel</h2>

      <h3>Olemasolevad joogid:</h3>
      <ul>
        {drinks.map(d=>(
          <li key={d.id} className="drink-item">
            <b>{d.joogiNimi}</b> — {d.kogus} tk ( {d.hind}€ )
            {d.kogus==0 && <button onClick={()=>remove(d.id)}>🗑 Kustuta</button>}
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
