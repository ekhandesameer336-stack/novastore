import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-400">On all eligible domestic orders</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Secure Stripe Payments</h4>
              <p className="text-xs text-slate-400">End-to-end 256-bit SSL encryption</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400">30-day money-back guarantee</p>
            </div>
          </div>
        </div>

        {/* Links section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 font-black text-xl text-white">
              <ShoppingBag className="w-6 h-6 text-indigo-400" />
              <span>NovaStore</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your modern destination for premium tech, gadgets, and lifestyle essentials with fast delivery and guaranteed satisfaction.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Shop</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-indigo-400 transition">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-indigo-400 transition">Electronics</Link></li>
              <li><Link to="/products?category=Furniture" className="hover:text-indigo-400 transition">Furniture</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Account</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/my-orders" className="hover:text-indigo-400 transition">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition">Shopping Cart</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3">Support</h5>
            <p className="text-xs text-slate-400 mb-2">Have questions? We are here 24/7.</p>
            <p className="text-xs text-indigo-400 font-medium">support@novastore.example.com</p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} NovaStore Inc. All rights reserved. Built with React & Node.js.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
