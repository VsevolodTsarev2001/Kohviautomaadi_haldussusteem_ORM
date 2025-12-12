import React, { useState } from 'react';
import "../App.css";


export default function SearchBar({ onSearch, onSort, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const handleSearch = () => {
    onSearch({
      search: searchTerm,
      sortBy: sortBy,
      categoryId: categoryFilter || null,
      inStock: inStockOnly
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSortBy('');
    setCategoryFilter('');
    setInStockOnly(false);
    onSearch({
      search: '',
      sortBy: '',
      categoryId: null,
      inStock: false
    });
  };

  return (
    <div className="search-bar" style={{
      background: '#f5f5f5',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Поиск */}
        <input
          type="text"
          placeholder="🔍 Otsi joogi nime järgi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minWidth: '200px',
            flex: 1
          }}
        />

        {/* Категория */}
        {categories && categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Kõik kategooriad</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nimi}</option>
            ))}
          </select>
        )}

        {/* Сортировка */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">Sorteeri...</option>
          <option value="name">Nimi (A-Z)</option>
          <option value="name_desc">Nimi (Z-A)</option>
          <option value="price">Hind (odavamad enne)</option>
          <option value="price_desc">Hind (kallimad enne)</option>
          <option value="popularity">Populaarsus ↓</option>
          <option value="stock">Laoseis ↑</option>
          <option value="stock_desc">Laoseis ↓</option>
        </select>

        {/* Только в наличии */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>Ainult laos</span>
        </label>

        {/* Кнопки */}
        <button
          onClick={handleSearch}
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
          Otsi
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            background: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tühista
        </button>
      </div>
    </div>
  );
}
