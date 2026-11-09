"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLogSummary } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Gamepad2,
  Settings,
  AlertTriangle,
  Lock,
  X,
} from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [selectedLog, setSelectedLog] = useState<AdminLogSummary | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter !== "all") params.set("action", actionFilter);
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    if (action.includes("BAN") || action.includes("DELETE")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
          {action}
        </span>
      );
    }
    if (action.includes("ROLE") || action.includes("SETTINGS")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
          {action}
        </span>
      );
    }
    if (action.includes("LOGIN") || action.includes("RESOLVE")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Cryptographically Immutable Audit Trail
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Administrative Activity Logs
          </h2>
          <p className="text-xs text-val-muted">
            Complete record of logins, bans, deletions, role updates, and moderation verdicts.
          </p>
        </div>

        <span className="text-xs font-mono text-val-muted self-start sm:self-auto">
          Recorded actions: <strong className="text-val-white">{totalCount}</strong>
        </span>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-val-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by admin name, action, target entity..."
            className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-val-red"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red font-mono"
          >
            <option value="all">All Actions</option>
            <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
            <option value="USER_BAN">USER_BAN</option>
            <option value="USER_UNBAN">USER_UNBAN</option>
            <option value="USER_ROLE_CHANGE">USER_ROLE_CHANGE</option>
            <option value="USER_DELETE">USER_DELETE</option>
            <option value="PARTY_DELETE">PARTY_DELETE</option>
            <option value="PARTY_UPDATE">PARTY_UPDATE</option>
            <option value="REPORT_STATUS_CHANGE">REPORT_STATUS_CHANGE</option>
            <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
            <option value="CONTENT_CREATE">CONTENT_CREATE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-[#23232E] bg-[#15151C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#23232E] bg-[#1A1A24] text-[10px] font-bold uppercase tracking-wider text-val-dim">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Summary / Details</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232E]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4 bg-[#15151C]/40" />
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C1C26] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-val-dim whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-val-muted">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-val-white block">{log.adminName}</span>
                      <span className="text-[10px] font-mono text-val-dim">
                        ID: {log.adminId.substring(0, 8)}...
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-val-white">{log.targetType}</div>
                      {log.targetId && (
                        <div className="text-[10px] text-val-dim font-mono truncate max-w-xs">
                          {log.targetId}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-val-muted truncate max-w-sm font-mono text-[11px]">
                        {log.details || "No payload logged"}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-val-muted hover:text-val-white transition-colors"
                        title="Inspect full JSON payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-val-dim">
                    No activity logs recorded matching criteria.
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

      {/* LOG INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-val-red" />
                <h3 className="text-base font-bold text-val-white">
                  Audit Log Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Action</span>
                <span className="font-mono font-bold text-val-red">{selectedLog.action}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Administrator</span>
                <span className="font-bold text-val-white">{selectedLog.adminName}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Target Entity</span>
                <span className="font-bold text-val-white">
                  {selectedLog.targetType} {selectedLog.targetId ? `(${selectedLog.targetId})` : ""}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Timestamp</span>
                <span className="font-mono text-val-white">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-val-dim block mb-1">
                Metadata / Log Payload
              </span>
              <pre className="p-3 rounded-xl bg-[#0F0F14] border border-[#23232E] text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-56">
                {selectedLog.details || "No extra metadata."}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#23232E]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-[#1D1D27] text-val-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

