import React, { useState } from 'react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { updateCartItem, removeFromCart } from '../utils/api';

const CartSidebar = ({ isOpen, onClose, cart, onCartUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    setIsLoading(true);
    try {
      await updateCartItem(cartItemId, newQuantity);
      await onCartUpdate(); // Refresh cart data
    } catch (error) {
      alert('Failed to update cart item');
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setIsLoading(true);
    try {
      await removeFromCart(cartItemId);
      await onCartUpdate(); // Refresh cart data
    } catch (error) {
      alert('Failed to remove item from cart');
      console.error('Error removing item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    // For now, just show an alert
    alert('Checkout functionality coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <CartSummary cart={cart} onCheckout={handleCheckout} />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;