import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 shadow-lg rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

export default Card;