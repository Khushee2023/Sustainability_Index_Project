import React from 'react';

const Header = ({ cartItemCount, onCartClick }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-2xl font-bold text-gray-800">
              EcoShop
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#products" className="text-gray-600 hover:text-blue-600 transition-colors">
              Products
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#sustainability" className="text-gray-600 hover:text-blue-600 transition-colors">
              Sustainability
            </a>
          </nav>
          
          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            <span className="flex items-center space-x-2">
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline">Cart</span>
            </span>
            
            {/* Cart Count Badge */}
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;