import React from 'react';

const OrderHistory = ({ orders, onRepeatOrder }) => (
  <div>
    <h2>Order History</h2>
    {orders.length === 0 && <p>No orders yet</p>}
    <ul>
      {orders.map(order => (
        <li key={order.id} style={{ marginBottom: '15px' }}>
          <strong>Order #{order.id}</strong> at {new Date(order.createdAt).toLocaleString()}
          <ul>
            {order.items.map(item => (
              <li key={item.drinkId}>{item.joogiNimi} x {item.quantity} ({item.topsiTüüp})</li>
            ))}
          </ul>
          <button onClick={() => onRepeatOrder(order)}>Repeat Order</button>
        </li>
      ))}
    </ul>
  </div>
);

export default OrderHistory;
