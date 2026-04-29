import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Filter, Plus, Search, X, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import ResponsiveImage from '../components/ResponsiveImage';
import { useFavorites } from '../context/FavoritesContext';
import { getMarketplaceItems, type MarketplaceItem } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: items = [], isLoading: loading, isError, refetch } = useApiQuery<MarketplaceItem[]>({
    queryKey: ['marketplace-items'],
    queryFn: getMarketplaceItems,
    errorMessage: 'Could not load marketplace items.',
  });
  
  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };
  // Update URL when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const categories = ['All', 'Textbooks', 'Course Notes', 'Lab Gear', 'Calculators', 'Project Kits'];
  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];
  const types = ['All', 'Sell', 'Share', 'Barter'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      // Condition filter
      const matchesCondition = selectedCondition === 'All' || item.condition === selectedCondition;

      // Type filter
      const matchesType = selectedType === 'All' || (item.type && item.type.toLowerCase() === selectedType.toLowerCase());
      
      // Price filter
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesCondition && matchesType && matchesPrice;
    });
  }, [items, searchQuery, selectedCategory, selectedCondition, selectedType, priceRange]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedType('All');
    setPriceRange([0, 100]);
  };

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + 
                            (selectedCondition !== 'All' ? 1 : 0) + 
                            (selectedType !== 'All' ? 1 : 0) + 
                            (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-gray-500 mt-1">Swap UIU course packs, lab gear, and study tools with verified students.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm border",
              showFilters || activeFilterCount > 0
                ? "bg-gray-100 border-gray-300 text-gray-900" 
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs rounded-full px-1.5 py-0.5 ml-1 flex items-center justify-center font-semibold">{activeFilterCount}</span>}
          </button>
          <Link to="/marketplace/new" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            List Item
          </Link>
        </div>
      </div>

      {isError && (
        <QueryErrorState
          title="Marketplace is unavailable"
          message="We could not load marketplace items right now."
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Search and Filters Area */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5 font-body relative z-10">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search UIU course codes, titles, or keywords..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-500"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-200/50 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Listing Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                      selectedType === type 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                      selectedCategory === cat 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Condition</label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(cond => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                      selectedCondition === cond 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Price</label>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">${priceRange[1]}</span>
              </div>
              <div className="flex items-center gap-4 py-2">
                <input 
                  type="range" 
                  min="0" 
                  max="200"
                  step="5"
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {activeFilterCount > 0 && (
                <button 
                  onClick={resetFilters}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium transition-colors w-full"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-body">
        {loading ? (
          // Skeleton Loaders
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col h-full animate-pulse p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="aspect-[4/3] rounded-xl bg-gray-100 mb-4 w-full"></div>
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3 mt-auto pt-2"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          // Actual Content
          filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to={`/marketplace/${item.id}`} className="group cursor-pointer flex flex-col h-full bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 mb-4 relative">
                  <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                  <ResponsiveImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(min-width: 1280px) 260px, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[11px] font-bold tracking-wide text-gray-700 uppercase shadow-sm z-20">
                    {item.condition}
                  </div>
                  {item.type && (
                    <div className={cn(
                      "absolute top-3 right-3 px-2.5 py-1 backdrop-blur-md rounded-lg text-[11px] font-bold uppercase tracking-wide shadow-sm z-20",
                      item.type === 'sell' ? "bg-indigo-600/95 text-white" :
                      item.type === 'share' ? "bg-emerald-600/95 text-white" :
                      "bg-amber-500/95 text-white"
                    )}>
                      {item.type}
                    </div>
                  )}
                  <button
                    onClick={(e) => handleToggleFavorite(e, item.id)}
                    className="absolute bottom-3 right-3 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all z-20 text-gray-400 hover:text-rose-500"
                  >
                    <Heart 
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isFavorite(item.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"
                      )} 
                    />
                  </button>
                </div>
                <div className="space-y-1 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {item.type === 'sell' ? `$${item.price}` : 
                       item.type === 'share' ? 'Free' : 'Barter'}
                    </span>
                  </div>
                  <div className="mt-auto pt-1">
                    <p className="text-sm text-gray-500">{item.category} • {item.seller}</p>
                    {item.sellerLastActive && (
                      <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {item.sellerLastActive}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            {activeFilterCount > 0 && (
              <button 
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

