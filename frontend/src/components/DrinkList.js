import React from 'react';

export default function DrinkList({ drinks }) {
  return (
    <div>
      <h2>☕ Saadaval joogid</h2>
      <ul>
        {drinks.filter(d => d.kogus > 0).map(drink => (
          <li key={drink.id} className="drink-item">
            <span><b>{drink.joogiNimi}</b> — {drink.kogus} tk</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
