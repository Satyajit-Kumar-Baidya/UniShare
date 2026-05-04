import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";
import { useApiQuery } from "../../hooks/useApiQuery";
import {
  approveVerificationRequest,
  getVerificationRequests,
  rejectVerificationRequest,
  type VerificationRequest,
} from "../../lib/api";
import QueryErrorState from "../../components/QueryErrorState";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not available";

export default function VerificationQueue() {
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: requests = [], isLoading, isError, refetch } = useApiQuery<VerificationRequest[]>(
    {
      queryKey: ["verification-requests"],
      queryFn: getVerificationRequests,
      errorMessage: "Could not load verification requests.",
    }
  );

  const { pending, approved, rejected } = useMemo(() => {
    const next = { pending: 0, approved: 0, rejected: 0 };
    requests.forEach((req) => {
      if (req.status === "pending") {
        next.pending += 1;
      } else if (req.status === "approved") {
        next.approved += 1;
      } else if (req.status === "rejected") {
        next.rejected += 1;
      }
    });
    return next;
  }, [requests]);

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const reviewedRequests = requests.filter((req) => req.status !== "pending");

  const handleDecision = async (requestId: string, decision: "approve" | "reject") => {
    setActioningId(requestId);
    const note = notes[requestId];
    try {
      if (decision === "approve") {
        await approveVerificationRequest(requestId, note);
      } else {
        await rejectVerificationRequest(requestId, note);
      }

      setNotes((prev) => ({ ...prev, [requestId]: "" }));
      await refetch();
    } finally {
      setActioningId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Verification Queue</h1>
          <p className="text-gray-500 mt-1">Review UIU verification submissions and approve or reject.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Pending: <span className="font-semibold">{pending}</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Approved: <span className="font-semibold">{approved}</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            Rejected: <span className="font-semibold">{rejected}</span>
          </div>
        </div>
      </div>

      {isError ? (
        <QueryErrorState
          title="Verification queue is unavailable"
          message="We could not load verification requests right now."
          onRetry={() => void refetch()}
        />
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Pending Submissions</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{request.email}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    Pending
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">UIU Email</p>
                    <p className="text-gray-900 mt-1">{request.uiuEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">UIU ID Number</p>
                    <p className="text-gray-900 mt-1">{request.uiuIdNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ID Card</p>
                    <p className="text-gray-900 mt-1">{request.uiuIdImage ? "Uploaded" : "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Submitted</p>
                    <p className="text-gray-900 mt-1">{formatDate(request.submittedAt)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin note (optional)</label>
                  <textarea
                    value={notes[request.id] || ""}
                    onChange={(event) =>
                      setNotes((prev) => ({ ...prev, [request.id]: event.target.value }))
                    }
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Optional note to send to the student"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleDecision(request.id, "approve")}
                    disabled={actioningId === request.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDecision(request.id, "reject")}
                    disabled={actioningId === request.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
            No pending verification requests. You are all caught up.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Decisions</h2>
        {reviewedRequests.length > 0 ? (
          <div className="space-y-3">
            {reviewedRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.uiuEmail}</p>
                  {request.adminNote ? (
                    <p className="text-xs text-gray-500 mt-1">Admin note: {request.adminNote}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                      request.status === "approved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {request.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                    {request.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(request.reviewedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
            No decisions recorded yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
