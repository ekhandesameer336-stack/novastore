import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="py-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your cart is currently empty</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Discover something great in our catalog!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const imgUrl =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

              const itemTotal = ((product.price || 0) * item.quantity).toFixed(2);

              return (
                <div
                  key={product._id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm gap-4"
                >
                  {/* Thumbnail and Title */}
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-sm font-bold text-slate-800 hover:text-indigo-600 line-clamp-1 transition"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-500">{product.category}</p>
                      <p className="text-xs font-semibold text-slate-700 sm:hidden">
                        ${(product.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        disabled={product.stock !== undefined && item.quantity >= product.stock}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-black text-slate-900">${itemTotal}</p>
                      <p className="text-[11px] text-slate-400 hidden sm:block">
                        ${(product.price || 0).toFixed(2)} ea
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax</span>
                <span className="font-semibold text-slate-800">$0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-indigo-600">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={cartItems.length === 0}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition ${
                cartItems.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Checkout via Stripe</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
