import React from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Inbox, Package, ShoppingBag, Star, Users, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getMarketplaceItems, getSubscriptionGroups, type MarketplaceItem, type SubscriptionGroup } from "../../lib/api";

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadNotificationsCount, unreadThreadCount, notifications, messages } = useSocket();
  const { favorites } = useFavorites();

  const { data: marketplaceItems = [] } = useApiQuery<MarketplaceItem[]>({
    queryKey: ["marketplace-items"],
    queryFn: getMarketplaceItems,
  });

  const { data: subscriptionGroups = [] } = useApiQuery<SubscriptionGroup[]>({
    queryKey: ["subscription-groups"],
    queryFn: getSubscriptionGroups,
  });

  const verificationStatus = user?.verificationStatus ?? (user?.isVerified ? "verified" : "unverified");
  const verificationConfig = {
    verified: {
      title: "UIU verification approved",
      message: "Your account is verified for UIU marketplace access.",
      action: "View status",
      icon: CheckCircle2,
    },
    pending: {
      title: "Verification pending",
      message: "Your submission is in review. We will notify you once approved.",
      action: "View submission",
      icon: Clock,
    },
    rejected: {
      title: "Verification needs attention",
      message: "Your verification was rejected. Review the admin note and resubmit if needed.",
      action: "Review details",
      icon: ShieldAlert,
    },
    unverified: {
      title: "Verification required",
      message: "Submit your UIU email and ID to unlock the full marketplace.",
      action: "View requirements",
      icon: ShieldAlert,
    },
  } as const;
  const banner = verificationConfig[verificationStatus];
  const bannerStyles: Record<string, { container: string; icon: string; title: string; text: string; action: string }> = {
    verified: {
      container: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
      title: "text-emerald-900",
      text: "text-emerald-700",
      action: "bg-emerald-600 hover:bg-emerald-700",
    },
    pending: {
      container: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      text: "text-amber-700",
      action: "bg-amber-600 hover:bg-amber-700",
    },
    rejected: {
      container: "border-rose-200 bg-rose-50",
      icon: "bg-rose-100 text-rose-600",
      title: "text-rose-900",
      text: "text-rose-700",
      action: "bg-rose-600 hover:bg-rose-700",
    },
    unverified: {
      container: "border-orange-200 bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
      title: "text-orange-900",
      text: "text-orange-700",
      action: "bg-orange-600 hover:bg-orange-700",
    },
  };
  const styles = bannerStyles[verificationStatus];
  const BannerIcon = banner.icon;

  const myListings = marketplaceItems.filter((item) => item.seller === user?.name);
  const myGroups = subscriptionGroups.filter((group) => group.owner === user?.name);

  const stats = [
    { label: "My Listings", value: myListings.length, icon: Package, to: "/dashboard/listings" },
    { label: "My Groups", value: myGroups.length, icon: Users, to: "/dashboard/groups" },
    { label: "Saved Items", value: favorites.size, icon: Star, to: "/dashboard/saved" },
    { label: "Unread Alerts", value: unreadNotificationsCount, icon: Bell, to: "/notifications" },
  ];

  const latestNotifications = notifications.slice().reverse().slice(0, 4);
  const latestMessages = messages
    .filter((message) => message.senderId === user?.id || message.receiverId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const quickActions = [
    { to: unreadThreadCount > 0 ? "/inbox" : "/marketplace", label: unreadThreadCount > 0 ? "Open Inbox" : "Browse Marketplace", icon: Inbox, meta: unreadThreadCount > 0 ? `${unreadThreadCount > 9 ? "9+" : unreadThreadCount} unread` : "Discover items" },
    { to: "/dashboard/listings", label: myListings.length === 0 ? "Post First Listing" : "Manage Listings", icon: Package, meta: myListings.length === 0 ? "Start selling now" : `${myListings.length} total` },
    { to: "/dashboard/groups", label: myGroups.length === 0 ? "Start New Group" : "Open Groups", icon: Users, meta: myGroups.length === 0 ? "Create co-subscriptions" : `${myGroups.length} active` },
    { to: "/cart", label: "Review Cart", icon: ShoppingBag, meta: "Checkout quickly" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-8">
      <div className={`rounded-2xl border ${styles.container} p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden`}>
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-2 sm:p-3 rounded-xl ${styles.icon}`}>
            <BannerIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-semibold text-base sm:text-lg ${styles.title}`}>{banner.title}</h3>
            <p className={`text-sm mt-1 ${styles.text}`}>{banner.message}</p>
            {verificationStatus === "rejected" && user?.verificationNote ? (
              <p className={`text-xs mt-2 ${styles.text}`}>Admin note: {user.verificationNote}</p>
            ) : null}
          </div>
        </div>
        <Link
          to="/dashboard/settings"
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition shadow-sm whitespace-nowrap self-start sm:self-auto ${styles.action}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {banner.action}
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-indigo-600 mb-1">Personalized Overview</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Welcome back, {user?.name || "Member"}
          </h1>
          <p className="mt-2 text-gray-500">
            Manage listings, track subscription groups, and stay updated from one dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link to="/marketplace/new" className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
            New Listing
          </Link>
          <Link to="/co-subs/new" className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm whitespace-nowrap">
            New Group
          </Link>
        </div>
      </div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} onClick={() => navigate(stat.to)} className="cursor-pointer group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                <stat.icon className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
            </div>
            <p className="mt-5 text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {latestNotifications.length > 0 ? (
            <ul className="space-y-3">
              {latestNotifications.map((notification) => (
                <li key={notification.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">No recent notifications yet.</p>
              <p className="mt-1 text-xs text-slate-500">Alerts for listings, groups, and orders will show here.</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Access</h2>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <div key={idx} onClick={() => navigate(action.to)} className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                  <span className="inline-flex items-center gap-2"><action.icon className="h-4 w-4" /> {action.label}</span>
                  <span className="text-xs font-semibold text-slate-500">{action.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
