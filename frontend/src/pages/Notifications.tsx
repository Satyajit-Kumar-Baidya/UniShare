import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, MessageSquare, Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { getNotificationActionLabel, getNotificationTarget } from '../lib/notificationRouting';

type FilterType = 'all' | 'unread' | 'message' | 'order_update' | 'group_update';
type SortType = 'newest' | 'oldest' | 'unread_first';

export default function Notifications() {
  const { notifications, markNotificationRead } = useSocket();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') {
      return notifications;
    }
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.read);
    }
    return notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);

  const sortedNotifications = useMemo(() => {
    const list = [...filteredNotifications];
    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'unread_first':
        list.sort((a, b) => Number(a.read) - Number(b.read));
        break;
      default:
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
    }
    return list;
  }, [filteredNotifications, sort]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'order_update':
        return <Package className="h-4 w-4 text-emerald-600" />;
      case 'group_update':
        return <Users className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <section className="relative isolate overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,transparent_40%),radial-gradient(circle_at_bottom_right,#fef9c3_0,transparent_40%)]" />

      <div className="mx-auto max-w-5xl px-1 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Notifications Center</h1>
          <p className="mt-2 text-slate-600">Stay on top of order updates, messages, and group events.</p>
        </motion.div>

        <div className="mb-5 flex flex-wrap items-center gap-2 justify-between">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'message', label: 'Messages' },
            { key: 'order_update', label: 'Orders' },
            { key: 'group_update', label: 'Groups' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as FilterType)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === item.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortType)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none hover:bg-slate-50"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="unread_first">Unread first</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {sortedNotifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-medium text-slate-900">No notifications in this view</p>
              <p className="mt-1 text-sm text-slate-500">Try switching filters to see more updates.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sortedNotifications.map((notification, index) => (
                  <motion.li
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.03 }}
                    className={`flex items-start gap-3 p-5 ${!notification.read ? 'bg-blue-50/40' : ''}`}
                  >
                    <div className={`mt-1 rounded-full p-2 ${!notification.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(notification.timestamp).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {!notification.read ? (
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Read
                        </button>
                        <Link
                          to={getNotificationTarget(notification.type)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {getNotificationActionLabel(notification.type)}
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={getNotificationTarget(notification.type)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        {getNotificationActionLabel(notification.type)}
                      </Link>
                    )}
                  </motion.li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
