import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ShieldCheck, Users, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ResponsiveImage from "./ResponsiveImage";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/admin", label: "Verification Queue", icon: ShieldCheck, exact: true },
    { to: "/admin/users", label: "Manage Users", icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
              {user?.avatar ? (
                <ResponsiveImage
                  src={user.avatar}
                  alt={user.name || "Admin"}
                  className="w-full h-full object-cover"
                  sizes="80px"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <h2 className="font-semibold text-gray-900 text-lg">{user?.name || "Admin"}</h2>
          <p className="text-sm text-gray-500">{user?.email || "admin@uiu.ac.bd"}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Access
          </div>
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
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <link.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"}`} />
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-400" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
