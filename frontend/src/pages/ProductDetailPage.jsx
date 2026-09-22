import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { productsApi } from '../api/client';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.getProductById(id);
        if (res.data) {
          setProduct(res.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested product does not exist.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  return (
    <div className="py-6 space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Images section */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center p-4">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain object-center"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.ratingAverage || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-800">{product.ratingAverage || 4.8}</span>
            <span className="text-slate-400">({product.ratingCount || 15} reviews)</span>
          </div>

          {/* Price & Stock */}
          <div className="flex items-baseline space-x-4 py-2 border-y border-slate-200">
            <span className="text-4xl font-black text-slate-900">${product.price.toFixed(2)}</span>
            {product.stock > 0 ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800">Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-800 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="px-6 py-3.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-semibold text-sm text-center bg-white shadow-sm transition"
                >
                  Go to Cart
                </Link>
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
              <Truck className="w-5 h-5 mx-auto text-indigo-500" />
              <p className="font-semibold text-slate-700">Fast Shipping</p>
              <p className="text-[10px]">Delivered in 2-4 days</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-500" />
              <p className="font-semibold text-slate-700">2-Year Warranty</p>
              <p className="text-[10px]">Full manufacturer cover</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-amber-500" />
              <p className="font-semibold text-slate-700">30-Day Returns</p>
              <p className="text-[10px]">Risk-free trial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
