import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShieldCheck, MapPin, Calendar, ArrowLeft, MessageSquare, Heart, Package, Clock, CheckCircle2 } from 'lucide-react';
import ChatDrawer from '../components/ChatDrawer';
import Reviews from '../components/Reviews';
import { cn } from '../lib/utils';
import { useFavorites } from '../context/FavoritesContext';
import { getSellerProfileById, type SellerProfileData } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';
import ResponsiveImage from '../components/ResponsiveImage';

export default function SellerProfile() {
  const { id } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: sellerProfile, isLoading: loading, isError, refetch } = useApiQuery<SellerProfileData | undefined>({
    queryKey: ['seller-profile', id],
    queryFn: () => (id ? getSellerProfileById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
    errorMessage: 'Could not load seller profile.',
  });

  const handleToggleFavorite = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(itemId);
  };
  
  const item = sellerProfile?.items[0];
  const sellerItems = sellerProfile?.items ?? [];

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <QueryErrorState
          title="Seller profile is unavailable"
          message="We could not load this seller profile right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (!loading && !item) {
    return <div className="text-center py-20 text-gray-500">Seller not found</div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto py-8"
      >
        <Link to="/marketplace" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
        </Link>

        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-semibold border-4 border-white shadow-sm">
                  {item?.seller.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2 font-display">{sellerProfile?.sellerName}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-gray-900">{sellerProfile?.sellerRating}</span>
                      <span>({sellerProfile?.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Verified Student</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Main Campus</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined Sep 2023</span>
                    </div>
                    {sellerProfile?.sellerLastActive && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{sellerProfile.sellerLastActive}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-gray-600 text-sm max-w-xl">
                    <p>Computer Science major, Class of 2026. Usually around the Engineering building or Main Library. Happy to bundle items if you see multiple things you need!</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-5 h-5" />
                Message
              </button>
            </div>

            {/* Seller Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-2xl border border-gray-200 shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-3xl font-semibold text-gray-900 font-display mb-1">{sellerItems.length}</div>
                <div className="text-sm text-gray-500 font-body">Items Listed</div>
              </div>
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-3xl font-semibold text-gray-900 font-display mb-1">
                  {sellerProfile?.sellerRating && sellerProfile.sellerRating >= 4.8 ? '< 15 mins' : '~ 1 hr'}
                </div>
                <div className="text-sm text-gray-500 font-body">Avg Response Time</div>
              </div>
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-3xl font-semibold text-gray-900 font-display mb-1">
                  {(sellerItems.length * 14) + 23}
                </div>
                <div className="text-sm text-gray-500 font-body">Successful Transactions</div>
              </div>
            </div>

            {/* Seller's Items */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-display">Items for Sale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerItems.map((sellerItem) => (
                  <Link key={sellerItem.id} to={`/marketplace/${sellerItem.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                      <ResponsiveImage
                        src={sellerItem.image}
                        alt={sellerItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 90vw"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-bold uppercase text-gray-700 shadow-sm">
                        {sellerItem.condition}
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(e, sellerItem.id)}
                        className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 hover:text-rose-500 active:scale-95 transition-all z-10"
                      >
                        <Heart 
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isFavorite(sellerItem.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"
                          )} 
                        />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{sellerItem.title}</h3>
                      <p className="text-lg font-semibold text-indigo-600 mt-auto">${sellerItem.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Seller Reviews */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 font-display">Seller Reviews</h2>
              <Reviews targetId={id || ''} targetType="seller" />
            </div>
          </div>
        )}
      </motion.div>

      {item && (
        <ChatDrawer 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          recipientId={item.sellerId || 'unknown'} 
          recipientName={item.seller} 
        />
      )}
    </>
  );
}
