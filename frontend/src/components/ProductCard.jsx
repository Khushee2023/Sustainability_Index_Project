import React from 'react';
import SustainabilityBadge from './SustainabilityBadge';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product, onAddToCart }) => {
  const {
    id,
    name,
    description,
    price,
    image_url,
    sustainability_index,
    stock_quantity
  } = product;

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        <img 
          src={image_url} 
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        
        {/* Sustainability Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <SustainabilityBadge score={sustainability_index} size="small" />
        </div>
        
        {/* Stock Status */}
        {stock_quantity === 0 && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {description}
        </p>
        
        {/* Price and Sustainability */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(price)}
          </span>
          
          <div className="hidden sm:block">
            <SustainabilityBadge score={sustainability_index} size="small" />
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={stock_quantity === 0}
          className={`
            w-full py-2 px-4 rounded-md font-semibold transition-colors duration-200
            ${stock_quantity === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        
        {/* Stock Info */}
        {stock_quantity > 0 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {stock_quantity} in stock
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;