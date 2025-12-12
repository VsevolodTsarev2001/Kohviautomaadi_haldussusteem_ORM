import React from 'react';
import "../App.css";


export default function DrinkList({ drinks }) {
  return (
    <div>
      <h2>☕ Saadaval joogid</h2>
      <ul>
        {drinks.filter(d => d.kogus > 0).map(drink => (
          <li key={drink.id} className="drink-item">
            <span><b>{drink.joogiNimi}</b> — {drink.price ? `${drink.price.toFixed(2)}€` : ''} — {drink.kogus} tk</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
