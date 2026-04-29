import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getMarketplaceItems, type MarketplaceItem } from "../../lib/api";
import { Link } from "react-router-dom";
import ResponsiveImage from "../../components/ResponsiveImage";

export default function SavedItems() {
  const { favorites, toggleFavorite } = useFavorites();
  
  const { data: marketplaceItems = [] } = useApiQuery<MarketplaceItem[]>({
    queryKey: ["marketplace-items"],
    queryFn: getMarketplaceItems,
  });

  const savedItems = marketplaceItems.filter(item => favorites.has(item.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Saved Items</h3>
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden group relative">
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
                <button onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }} className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-10">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
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
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">No saved items</h4>
          <p className="text-gray-500 text-sm mb-4">Items you favorite will appear here.</p>
        </div>
      )}
    </motion.div>
  );
}
