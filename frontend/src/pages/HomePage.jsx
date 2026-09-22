import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star, RefreshCw, Truck } from 'lucide-react';
import { productsApi } from '../api/client';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await productsApi.getProducts();
        if (res.data) {
          // Take first 4 products as featured
          setFeaturedProducts(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', count: 'Latest Tech', query: 'Electronics' },
    { name: 'Furniture', count: 'Ergonomic & Home', query: 'Furniture' },
    { name: 'Audio', count: 'High-Fidelity Sound', query: 'Audio' },
    { name: 'Accessories', count: 'Desk & Mobile', query: 'Accessories' },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-16 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/20 backdrop-blur border border-indigo-400/30 text-xs font-semibold tracking-wide uppercase text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Premium E-Commerce Experience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Crafted for <span className="text-indigo-400">Excellence</span> & Modern Living.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Discover precision-engineered workspace gear, studio-grade audio, and daily essentials designed to elevate your everyday workflow.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products?category=Electronics"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur font-semibold text-white transition border border-white/20"
            >
              Browse Electronics
            </Link>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Featured Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Categories</h2>
            <p className="text-sm text-slate-500">Explore collections suited for your lifestyle</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.query}`}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition duration-200 group"
            >
              <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending / Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500">Hand-picked top-rated products from our catalog</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
          >
            <span>See Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <p className="text-slate-600 font-medium">Catalog products will appear here.</p>
            <Link
              to="/products"
              className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
