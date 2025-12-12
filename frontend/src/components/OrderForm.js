import { useState } from 'react';
import "../App.css";
import { API_BASE_URL } from "../config";


export default function OrderForm({ drinks, userId, onOrderCreated }) {
  const [items, setItems] = useState([]);
  const [promocode, setPromocode] = useState('');
  const [validatedPromo, setValidatedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  

  const addDrink = (drink) => {
    const existing = items.find(x => x.drinkId === drink.id);
    existing ?
      setItems(items.map(i => i.drinkId === drink.id ? { ...i, quantity: i.quantity + 1 } : i))
    : setItems([...items, { drinkId: drink.id, joogiNimi: drink.joogiNimi, quantity: 1, topsiTüüp: drink.topsiTüüp }]);
  };

  const updateQty = (id, q) => setItems(items.map(i => i.drinkId === id ? { ...i, quantity: +q } : i));
  const updateCup = (id, c) => setItems(items.map(i => i.drinkId === id ? { ...i, topsiTüüp: c } : i));

  const calculateTotal = () => {
    return items.reduce((sum, i) => {
      const drink = drinks.find(d => d.id === i.drinkId);
      return sum + (drink ? drink.price * i.quantity : 0);
    }, 0);
  };

  const validatePromocode = async () => {
    if (!promocode.trim()) return;

    const totalAmount = calculateTotal();
    
    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
      const res = await fetch(`${API_BASE_URL}/Promocodes/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promocode.trim().toUpperCase(),
          orderAmount: totalAmount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setValidatedPromo(data);
        setPromoError('');
      } else {
        const error = await res.json();
        setPromoError(error.message || 'Sooduskood ei kehti');
        setValidatedPromo(null);
      }
    } catch (err) {
      setPromoError('Viga sooduskoodi kontrollimisel');
      setValidatedPromo(null);
    }
  };

  const submit = async () => {
  if (!items.length) return alert("Vali vähemalt üks jook!");
  
  // Отладочная информация
  console.log("userId from props:", userId);
  console.log("localStorage user:", localStorage.getItem("user"));
  
  // Проверка userId
  if (!userId || userId === 0) {
    console.error("userId is invalid:", userId);
    return alert("Palun logi sisse uuesti!");
  }

  // Проверка на количество
  for (const i of items) {
    const drink = drinks.find(d => d.id === i.drinkId);
    if (!drink) continue;

    if (i.quantity > drink.kogus) {
      return alert(`Jook "${drink.joogiNimi}" pole piisavalt laos! Maksimum: ${drink.kogus}`);
    }
  }

  const orderData = {
    userId: userId,
    items: items.map(i => ({
      drinkId: i.drinkId,
      quantity: i.quantity
    })),
    promocodeUsed: validatedPromo ? validatedPromo.code : null
  };


  try {
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem("user") || '{}').token;
    const res = await fetch(`${API_BASE_URL}/Orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
    const text = await res.text();
    throw new Error("Viga tellimuse loomisel: " + text);
}

    const newOrder = await res.json();
    onOrderCreated(newOrder);
    setItems([]);
    setPromocode('');
    setValidatedPromo(null);
    setPromoError('');
    alert("Tellimus edukalt loodud!");
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div className="card" style={{ maxHeight: '90vh', overflow: 'auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Loo tellimus</h2>
      
      <div style={{ maxHeight: '35vh', overflowY: 'auto', marginBottom: '20px' }}>
        {drinks.filter(d => d.kogus > 0).map(drink => (
          <div key={drink.id} style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
              {drink.joogiNimi}
            </div>
            <div style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '8px' }}>
              {drink.price ? `${drink.price.toFixed(2)}€` : ''} — {drink.kogus} tk
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="number" 
                min="1" 
                max={drink.kogus} 
                defaultValue={1} 
                onChange={e=>updateQty(drink.id,e.target.value)}
                style={{ 
                  width: '60px', 
                  padding: '8px', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff'
                }}
              />
              <select 
                defaultValue={drink.topsiTüüp} 
                onChange={e=>updateCup(drink.id,e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  flex: 1,
                  minWidth: '100px'
                }}
              >
                <option>Väike</option>
                <option>Keskmine</option>
                <option>Suur</option>
              </select>
              <button 
                onClick={() => addDrink(drink)}
                className="btn-primary"
                style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                ➕ Lisa
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length>0 && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '15px', 
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '18px' }}>Tellimuse eelvaade:</h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {items.map(i => {
              const drink = drinks.find(d => d.id === i.drinkId);
              const itemPrice = drink ? drink.price * i.quantity : 0;
              return (
                <div key={i.drinkId} style={{ 
                  padding: '8px 0', 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px'
                }}>
                  {i.joogiNimi} x {i.quantity} ({i.topsiTüüp}) — <span style={{ color: '#a78bfa', fontWeight: '600' }}>{itemPrice.toFixed(2)}€</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: '#ffffff', fontWeight: '700', marginTop: '12px', fontSize: '16px' }}>
            Summa: <span style={{ color: '#a78bfa' }}>{calculateTotal().toFixed(2)}€</span>
          </p>
          
          {/* Sooduskood */}
          <div style={{ marginTop: '15px', padding: '15px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h4 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '16px' }}>🎫 Sooduskood</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={promocode}
                onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                placeholder="Sisesta sooduskood"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              />
              <button
                onClick={validatePromocode}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  whiteSpace: 'nowrap',
                  fontSize: '14px'
                }}
              >
                Rakenda
              </button>
            </div>
            
            {promoError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
                ❌ {promoError}
              </div>
            )}
            
            {validatedPromo && (
              <div style={{ color: '#10b981', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
                ✅ Sooduskood rakendatud! Allahindlus: €{validatedPromo.discountAmount.toFixed(2)}
                {validatedPromo.discountPercent > 0 && ` (${validatedPromo.discountPercent}%)`}
              </div>
            )}
          </div>
          
          {validatedPromo && (
            <div style={{ marginTop: '15px', padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <p style={{ margin: '5px 0', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                Allahindlus: -{validatedPromo.discountAmount.toFixed(2)}€
              </p>
              <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                Kokku: {validatedPromo.finalPrice.toFixed(2)}€
              </p>
            </div>
          )}
          
          <button onClick={submit} className="btn-primary" style={{ marginTop: '20px', width: '100%', padding: '12px', fontSize: '16px' }}>
            ✔ Kinnita
          </button>
        </div>
      )}
    </div>
  );
}
