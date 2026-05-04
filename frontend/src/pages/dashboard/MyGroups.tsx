import React from "react";
import { motion } from "motion/react";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getSubscriptionGroups, type SubscriptionGroup } from "../../lib/api";

export default function MyGroups() {
  const { user } = useAuth();
  
  const { data: subscriptionGroups = [] } = useApiQuery<SubscriptionGroup[]>({
    queryKey: ["subscription-groups"],
    queryFn: getSubscriptionGroups,
  });

  const myGroups = subscriptionGroups.filter((group) => group.owner === user?.name);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">My Groups</h3>
        <Link to="/co-subs/new" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          Create Group
        </Link>
      </div>
      {myGroups.length > 0 ? (
        <div className="space-y-4">
          {myGroups.map(group => (
            <div key={group.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">{group.service}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{group.filledSpots} of {group.totalSpots} spots filled • ${group.pricePerMonth}/mo</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">Active</span>
                <Link to={`/co-subs/${group.id}`} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Manage</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">You are not part of any groups</h4>
          <p className="text-gray-500 text-sm mb-4">Join a group to save money on subscriptions, or start your own.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/co-subs" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm">Browse Groups</Link>
            <Link to="/co-subs/new" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 shadow-sm">Create Group</Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
