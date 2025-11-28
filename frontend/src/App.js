import React, { useState } from 'react';
import DrinkList from './components/DrinkList';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import './App.css';

function App() {
  const [drinks, setDrinks] = useState([
    { id: 1, joogiNimi: 'Espresso', kogus: 5, topsiTüüp: 'Small' },
    { id: 2, joogiNimi: 'Cappuccino', kogus: 3, topsiTüüp: 'Medium' },
    { id: 3, joogiNimi: 'Latte', kogus: 4, topsiTüüp: 'Large' },
    { id: 4, joogiNimi: 'Americano', kogus: 2, topsiTüüp: 'Medium' },
  ]);

  const [orders, setOrders] = useState([]);
  const [userId] = useState(1);

  const handleOrderCreated = (newOrder) => {
    // уменьшаем количество напитков
    const updatedDrinks = drinks.map(d => {
      const ordered = newOrder.items.find(i => i.drinkId === d.id);
      if (ordered) return { ...d, kogus: d.kogus - ordered.quantity };
      return d;
    });
    setDrinks(updatedDrinks);

    setOrders([...orders, newOrder]);
  };

  const handleRepeatOrder = (order) => {
    const newOrder = {
      id: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      userId,
      items: order.items.map(i => ({ ...i }))
    };
    handleOrderCreated(newOrder);
  };

  return (
    <div className="App">
      <h1>☕ Coffee Machine</h1>
      <div className="container">
        <div className="card">
          <OrderForm drinks={drinks} userId={userId} onOrderCreated={handleOrderCreated} />
        </div>
        <div>
          <div className="card">
            <DrinkList drinks={drinks} />
          </div>
          <div className="card" style={{ marginTop: '20px' }}>
            <OrderHistory orders={orders} onRepeatOrder={handleRepeatOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
