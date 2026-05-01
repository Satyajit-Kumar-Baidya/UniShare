import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, ArrowLeft, ShieldCheck, Info, Music, Tv, BookOpen, FileText, PenTool, Calendar, Share2, Key } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSubscriptionGroupById, joinSubscriptionGroup, type SubscriptionGroup } from '../lib/api';
import { useApiQuery } from '../hooks/useApiQuery';
import QueryErrorState from '../components/QueryErrorState';

const iconMap: Record<string, any> = { Music, Tv, BookOpen, FileText, PenTool };

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const { data: group, isLoading: loading, isError, refetch } = useApiQuery<SubscriptionGroup | undefined>({
    queryKey: ['subscription-group', id],
    queryFn: () => (id ? getSubscriptionGroupById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
    errorMessage: 'Could not load subscription group details.',
  });

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <QueryErrorState
          title="Group details are unavailable"
          message="We could not load this subscription group right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading group details...</div>;
  }

  if (!group) {
    return <div className="text-center py-20 text-gray-500">Group not found</div>;
  }

  const Icon = iconMap[group.icon] || Users;
  const spotsLeft = group.totalSpots - group.filledSpots;
  const isFull = spotsLeft === 0;
  const isSublet = group.type === 'sublet';

  const handleJoin = async () => {
    if (!id || isJoining) {
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    try {
      await joinSubscriptionGroup(id);
      navigate('/checkout');
    } catch (err: any) {
      setJoinError(err?.message ?? 'Could not join this group.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <Link to="/co-subs" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Co-Subscriptions
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center border",
              isSublet 
                ? "bg-amber-50 border-amber-100" 
                : "bg-indigo-50 border-indigo-100"
            )}>
              <Icon className={cn(
                "w-8 h-8",
                isSublet ? "text-amber-600" : "text-indigo-600"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                  isSublet 
                    ? "bg-amber-100 text-amber-800"
                    : "bg-indigo-100 text-indigo-800"
                )}>
                  {isSublet ? <Key className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                  {isSublet ? 'Sublet' : 'Co-Share'}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 font-display">{group.service}</h1>
              <p className="text-gray-500">Organized by {group.owner}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light text-gray-900">${group.pricePerMonth.toFixed(2)}</div>
            <div className="text-sm text-gray-500">per month {isSublet ? '' : '/ person'}</div>
          </div>
        </div>

        <div className="prose prose-sm text-gray-600 mb-8">
          <p>{group.description}</p>
        </div>

        {/* Progress & Escrow */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          {!isSublet ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Group Status</h3>
                <span className={isFull ? "text-rose-600 font-medium text-sm" : "text-emerald-600 font-medium text-sm"}>
                  {isFull ? 'Group Full' : `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} remaining`}
                </span>
              </div>
              
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(group.filledSpots / group.totalSpots) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mb-6">
                <span>{group.filledSpots} Members Joined</span>
                <span>{group.totalSpots} Total Spots</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Sublet Availability</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Available for {group.duration}
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                isFull 
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}>
                {isFull ? 'Currently Rented' : 'Available Now'}
              </span>
            </div>
          )}

          <div className="flex gap-3 items-start bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />
            <div className="text-sm">
              <strong className="block mb-1">Escrow Protected</strong>
              Your payment of ${group.pricePerMonth.toFixed(2)} will be held securely. The organizer only receives funds once {isSublet ? 'the sublet is confirmed' : `all ${group.totalSpots} spots are filled`} and the subscription is activated.
            </div>
          </div>
        </div>

        {/* Total breakdown */}
        <div className="border-t border-gray-100 pt-6 mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Cost Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Subscription Cost</span>
              <span>${group.totalPrice.toFixed(2)}/mo</span>
            </div>
            {!isSublet && (
              <div className="flex justify-between text-gray-600">
                <span>Divided by {group.totalSpots} members</span>
                <span>÷ {group.totalSpots}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-100">
              <span>{isSublet ? 'Your Monthly Cost' : 'Your Monthly Share'}</span>
              <span>${group.pricePerMonth.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {joinError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {joinError}
          </div>
        )}

        {isFull ? (
          <button 
            disabled
            className="w-full py-4 bg-gray-100 text-gray-400 font-medium rounded-xl transition-colors shadow-sm cursor-not-allowed"
          >
            {isSublet ? 'Currently Unavailable' : 'Group is Full'}
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className={cn(
              "w-full py-4 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed",
              isSublet 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {isJoining
              ? 'Joining...'
              : isSublet
                ? 'Request Sublet & Authorize Payment'
                : 'Join Group & Authorize Payment'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
