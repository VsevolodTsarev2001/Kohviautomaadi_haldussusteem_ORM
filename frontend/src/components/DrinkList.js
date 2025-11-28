import React from 'react';

const DrinkList = ({ drinks }) => (
  <div>
    <h2>Available Drinks</h2>
    <ul>
      {drinks.filter(d => d.kogus > 0).map(drink => (
        <li key={drink.id}>
          {drink.joogiNimi} - Qty: {drink.kogus} - {drink.topsiTüüp}
        </li>
      ))}
    </ul>
  </div>
);

export default DrinkList;
