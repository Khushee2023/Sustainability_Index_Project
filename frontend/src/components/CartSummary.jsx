import React from 'react';
import { formatPrice } from '../utils/helpers';

const CartSummary = ({ cart, onCheckout }) => {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <h3 className="font-semibold text-lg">Order Summary</h3>
      
      {/* Summary Lines */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({totalItems} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <hr className="my-2" />
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          Add {formatPrice(50 - subtotal)} more for free shipping!
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={cart.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;