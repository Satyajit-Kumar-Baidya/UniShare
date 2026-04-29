import React from "react";
import { motion } from "motion/react";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getMarketplaceItems, type MarketplaceItem } from "../../lib/api";
import ResponsiveImage from "../../components/ResponsiveImage";

export default function MyListings() {
  const { user } = useAuth();
  
  const { data: marketplaceItems = [] } = useApiQuery<MarketplaceItem[]>({
    queryKey: ["marketplace-items"],
    queryFn: getMarketplaceItems,
  });

  const myListings = marketplaceItems.filter((item) => item.seller === user?.name);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">My Listings</h3>
        <Link to="/marketplace/new" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          List Item
        </Link>
      </div>
      {myListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                <ResponsiveImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 45vw, 90vw"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">Active</div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 line-clamp-1 mb-1">{item.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">${item.price}</span>
                  <Link to={`/marketplace/${item.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">You haven't listed any items yet</h4>
          <p className="text-gray-500 text-sm mb-4">Got textbooks or stationery you no longer need? List them here.</p>
          <Link to="/marketplace/new" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">List Your First Item</Link>
        </div>
      )}
    </motion.div>
  );
}
