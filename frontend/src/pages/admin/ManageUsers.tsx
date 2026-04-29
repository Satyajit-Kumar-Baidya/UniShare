import React from "react";
import { motion } from "motion/react";
import { BadgeCheck, Clock, ShieldAlert, User as UserIcon } from "lucide-react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { getAllUsers, type MockUser } from "../../lib/api";
import QueryErrorState from "../../components/QueryErrorState";

const statusConfig: Record<string, { label: string; icon: React.ElementType; styles: string }> = {
  verified: {
    label: "Verified",
    icon: BadgeCheck,
    styles: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    styles: "border-amber-200 bg-amber-50 text-amber-700",
  },
  rejected: {
    label: "Rejected",
    icon: ShieldAlert,
    styles: "border-rose-200 bg-rose-50 text-rose-700",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    styles: "border-orange-200 bg-orange-50 text-orange-700",
  },
};

export default function ManageUsers() {
  const { data: users = [], isLoading, isError, refetch } = useApiQuery<MockUser[]>({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
    errorMessage: "Could not load users.",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Manage Users</h1>
        <p className="text-gray-500 mt-1">Review UIU accounts, roles, and verification status.</p>
      </div>

      {isError ? (
        <QueryErrorState
          title="User list is unavailable"
          message="We could not load users right now."
          onRetry={() => void refetch()}
        />
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
          <span>User</span>
          <span>Contact</span>
          <span>Role</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              const status = statusConfig[user.verificationStatus || "unverified"];
              const StatusIcon = status.icon;

              return (
                <div key={user.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Joined {user.joinedDate || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">UIU: {user.uiuEmail || "Not submitted"}</p>
                  </div>
                  <div className="capitalize font-semibold text-gray-900">{user.role || "user"}</div>
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${status.styles}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-sm text-gray-500">No users found.</div>
        )}
      </div>
    </motion.div>
  );
}
