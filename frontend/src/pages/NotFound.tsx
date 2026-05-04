import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3">Page not found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist yet.
      </p>
      <div className="flex items-center gap-4">
        <Link 
          to="/"
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link 
          to="/marketplace"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Browse Marketplace
        </Link>
      </div>
    </motion.div>
  );
}
