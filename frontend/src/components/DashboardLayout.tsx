import React, { useRef, Suspense } from "react";
import { Users, Package, LayoutDashboard, ShoppingBag, Heart, Settings, LogOut, Camera, User, ShieldCheck } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApiQuery } from "../hooks/useApiQuery";
import { getMarketplaceItems, getSubscriptionGroups, type MarketplaceItem, type SubscriptionGroup } from "../lib/api";
import PageLoader from "./PageLoader";
import ResponsiveImage from "./ResponsiveImage";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: marketplaceItems = [] } = useApiQuery<MarketplaceItem[]>({
    queryKey: ["marketplace-items"],
    queryFn: getMarketplaceItems,
  });

  const { data: subscriptionGroups = [] } = useApiQuery<SubscriptionGroup[]>({
    queryKey: ["subscription-groups"],
    queryFn: getSubscriptionGroups,
  });

  const myListings = marketplaceItems.filter((item) => item.seller === user?.name);
  const myGroups = subscriptionGroups.filter((group) => group.owner === user?.name);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const navLinks = [
    { to: "/dashboard", label: "Overview Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/listings", label: "My Listings", icon: Package, count: myListings.length },
    { to: "/dashboard/groups", label: "My Groups", icon: Users, count: myGroups.length },
    { to: "/dashboard/orders", label: "Order History", icon: ShoppingBag },
    { to: "/dashboard/saved", label: "Saved Items", icon: Heart },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin Portal", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm relative group cursor-pointer" onClick={() => navigate("/profile")}>
           <div className="absolute top-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Public Profile</div>
           <div className="relative w-24 h-24 mx-auto mb-4" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm hover:brightness-90 transition-all">
              {user?.avatar ? (
                <ResponsiveImage
                  src={user.avatar}
                  alt={user.name || 'Member'}
                  className="w-full h-full object-cover"
                  sizes="96px"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <h2 className="font-semibold text-gray-900 text-lg">{user?.name || "Member"}</h2>
          <p className="text-sm text-gray-500 mb-2">{user?.email || "you@example.com"}</p>
        </div>

        <nav className="space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md scale-[1.02]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <link.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"}`} />
                    {link.label}
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5 text-red-500" /> Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}