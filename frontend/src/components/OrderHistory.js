import React, { useState, useEffect } from 'react';
import "../App.css";
import { API_BASE_URL } from "../config";


export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [orders, dateFrom, dateTo, statusFilter]);

  const loadOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      
      if (!token) {
        console.error("Token puudub");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/Orders/my`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        console.error("Token on aegunud või kehtetu");
        alert("Sessioon on aegunud. Palun logi uuesti sisse.");
      }
    } catch (err) {
      console.error("Viga tellimuste ajaloo laadimisel:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Фильтр по дате от
    if (dateFrom) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    }

    // Фильтр по дате до
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => new Date(o.createdAt) <= endDate);
    }

    // Фильтр по статусу
    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const repeatOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const res = await fetch(`${API_BASE_URL}/Orders/${orderId}/repeat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        alert("Tellimus edukalt korratud!");
        loadOrders(); // Перезагружаем историю
      } else {
        const text = await res.text();
        alert("Viga: " + text);
      }
    } catch (err) {
      alert("Viga tellimuse kordamisel: " + err.message);
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

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>🕘 Tellimuste ajalugu</h2>

      {/* Фильтры */}
      <div style={{
        background: '#f5f5f5',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            Alates:
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ marginLeft: '5px', padding: '5px' }}
            />
          </label>

          <label>
            Kuni:
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ marginLeft: '5px', padding: '5px' }}
            />
          </label>

          <label>
            Staatus:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginLeft: '5px', padding: '5px' }}
            >
              <option value="">Kõik</option>
              <option value="Принят">Принят</option>
              <option value="В процессе">В процессе</option>
              <option value="Готов">Готов</option>
              <option value="Выдан">Выдан</option>
            </select>
          </label>

          <button
            onClick={clearFilters}
            style={{
              padding: '5px 10px',
              background: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tühista filtrid
          </button>
        </div>

        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Kokku tellimusi: {filteredOrders.length} / {orders.length}
          {filteredOrders.length > 0 && (
            <> | Summa kokku: {filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2)}€</>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 && <p>Tellimusi pole</p>}

      {filteredOrders.map(order => (
        <div key={order.id} className="order-block" style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          background: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <b>Tellimus #{order.id}</b>
              <span style={{ marginLeft: '10px', color: '#666' }}>
                {new Date(order.createdAt).toLocaleString('et-EE')}
              </span>
            </div>
            <div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: getStatusColor(order.status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {order.status}
              </span>
            </div>
          </div>

          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {order.items && order.items.map((item, idx) => (
              <li key={idx}>
                {item.drink?.joogiNimi || 'Unknown'} x {item.quantity}
                {item.drink?.price && ` — ${(item.drink.price * item.quantity).toFixed(2)}€`}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Kokku: {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}€
            </div>
            <button
              onClick={() => repeatOrder(order.id)}
              style={{
                padding: '8px 16px',
                background: '#6a4c93',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔁 Korda tellimust
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
