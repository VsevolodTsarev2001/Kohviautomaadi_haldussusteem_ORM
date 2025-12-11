import { useState } from 'react';

export default function OrderForm({ drinks, userId, onOrderCreated }) {
  const [items, setItems] = useState([]);

  

  const addDrink = (drink) => {
    const existing = items.find(x => x.drinkId === drink.id);
    existing ?
      setItems(items.map(i => i.drinkId === drink.id ? { ...i, quantity: i.quantity + 1 } : i))
    : setItems([...items, { drinkId: drink.id, joogiNimi: drink.joogiNimi, quantity: 1, topsiTüüp: drink.topsiTüüp }]);
  };

  const updateQty = (id, q) => setItems(items.map(i => i.drinkId === id ? { ...i, quantity: +q } : i));
  const updateCup = (id, c) => setItems(items.map(i => i.drinkId === id ? { ...i, topsiTüüp: c } : i));

  const submit = async () => {
  if (!items.length) return alert("Vali vähemalt üks jook!");

  // Проверка на количество
  for (const i of items) {
    const drink = drinks.find(d => d.id === i.drinkId);
    if (!drink) continue;

    if (i.quantity > drink.kogus) {
      return alert(`Jook "${drink.joogiNimi}" pole piisavalt laos! Maksimum: ${drink.kogus}`);
    }
  }

  const orderData = {
    userId: userId,   // <-- теперь число
    items: items.map(i => ({
      drinkId: i.drinkId,
      quantity: i.quantity
    }))
  };


  try {
    const token = JSON.parse(localStorage.getItem("user")).token;
    const res = await fetch("https://localhost:7108/api/Orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
    const text = await res.text();
    throw new Error("Ошибка при создании заказа: " + text);
}

    const newOrder = await res.json();
    onOrderCreated(newOrder);
    setItems([]);
    alert("Заказ успешно создан!");
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div>
      <h2>Loo tellimus</h2>
      {drinks.filter(d => d.kogus > 0).map(drink => (
        <li key={drink.id} className="drink-item">
          {drink.joogiNimi} — {drink.kogus} tk
          <input type="number" min="1" max={drink.kogus} defaultValue={1} onChange={e=>updateQty(drink.id,e.target.value)}/>
          <select defaultValue={drink.topsiTüüp} onChange={e=>updateCup(drink.id,e.target.value)}>
            <option>Väike</option><option>Keskmine</option><option>Suur</option>
          </select>
          <button onClick={() => addDrink(drink)}>➕ Lisa</button>
        </li>
      ))}

      {items.length>0 && (
        <div className="order-preview">
          <h3>Tellimuse eelvaade:</h3>
          <ul>
            {items.map(i => <li key={i.drinkId}>{i.joogiNimi} x {i.quantity} ({i.topsiTüüp})</li>)}
          </ul>
          <button onClick={submit}>✔ Kinnita</button>
        </div>
      )}
    </div>
  );
}
