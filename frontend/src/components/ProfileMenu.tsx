import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AnimatePresence, motion } from 'motion/react';
import ResponsiveImage from './ResponsiveImage';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount, unreadThreadCount } = useSocket();

  const menuListVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.16 } },
  };

  const userInitials = (user?.name || 'M')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors overflow-hidden"
      >
        {user?.avatar ? (
          <ResponsiveImage
            src={user.avatar}
            alt={user?.name || 'Member'}
            className="w-full h-full object-cover"
            sizes="36px"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="text-[11px] font-semibold text-gray-700">{userInitials || <User className="w-4 h-4" />}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
              aria-label="Close profile menu"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="hidden md:block absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{user?.name || 'Member'}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{user?.email || ''}</p>
              </div>

              <motion.nav initial="hidden" animate="visible" exit="hidden" variants={menuListVariants} className="p-2">
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </span>
                    {unreadNotificationsCount > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {unreadNotificationsCount}
                      </span>
                    ) : null}
                  </Link>
                </motion.div>

                {user?.role === 'admin' ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Portal
                    </Link>
                  </motion.div>
                ) : null}

                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/profile?tab=overview"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/profile?tab=settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/inbox"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Inbox
                    </span>
                    {unreadThreadCount > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {unreadThreadCount > 9 ? '9+' : unreadThreadCount}
                      </span>
                    ) : null}
                  </Link>
                </motion.div>

                <motion.div variants={menuItemVariants}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              </motion.nav>
            </motion.div>

            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-gray-200 bg-white p-5 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <ResponsiveImage
                      src={user.avatar}
                      alt={user?.name || 'Member'}
                      className="w-full h-full object-cover"
                      sizes="40px"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">{userInitials || 'M'}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Member'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
              </div>

              <motion.nav initial="hidden" animate="visible" exit="hidden" variants={menuListVariants} className="space-y-1">
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </span>
                    {unreadNotificationsCount > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {unreadNotificationsCount}
                      </span>
                    ) : null}
                  </Link>
                </motion.div>
                {user?.role === 'admin' ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Portal
                    </Link>
                  </motion.div>
                ) : null}
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/profile?tab=overview"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/profile?tab=settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/inbox"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Inbox
                    </span>
                    {unreadThreadCount > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {unreadThreadCount > 9 ? '9+' : unreadThreadCount}
                      </span>
                    ) : null}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              </motion.nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
