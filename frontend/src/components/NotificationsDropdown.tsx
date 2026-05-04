import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, Package, Users, Check, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getNotificationActionLabel, getNotificationTarget } from '../lib/notificationRouting';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadNotificationsCount, markNotificationRead } = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'order_update': return <Package className="w-4 h-4 text-emerald-500" />;
      case 'group_update': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notificationId: string, type: string, read: boolean) => {
    if (!read) {
      markNotificationRead(notificationId);
    }
    setIsOpen(false);
    navigate(getNotificationTarget(type));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadNotificationsCount > 0 && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {unreadNotificationsCount} new
                </span>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice().reverse().map((notif) => (
                    <button
                      key={notif.id} 
                      className={`w-full p-4 hover:bg-gray-50 transition-colors flex gap-3 text-left ${!notif.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleNotificationClick(notif.id, notif.type, notif.read)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="mt-1 text-xs font-medium text-indigo-600">{getNotificationActionLabel(notif.type)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
              <div className="flex items-center justify-between gap-3 px-1">
                <button 
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.read) markNotificationRead(n.id);
                    });
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mark all as read
                </button>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
