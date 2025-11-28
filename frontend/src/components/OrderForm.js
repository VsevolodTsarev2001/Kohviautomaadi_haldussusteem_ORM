import React, { useState } from 'react';

const OrderForm = ({ drinks, userId, onOrderCreated }) => {
  const [items, setItems] = useState([]);

  const handleAddItem = (drink) => {
    const existing = items.find(i => i.drinkId === drink.id);
    if (existing) {
      setItems(items.map(i => i.drinkId === drink.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { drinkId: drink.id, joogiNimi: drink.joogiNimi, quantity: 1, topsiTüüp: drink.topsiTüüp }]);
    }
  };

  const handleQuantityChange = (drinkId, quantity) => {
    setItems(items.map(i => i.drinkId === drinkId ? { ...i, quantity: Number(quantity) } : i));
  };

  const handleCupTypeChange = (drinkId, type) => {
    setItems(items.map(i => i.drinkId === drinkId ? { ...i, topsiTüüp: type } : i));
  };

  const handleSubmit = () => {
    if (items.length === 0) return alert("Select at least one drink.");
    const newOrder = {
      id: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      userId,
      items: items.map(i => ({ ...i }))
    };
    onOrderCreated(newOrder);
    setItems([]);
  };

  return (
    <div>
      <h2>Create Order</h2>
      <ul>
        {drinks.filter(d => d.kogus > 0).map(drink => (
          <li key={drink.id}>
            <strong>{drink.joogiNimi}</strong> ({drink.kogus} left)
            <div style={{ marginTop: '5px' }}>
              Quantity: 
              <input type="number" min="1" max={drink.kogus} value={items.find(i => i.drinkId === drink.id)?.quantity || 1} 
                     onChange={e => handleQuantityChange(drink.id, e.target.value)} style={{ width: '50px', margin: '0 10px' }} />
              Cup: 
              <select value={items.find(i => i.drinkId === drink.id)?.topsiTüüp || drink.topsiTüüp} 
                      onChange={e => handleCupTypeChange(drink.id, e.target.value)} style={{ margin: '0 10px' }}>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
              <button onClick={() => handleAddItem(drink)}>Add</button>
            </div>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="order-preview">
          <h3>Order Preview:</h3>
          <ul>
            {items.map(i => (
              <li key={i.drinkId}>{i.joogiNimi} x {i.quantity} ({i.topsiTüüp})</li>
            ))}
          </ul>
          <button onClick={handleSubmit}>Submit Order</button>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
