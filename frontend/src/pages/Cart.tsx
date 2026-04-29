import { motion } from 'motion/react';
import { Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCartPreviewItems, type MarketplaceItem } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';
import ResponsiveImage from '../components/ResponsiveImage';

export default function Cart() {
  const { data: cartItems = [], isError, refetch } = useApiQuery<MarketplaceItem[]>({
    queryKey: ['cart-preview-items'],
    queryFn: getCartPreviewItems,
    errorMessage: 'Could not load cart items.',
  });

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <QueryErrorState
          title="Cart is unavailable"
          message="We could not load your cart right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <ResponsiveImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  sizes="96px"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.condition} • {item.seller}</p>
                  </div>
                  <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                  <button className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (5%)</span>
              <span>${(subtotal * 0.05).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 text-lg">
              <span>Total</span>
              <span>${(subtotal * 1.05).toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
