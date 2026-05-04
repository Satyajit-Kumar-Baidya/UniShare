import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { MapPin, GraduationCap, Calendar, BookOpen, User } from "lucide-react";
import { useApiQuery } from "../hooks/useApiQuery";
import { getMarketplaceItems, type MarketplaceItem } from "../lib/api";
import { Link } from "react-router-dom";
import ResponsiveImage from "../components/ResponsiveImage";

export default function Profile() {
  const { user } = useAuth();

  const { data: marketplaceItems = [] } = useApiQuery<MarketplaceItem[]>({
    queryKey: ["marketplace-items"],
    queryFn: getMarketplaceItems,
  });

  const myListings = marketplaceItems.filter((item) => item.seller === user?.name);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
      >
        {/* Cover Photo Area */}
        <div className="h-48 bg-linear-to-r from-indigo-100 to-blue-50 w-full relative">
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-1 border-4 border-white shadow-sm z-10 shrink-0">
              {user?.avatar ? (
                <ResponsiveImage
                  src={user.avatar}
                  alt={user.name || 'Profile avatar'}
                  className="w-full h-full rounded-full object-cover"
                  sizes="128px"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <Link to="/dashboard/settings" className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full text-sm transition-colors cursor-pointer inline-flex whitespace-nowrap">
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name || "Member"}</h1>
              <p className="text-lg text-gray-600 mt-1">{user?.bio || "A generic bio for this student."}</p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-gray-600">
              {user?.university && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{user.university}</span>
                </div>
              )}
              {user?.major && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{user.major}</span>
                </div>
              )}
              {user?.graduationYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Class of {user.graduationYear}</span>
                </div>
              )}
              {(user?.university || user?.address) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{user?.address || "On Campus"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Public Activity</h2>
        
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Listings</h3>
           {myListings.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {myListings.map(item => (
                  <Link to={`/marketplace/${item.id}`} key={item.id} className="block group">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 relative">
                      <ResponsiveImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 45vw, 90vw"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                    <p className="text-gray-900 font-semibold">${item.price}</p>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="text-center py-10 text-gray-500">
                This user has no active listings.
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
