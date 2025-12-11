import React from 'react';

export default function OrderHistory({ orders, onRepeatOrder }) {
  return (
    <div>
      <h2>🕘 Tellimuste ajalugu</h2>

      {orders.length===0 && <p>Tellimusi pole</p>}

      {orders.map(order => (
        <div key={order.id} className="order-block">
          <b>Tellimus #{order.id}</b> — {new Date(order.createdAt).toLocaleString()}
          <ul>
            {order.items.map(i => (
              <li key={i.drinkId}>{i.joogiNimi} x {i.quantity} ({i.topsiTüüp})</li>
            ))}
          </ul>
          <button onClick={() => onRepeatOrder(order)}>🔁 Korda tellimust</button>
        </div>
      ))}
    </div>
  );
}
