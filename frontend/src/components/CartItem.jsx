import React, { useState } from 'react';
import SustainabilityBadge from './SustainabilityBadge';
import { formatPrice } from '../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`
      flex items-center space-x-4 p-4 border rounded-lg bg-white
      ${isUpdating ? 'opacity-50' : ''}
    `}>
      {/* Product Image */}
      <img 
        src={item.image_url} 
        alt={item.name}
        className="w-16 h-16 object-cover rounded-lg"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
        }}
      />

      {/* Product Details */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h4>
        <p className="text-gray-600 font-bold">{formatPrice(item.price)}</p>
        
        {/* Sustainability Badge */}
        <div className="mt-1">
          <SustainabilityBadge score={item.sustainability_index} size="small" />
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove from cart"
      >
        🗑️
      </button>
    </div>
  );
};

export default CartItem;