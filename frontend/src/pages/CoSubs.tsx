import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Users, Music, Tv, BookOpen, FileText, PenTool, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getSubscriptionGroups, type SubscriptionGroup } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';

const iconMap: Record<string, any> = {
  Music, Tv, BookOpen, FileText, PenTool
};

export default function CoSubs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { data: groups = [], isLoading: loading, isError, refetch } = useApiQuery<SubscriptionGroup[]>({
    queryKey: ['subscription-groups'],
    queryFn: getSubscriptionGroups,
    errorMessage: 'Could not load subscription groups.',
  });

  const filteredGroups = useMemo(() => {
    const results = groups.filter((group) => {
      if (!searchQuery.trim()) {
        return true;
      }
      const query = searchQuery.trim().toLowerCase();
      return (
        group.service.toLowerCase().includes(query) ||
        group.owner.toLowerCase().includes(query)
      );
    });

    const sorted = [...results];
    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
        break;
      case 'spots_left':
        sorted.sort((a, b) => (b.totalSpots - b.filledSpots) - (a.totalSpots - a.filledSpots));
        break;
      default:
        break;
    }

    return sorted;
  }, [groups, searchQuery, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight font-display">Co-Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1 font-body">Share costs for digital services or sublet your unused accounts.</p>
        </div>
        <Link to="/co-subs/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm font-body">
          <Plus className="w-4 h-4" />
          List Subscription
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Search</label>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search services or owners"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort by</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-indigo-300"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="spots_left">Most spots left</option>
          </select>
        </div>
      </div>

      {isError && (
        <QueryErrorState
          title="Co-Subscription listings are unavailable"
          message="We could not load group listings right now."
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-body items-stretch">
        {loading ? (
          // Skeleton Loaders
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col animate-pulse h-80">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-100"></div>
                <div className="text-right">
                  <div className="h-6 w-16 bg-gray-100 rounded mb-1 ml-auto"></div>
                  <div className="h-4 w-12 bg-gray-100 rounded ml-auto"></div>
                </div>
              </div>
              <div className="h-6 w-3/4 bg-gray-100 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded mb-6"></div>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-100 rounded"></div>
                  <div className="h-4 w-16 bg-gray-100 rounded"></div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-100 rounded"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="h-10 w-full bg-gray-100 rounded-xl mt-6"></div>
            </div>
          ))
        ) : (
          // Actual Content
          filteredGroups.map((group, index) => {
            const Icon = iconMap[group.icon] || Users;
            const isSublet = group.type === 'sublet';
            const spotsLeft = isSublet ? (group.filledSpots === 0 ? 1 : 0) : (group.totalSpots - group.filledSpots);
            const isFull = spotsLeft === 0;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link to={`/co-subs/${group.id}`} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer relative overflow-hidden flex flex-col h-full group">
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform",
                      isSublet 
                        ? "bg-amber-50 text-amber-600 border border-amber-100" 
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-gray-900">${group.pricePerMonth.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{group.service}</h3>
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full",
                        isSublet 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {isSublet ? 'Sublet' : 'Share'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Listed by {group.owner}</p>
                  </div>

                  <div className="space-y-3 mt-auto relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">{isSublet ? 'Availability' : 'Group Status'}</span>
                      <span className={isFull ? "text-rose-600 font-medium" : "text-emerald-600 font-medium"}>
                        {isFull ? (isSublet ? 'Rented' : 'Full') : (isSublet ? 'Available' : `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left`)}
                      </span>
                    </div>
                    
                    {!isSublet && (
                      <>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(group.filledSpots / group.totalSpots) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{group.filledSpots} filled</span>
                          <span>{group.totalSpots} total</span>
                        </div>
                      </>
                    )}
                    {isSublet && group.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span>{group.duration} month duration</span>
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={isFull}
                    className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-gray-50 text-gray-900 hover:text-indigo-700 font-medium rounded-xl text-sm transition-colors border border-gray-200 hover:border-indigo-200 relative z-10"
                  >
                    {isFull ? 'Unavailable' : 'View Details'}
                  </button>
                  
                  {/* Decorative background element */}
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
