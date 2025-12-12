import React, { useState, useEffect } from 'react';
import "../App.css";
import { API_BASE_URL } from "../config";


export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
    // Автообновление каждые 10 секунд
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const url = statusFilter 
        ? `${API_BASE_URL}/Orders?status=${statusFilter}`
        : `${API_BASE_URL}/Orders`;
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Viga tellimuste laadimisel:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const res = await fetch(`${API_BASE_URL}/Orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        loadOrders(); // Перезагружаем список
      } else {
        alert("Ошибка обновления статуса");
      }
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Принят': return '#4CAF50';
      case 'В процессе': return '#FF9800';
      case 'Готов': return '#2196F3';
      case 'Выдан': return '#9E9E9E';
      default: return '#000';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Принят': return 'В процессе';
      case 'В процессе': return 'Готов';
      case 'Готов': return 'Выдан';
      default: return null;
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2>📋 Tellimuste ajalugu</h2>

      <div className="filters-section">
        <label>
          Filtreeri staatuse järgi:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">Kõik</option>
            <option value="Принят">Принят</option>
            <option value="В процессе">В процессе</option>
            <option value="Готов">Готов</option>
            <option value="Выдан">Выдан</option>
          </select>
        </label>

        <span style={{ marginLeft: '20px', color: '#666' }}>
          Kokku: {orders.length} tellimust
        </span>

        {loading && <span style={{ marginLeft: '10px' }}>🔄 Laeb...</span>}
      </div>

      {orders.length === 0 && <p>Tellimusi pole</p>}

      <div style={{ display: 'grid', gap: '15px' }}>
        {orders.map(order => (
          <div key={order.id} className="order-card" style={{
            border: '2px solid ' + getStatusColor(order.status),
            borderRadius: '20px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <b style={{ fontSize: '18px' }}>Tellimus #{order.id}</b>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Klient: {order.user?.nimi || order.user?.email || 'Unknown'}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  {new Date(order.createdAt).toLocaleString('et-EE')}
                </div>
              </div>
              <div>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  background: getStatusColor(order.status),
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '10px',
              borderRadius: '12px',
              marginBottom: '10px'
            }}>
              <b>Tellimuse sisu:</b>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {order.items && order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.drink?.joogiNimi || 'Unknown'} x {item.quantity}
                    {item.drink?.price && ` — ${(item.drink.price * item.quantity).toFixed(2)}€`}
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 'bold', marginTop: '5px' }}>
                Summa: {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}€
              </div>
            </div>

            {getNextStatus(order.status) && (
              <button
                onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                style={{
                  padding: '12px 20px',
                  background: getStatusColor(getNextStatus(order.status)),
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                Muuda staatuseks: {getNextStatus(order.status)} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
