import { useState, useEffect } from "react";
import DrinkList from "./components/DrinkList";
import OrderForm from "./components/OrderForm";
import OrderHistory from "./components/OrderHistory";
import Login from "./components/Login";
import Register from "./components/Register";
import WorkerPanel from "./components/WorkerPanel";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  // Уменьшение количества напитков после заказа
  const decreaseDrinkStock = (order) => {
    setDrinks(prev =>
      prev.map(drink => {
        const item = order.items.find(i => i.drinkId === drink.id);
        if (!item) return drink;

        return {
          ...drink,
          kogus: drink.kogus - item.quantity
        };
      })
    );
  };

  // Создание заказа + уменьшение остатка
  const addOrder = (order) => {
    decreaseDrinkStock(order);   // уменьшить остаток
    setOrders(prev => [order, ...prev]); // сохранить заказ
  };

  // Напитки (видят оба)
  const [drinks,setDrinks] = useState([
    {id:1, joogiNimi:"Latte", hind:3.8, kogus:15, kirjeldus:"Mõnus pehme latte"},
    {id:2, joogiNimi:"Espresso", hind:2.5, kogus:0, kirjeldus:"Tugev kibe shot"},
    {id:3, joogiNimi:"Cappuccino", hind:3.2, kogus:10, kirjeldus:"Kakaoga peal"}
  ]);
  
  // История заказов клиента
  const [orders,setOrders]=useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // === Если не залогинен → логин/регистрация ===
  if(!user) return (
    showRegister
      ? <Register onRegister={() => setShowRegister(false)} />
      : <Login onLogin={setUser} onOpenRegister={() => setShowRegister(true)} />
  );

  // === Если вошёл — показываем приложение ===
  return (
    <div className="App">

      <header className="top-bar">
        <h2>Kohvimasin ☕</h2>
        <button className="logout-btn" onClick={logout}>Logi välja</button>
      </header>

      {/* Töötaja vaade */}
      {user.role==="worker" && <WorkerPanel drinks={drinks} setDrinks={setDrinks}/>}


      {/* Üldine kasutajaliides */}
      <div className="container">
        <div className="card"><DrinkList drinks={drinks}/></div>
        {user.role==="client" && (
          <div className="card">
            <OrderForm drinks={drinks} userId={user.id} onOrderCreated={addOrder}/>
          </div>
        )}
      </div>

      {/* Klient – tellimuste ajalugu */}
      {user.role==="client" && (
        <div className="card">
          <OrderHistory orders={orders} onRepeatOrder={addOrder}/>
        </div>
      )}
    </div>
  );
}

export default App;
