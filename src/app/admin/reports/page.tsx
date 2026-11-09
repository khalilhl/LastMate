"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReportSummary } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import { useToast } from "@/context/ToastContext";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  UserX,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";

export default function AdminReportsPage() {
  const { success, error } = useToast();

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Review modal
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null);
  const [modNotes, setModNotes] = useState("");
  const [actionOnParty, setActionOnParty] = useState<"none" | "close" | "delete">("none");
  const [actionOnHost, setActionOnHost] = useState<"none" | "ban">("none");
  const [banReason, setBanReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (reasonFilter !== "all") params.set("reason", reasonFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reasonFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenReview = (r: ReportSummary) => {
    setSelectedReport(r);
    setModNotes(r.moderatorNotes || "");
    setActionOnParty("none");
    setActionOnHost("none");
    setBanReason("");
  };

  const handleResolve = async (newStatus: "RESOLVED" | "DISMISSED" | "UNDER_REVIEW") => {
    if (!selectedReport) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: newStatus,
          moderatorNotes: modNotes.trim() || undefined,
          actionOnParty: actionOnParty !== "none" ? actionOnParty : undefined,
          actionOnHost: actionOnHost !== "none" ? actionOnHost : undefined,
          banReason: banReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update report");
      } else {
        success(`Report marked as ${newStatus}.`);
        setSelectedReport(null);
        fetchReports();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Pending
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Under Review
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Resolved
          </span>
        );
      case "DISMISSED":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
            Dismissed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Community Reports & Moderation
          </h2>
          <p className="text-xs text-val-muted">
            Investigate reported parties, remove violating announcements, and protect squad safety.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-val-muted">
            Total reports: <strong className="text-val-white">{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E] flex flex-wrap items-center gap-3">
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
          >
            <option value="all">All Report Statuses</option>
            <option value="PENDING">Pending Only</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        <div>
          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
          >
            <option value="all">All Violation Types</option>
            <option value="Invalid">Invalid / Expired Code</option>
            <option value="full">Party Already Full / AFK</option>
            <option value="Inappropriate">Inappropriate Content</option>
            <option value="Toxic">Toxic Behavior</option>
            <option value="Spam">Spam / Ads</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border border-[#23232E] bg-[#15151C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#23232E] bg-[#1A1A24] text-[10px] font-bold uppercase tracking-wider text-val-dim">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reason / Issue</th>
                <th className="py-3 px-4">Reported Party</th>
                <th className="py-3 px-4">Host Account</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Filed</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232E]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-[#15151C]/40" />
                  </tr>
                ))
              ) : reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#1C1C26] transition-colors">
                    <td className="py-3 px-4">
                      {getStatusBadge(r.status)}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-amber-300 block">
                          {r.reason}
                        </span>
                        {r.details && (
                          <span className="text-[11px] text-val-dim line-clamp-1 max-w-xs">
                            &ldquo;{r.details}&rdquo;
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {r.party ? (
                        <div>
                          <span className="font-bold text-val-white block">
                            {r.party.name}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 block">
                            Code: {r.party.partyCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-val-dim italic">Party was deleted</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {r.party?.owner ? (
                        <div>
                          <span className="font-bold text-val-white block">
                            {r.party.owner.username}
                          </span>
                          <span className="text-[10px] text-val-dim block font-mono">
                            {r.party.owner.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-val-dim">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-val-muted">
                      {r.reporter ? (
                        <div>
                          <span className="font-semibold text-val-white">
                            {r.reporter.username}
                          </span>
                          <span className="text-[10px] text-val-dim block font-mono">
                            {r.reporter.rank}
                          </span>
                        </div>
                      ) : (
                        <span className="text-val-dim">Anonymous</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[11px] font-mono text-val-dim">
                      {formatTimeAgo(r.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(r)}
                        className="px-3 py-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-val-white hover:border-val-red/50 text-xs font-bold uppercase transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-val-dim">
                    No reports filed matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#23232E] flex items-center justify-between text-xs">
            <span className="text-val-dim">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] disabled:opacity-40 text-val-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] disabled:opacity-40 text-val-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REVIEW & RESOLVE MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-val-white">
                  Report Investigation
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Violation Details */}
            <div className="p-4 rounded-xl bg-[#1D1D27] border border-[#2E2E3E] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                  Reason: {selectedReport.reason}
                </span>
                {getStatusBadge(selectedReport.status)}
              </div>
              <p className="text-val-white leading-relaxed">
                Details: {selectedReport.details || "No written explanation attached."}
              </p>
              <div className="pt-2 text-[10px] text-val-dim flex items-center justify-between border-t border-[#2E2E3E]">
                <span>Reporter: {selectedReport.reporter?.username || "Anonymous"}</span>
                <span>Filed {formatTimeAgo(selectedReport.createdAt)}</span>
              </div>
            </div>

            {/* Party & Host Overview */}
            {selectedReport.party ? (
              <div className="p-4 rounded-xl bg-[#1D1D27] border border-[#2E2E3E] text-xs space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-val-dim">
                  Reported Party
                </h4>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-val-white">{selectedReport.party.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {selectedReport.party.partyCode}
                  </span>
                </div>
                <div className="text-[11px] text-val-muted flex items-center justify-between">
                  <span>Host: {selectedReport.party.owner?.username}</span>
                  <span>Status: {selectedReport.party.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-val-dim italic">The reported party has already been removed.</p>
            )}

            {/* Moderation Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Internal Staff Notes
              </label>
              <textarea
                rows={2}
                value={modNotes}
                onChange={(e) => setModNotes(e.target.value)}
                placeholder="Log internal details or verdict rationale..."
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg p-2.5"
              />
            </div>

            {/* Quick Enforcement Actions */}
            <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2E2E3E] space-y-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                Direct Enforcement Actions
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {selectedReport.party && (
                  <button
                    type="button"
                    onClick={() =>
                      setActionOnParty(actionOnParty === "delete" ? "none" : "delete")
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      actionOnParty === "delete"
                        ? "bg-rose-950/60 border-rose-500 text-rose-300"
                        : "bg-[#1D1D27] border-[#2E2E3E] text-val-muted"
                    }`}
                  >
                    {actionOnParty === "delete" ? "✓ Remove Party Flagged" : "Remove Party"}
                  </button>
                )}

                {selectedReport.party?.owner && (
                  <button
                    type="button"
                    onClick={() =>
                      setActionOnHost(actionOnHost === "ban" ? "none" : "ban")
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      actionOnHost === "ban"
                        ? "bg-rose-950/60 border-rose-500 text-rose-300"
                        : "bg-[#1D1D27] border-[#2E2E3E] text-val-muted"
                    }`}
                  >
                    {actionOnHost === "ban" ? "✓ Ban Host Account Flagged" : "Ban Host Account"}
                  </button>
                )}
              </div>

              {actionOnHost === "ban" && (
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for banning host (displayed to user)..."
                  className="w-full bg-[#1D1D27] border border-rose-900/60 text-val-white text-xs rounded-lg p-2 mt-1"
                />
              )}
            </div>

            {/* Verdict Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => handleResolve("UNDER_REVIEW")}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase bg-[#1D1D27] text-cyan-400 border border-[#2E2E3E] hover:bg-[#252533]"
              >
                Set Under Review
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve("DISMISSED")}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve("RESOLVED")}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm"
                >
                  {isProcessing ? "Processing..." : "Resolve & Enforce"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

