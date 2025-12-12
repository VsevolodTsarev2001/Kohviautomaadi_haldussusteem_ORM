import { useState, useEffect } from "react";
import DrinkList from "./components/DrinkList";
import OrderForm from "./components/OrderForm";
import OrderHistory from "./components/OrderHistory";
import Login from "./components/Login";
import Register from "./components/Register";
import WorkerPanel from "./components/WorkerPanel";
import OrderManagement from "./components/OrderManagement";
import SearchBar from "./components/SearchBar";
import StatisticsDashboard from "./components/StatisticsDashboard";
import PromocodeManager from "./components/PromocodeManager";
import { API_BASE_URL } from "./config";
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
  const [drinks,setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // История заказов клиента
  const [orders,setOrders]=useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Loaded user from localStorage:", savedUser);
    if (savedUser) setUser(savedUser);
    
    // Загрузка напитков из API
    loadDrinks();
    
    // Загрузка категорий
    loadCategories();
  }, []);

  const loadDrinks = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.inStock) params.append('inStock', 'true');
      
      const url = `${API_BASE_URL}/Drinks${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDrinks(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки напитков:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Удаляем и отдельный токен
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
      {user.role==="worker" && (
        <>
          <WorkerPanel drinks={drinks} setDrinks={setDrinks}/>
          <OrderManagement />
          <PromocodeManager />
          <StatisticsDashboard />
        </>
      )}


      {/* Üldine kasutajaliides */}
      <div className="container">
        {/* Панель поиска и фильтрации */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <SearchBar 
            onSearch={loadDrinks} 
            categories={categories}
          />
        </div>
        
        <div className="card"><DrinkList drinks={drinks}/></div>
        {user.role==="client" && (
          <div className="card">
            {console.log("Passing userId to OrderForm:", user.id)}
            <OrderForm drinks={drinks} userId={user.id} onOrderCreated={addOrder}/>
          </div>
        )}
      </div>

      {/* Klient – tellimuste ajalugu */}
      {user.role==="client" && (
        <div className="card">
          <OrderHistory userId={user.id} />
        </div>
      )}
    </div>
  );
}

export default App;
