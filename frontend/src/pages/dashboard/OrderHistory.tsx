import React from "react";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getOrderById, getOrders, type OrderDetail, type OrderSummary } from "../../lib/api";
import { useApiQuery } from "../../hooks/useApiQuery";
import QueryErrorState from "../../components/QueryErrorState";

export default function OrderHistory() {
  const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);
  const [detailsById, setDetailsById] = React.useState<Record<string, OrderDetail>>({});
  const [detailLoadingId, setDetailLoadingId] = React.useState<string | null>(null);
  const [detailErrorById, setDetailErrorById] = React.useState<Record<string, string>>({});

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useApiQuery<OrderSummary[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
    errorMessage: "Could not load your orders.",
  });

  const toggleDetails = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    if (detailsById[orderId]) {
      return;
    }

    setDetailLoadingId(orderId);
    setDetailErrorById((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const detail = await getOrderById(orderId);
      setDetailsById((prev) => ({ ...prev, [orderId]: detail }));
    } catch (err: any) {
      setDetailErrorById((prev) => ({
        ...prev,
        [orderId]: err?.message ?? "Could not load order details.",
      }));
    } finally {
      setDetailLoadingId(null);
    }
  };

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <QueryErrorState
          title="Order history is unavailable"
          message="We could not load your orders right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order History</h3>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-xl bg-gray-50 border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">No past orders found</h4>
          <p className="text-gray-500 text-sm mb-4">When you buy items, they will appear here.</p>
          <Link to="/marketplace" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order {order.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                </div>
              </div>
              <div className="mt-3 text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-emerald-600">{order.status}</div>
                <button
                  onClick={() => toggleDetails(order.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {expandedOrderId === order.id ? "Hide details" : "View details"}
                </button>
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  {detailLoadingId === order.id ? (
                    <div className="text-sm text-gray-500">Loading items...</div>
                  ) : detailErrorById[order.id] ? (
                    <div className="text-sm text-rose-600">{detailErrorById[order.id]}</div>
                  ) : (
                    <div className="space-y-3">
                      {(detailsById[order.id]?.items ?? []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <Link
                            to={`/marketplace/${item.itemId}`}
                            className="text-gray-700 hover:text-indigo-600 transition-colors"
                          >
                            {item.title ?? `Item ${item.itemId}`}
                          </Link>
                          <div className="font-medium text-gray-900">
                            ${item.priceAtPurchase.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {(detailsById[order.id]?.items ?? []).length === 0 && (
                        <div className="text-sm text-gray-500">No line items found.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
