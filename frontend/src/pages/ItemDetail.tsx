import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShieldCheck, ShoppingCart, ArrowLeft, MessageSquare, Tag, RefreshCw, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import ResponsiveImage from '../components/ResponsiveImage';
import { useFavorites } from '../context/FavoritesContext';
import { addToCart, getMarketplaceItemById, type MarketplaceItem, submitBorrowRequest, submitTradeProposal } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';

export default function ItemDetail() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAdding, setIsAdding] = React.useState(false);
  const [addError, setAddError] = React.useState<string | null>(null);
  const [isBorrowing, setIsBorrowing] = React.useState(false);
  const [isTrading, setIsTrading] = React.useState(false);
  const [borrowError, setBorrowError] = React.useState<string | null>(null);
  const [tradeError, setTradeError] = React.useState<string | null>(null);
  const { data: item, isLoading: loading, isError, refetch } = useApiQuery<MarketplaceItem | undefined>({
    queryKey: ['marketplace-item', id],
    queryFn: () => (id ? getMarketplaceItemById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
    errorMessage: 'Could not load item details.',
  });

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <QueryErrorState
          title="Item details are unavailable"
          message="We could not load this item right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (!loading && !item) {
    return <div className="text-center py-20 text-gray-500">Item not found</div>;
  }

  const handleAddToCart = async () => {
    if (!item || isAdding) {
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      await addToCart(item.id);
    } catch (err: any) {
      setAddError(err?.message ?? 'Could not add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRequestBorrow = async () => {
    if (!item || isBorrowing) {
      return;
    }
    setIsBorrowing(true);
    setBorrowError(null);
    try {
      await submitBorrowRequest(item.id, `I would like to borrow ${item.title}`);
      setBorrowError(null);
      alert('Borrow request sent! The owner will review it.');
    } catch (err: any) {
      setBorrowError(err?.message ?? 'Could not send borrow request.');
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleProposeTrade = async () => {
    if (!item || isTrading) {
      return;
    }
    const offer = prompt('What do you have to offer for this trade?');
    if (!offer) return;
    
    setIsTrading(true);
    setTradeError(null);
    try {
      await submitTradeProposal(item.id, offer);
      setTradeError(null);
      alert('Trade proposal sent! The owner will review it.');
    } catch (err: any) {
      setTradeError(err?.message ?? 'Could not send trade proposal.');
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-body"
    >
      <Link to="/marketplace" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {loading ? (
            <div className="aspect-[4/5] rounded-2xl bg-gray-100 animate-pulse"></div>
          ) : (
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 relative group shadow-sm">
              <ResponsiveImage
                src={item?.image}
                alt={item?.title || 'Marketplace item'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 40vw, 90vw"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => item && toggleFavorite(item.id)}
                  className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <Heart className={cn("w-5 h-5 transition-colors", item && isFavorite(item.id) ? "fill-rose-500 text-rose-500" : "")} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {loading ? (
            <div className="animate-pulse">
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                <div className="h-6 bg-gray-100 rounded-full w-24"></div>
              </div>
              <div className="h-10 bg-gray-100 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-100 rounded w-1/4 mb-8"></div>
              
              <div className="space-y-2 mb-8">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>

              <div className="h-24 bg-gray-100 rounded-xl mb-8"></div>
              
              <div className="space-y-3 mt-auto">
                <div className="h-14 bg-gray-100 rounded-xl w-full"></div>
                <div className="h-14 bg-gray-100 rounded-xl w-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5",
                    item?.type === 'sell' && "bg-indigo-50 text-indigo-700 border border-indigo-200",
                    item?.type === 'share' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                    item?.type === 'barter' && "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {item?.type === 'sell' && <Tag className="w-3.5 h-3.5" />}
                    {item?.type === 'share' && <Heart className="w-3.5 h-3.5" />}
                    {item?.type === 'barter' && <RefreshCw className="w-3.5 h-3.5" />}
                    <span className="capitalize">{item?.type}</span>
                  </span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                    {item?.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                    {item?.condition}
                  </span>
                </div>
                
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3 font-display">
                  {item?.title}
                </h1>
                
                <div className="mb-2">
                  {item?.type === 'sell' && (
                    <p className="text-3xl font-light text-gray-900">${item?.price.toFixed(2)}</p>
                  )}
                  {item?.type === 'share' && (
                    <p className="text-3xl font-light text-emerald-600">Free to Share</p>
                  )}
                  {item?.type === 'barter' && (
                    <div className="flex flex-col">
                      <p className="text-xl font-medium text-amber-600 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Barter Request
                      </p>
                      <p className="text-gray-600 mt-1">
                        Looking for: <span className="font-medium text-gray-900">{item?.exchangeFor}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-sm text-gray-600 mb-8 border-t border-gray-100 pt-6">
                <p>{item?.description}</p>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-2xl p-5 mb-8 border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-lg border border-indigo-100">
                    {item?.seller.charAt(0)}
                  </div>
                  <div>
                    <Link to={`/seller/${item?.sellerId}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                      {item?.seller}
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                      <span>{item?.sellerRating} Rating</span>
                      <span className="mx-2">•</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" />
                      <span>Verified Student</span>
                    </div>
                    {item?.sellerLastActive && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {item.sellerLastActive}
                      </p>
                    )}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-3">
                {addError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {addError}
                  </div>
                )}
                {borrowError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {borrowError}
                  </div>
                )}
                {tradeError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {tradeError}
                  </div>
                )}
                {item?.type === 'sell' && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <Link to="/checkout" className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
                      Buy Now
                    </Link>
                  </>
                )}

                {item?.type === 'share' && (
                  <button
                    onClick={handleRequestBorrow}
                    disabled={isBorrowing}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Heart className="w-5 h-5" />
                    {isBorrowing ? 'Requesting...' : 'Request to Borrow'}
                  </button>
                )}

                {item?.type === 'barter' && (
                  <button
                    onClick={handleProposeTrade}
                    disabled={isTrading}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {isTrading ? 'Proposing...' : 'Propose Trade'}
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  UniShare Buyer Protection
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {item?.type === 'sell' ? 'Your payment is held in escrow until you confirm receiving the item.' : 'Community safety guidelines apply. Always meet in public campus areas.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
