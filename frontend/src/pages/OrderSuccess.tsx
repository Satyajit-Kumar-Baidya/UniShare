import { motion } from 'motion/react';
import { CheckCircle2, Package, Bell, MessageSquare } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || `UNI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return (
    <section className="relative isolate overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#dcfce7_0,_transparent_45%),radial-gradient(circle_at_bottom_right,_#dbeafe_0,_transparent_45%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-white/95 p-8 shadow-sm"
      >
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Payment completed
        </div>

        <h1 className="mt-5 text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Order confirmed and on its way
        </h1>
        <p className="mt-3 text-center text-slate-600">
          Your order has been placed successfully. We have sent a status update to your notifications.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Order Reference</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{orderId}</p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Link
            to="/profile"
            className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Package className="h-5 w-5" />
            <p className="mt-2 text-sm font-medium">View Orders</p>
          </Link>
          <Link
            to="/notifications"
            className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Bell className="h-5 w-5" />
            <p className="mt-2 text-sm font-medium">See Notifications</p>
          </Link>
          <Link
            to="/inbox"
            className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <MessageSquare className="h-5 w-5" />
            <p className="mt-2 text-sm font-medium">Open Inbox</p>
          </Link>
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
