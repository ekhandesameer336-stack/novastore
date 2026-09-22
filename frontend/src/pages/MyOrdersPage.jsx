import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight } from 'lucide-react';
import { ordersApi } from '../api/client';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ordersApi.getMyOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Could not load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">Delivered</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            <Truck className="w-3.5 h-3.5" />
            <span className="capitalize">Shipped</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
            <XCircle className="w-3.5 h-3.5" />
            <span className="capitalize">Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">Processing</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage your past orders and receipts</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No orders placed yet</h2>
          <p className="text-xs text-slate-500">
            Once you complete a purchase, your order history and live delivery tracking will appear right here.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4"
            >
              {/* Order Card Header */}
              <div className="p-5 sm:px-6 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-slate-400 block font-semibold">Order ID</span>
                    <span className="font-mono font-bold text-slate-800">{order._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Date Placed</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Total Amount</span>
                    <span className="font-black text-slate-900">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.orderStatus)}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="p-5 sm:px-6 divide-y divide-slate-100 space-y-3">
                {order.items?.map((item, idx) => {
                  const product = item.product || {};
                  const img =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">
                            {product.name || 'Product'}
                          </p>
                          <p className="text-slate-400">
                            Qty: {item.quantity} &times; ${item.priceAtPurchase?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-slate-800">
                        ${((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Shipping destination footer */}
              {order.shippingAddress && (
                <div className="px-5 sm:px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Shipping Address: </span>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.zip},{' '}
                  {order.shippingAddress.country}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
