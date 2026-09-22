import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-16 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold tracking-wide uppercase text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Next-Gen Tech & Essentials</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
            Upgrade Your Everyday Experience.
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 font-light leading-relaxed">
            Explore carefully curated audio gear, ergonomic workspace furniture, and modern accessories built for performance.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-indigo-950 font-bold hover:bg-indigo-50 shadow-lg transition transform hover:-translate-y-0.5"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products?category=Electronics"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur font-semibold text-white transition border border-white/20"
            >
              Shop Electronics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
