"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PartySummary } from "@/lib/types";
import { VALORANT_RANKS, VALORANT_ROLES, VALORANT_SERVERS } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import RoleBadge from "@/components/parties/RoleBadge";
import ServerBadge from "@/components/parties/ServerBadge";
import PartyStatusBadge from "@/components/parties/PartyStatusBadge";
import CopyCodeButton from "@/components/parties/CopyCodeButton";
import { useToast } from "@/context/ToastContext";
import {
  Search,
  Filter,
  Gamepad2,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminPartiesPage() {
  const { success, error } = useToast();

  const [parties, setParties] = useState<PartySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serverFilter, setServerFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [viewParty, setViewParty] = useState<PartySummary | null>(null);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [deleteParty, setDeleteParty] = useState<PartySummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchParties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serverFilter !== "all") params.set("server", serverFilter);
      if (rankFilter !== "all") params.set("rank", rankFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/parties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setParties(data.parties || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch admin parties:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, serverFilter, rankFilter, page]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  // Bulk selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === parties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(parties.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk action trigger
  const handleBulkAction = async (bulkAction: "close" | "reopen" | "delete") => {
    if (selectedIds.length === 0) return;
    if (
      bulkAction === "delete" &&
      !confirm(`Are you sure you want to delete ${selectedIds.length} parties permanently?`)
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/parties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyIds: selectedIds,
          bulkAction,
        }),
      });

      if (res.ok) {
        success(`Bulk action '${bulkAction}' completed on ${selectedIds.length} parties.`);
        setSelectedIds([]);
        fetchParties();
      } else {
        const data = await res.json();
        error(data.error || "Failed bulk action");
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick single status update
  const handleQuickStatus = async (partyId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/parties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, status }),
      });
      if (res.ok) {
        success(`Party status changed to '${status}'`);
        fetchParties();
      } else {
        error("Failed to update status");
      }
    } catch {
      error("Network error");
    }
  };

  // Save full edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParty) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/parties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId: editParty.id,
          name: editParty.name,
          partyCode: editParty.partyCode,
          currentPlayers: editParty.currentPlayers,
          maxPlayers: editParty.maxPlayers,
          requiredRank: editParty.requiredRank,
          averageRank: editParty.averageRank,
          preferredRole: editParty.preferredRole,
          server: editParty.server,
          status: editParty.status,
          description: editParty.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to save party changes");
      } else {
        success("Party announcement updated.");
        setEditParty(null);
        fetchParties();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete party
  const handleConfirmDelete = async () => {
    if (!deleteParty) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/parties?partyId=${deleteParty.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Party announcement deleted.");
        setDeleteParty(null);
        fetchParties();
      } else {
        const data = await res.json();
        error(data.error || "Failed to delete party");
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Party Announcements Management
          </h2>
          <p className="text-xs text-val-muted">
            Moderate in-game party codes, manage squad states, and enforce code validity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-val-muted">
            Total parties: <strong className="text-val-white">{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-val-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by party code, squad name, host..."
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Statuses</option>
              <option value="Looking for players">Looking for players</option>
              <option value="Full">Full (5/5)</option>
              <option value="In Game">In Game</option>
              <option value="Closed">Closed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Server Filter */}
          <div>
            <select
              value={serverFilter}
              onChange={(e) => {
                setServerFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Servers</option>
              {VALORANT_SERVERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Rank Filter */}
          <div>
            <select
              value={rankFilter}
              onChange={(e) => {
                setRankFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Ranks</option>
              {VALORANT_RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-[#23232E] flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-val-white">
              {selectedIds.length} {selectedIds.length === 1 ? "party" : "parties"} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkAction("reopen")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 font-bold"
              >
                Reopen
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("close")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
              >
                Close Selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("delete")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg border border-rose-900 bg-rose-950/40 text-rose-400 hover:bg-rose-900 font-bold"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Parties Table */}
      <div className="rounded-xl border border-[#23232E] bg-[#15151C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#23232E] bg-[#1A1A24] text-[10px] font-bold uppercase tracking-wider text-val-dim">
                <th className="py-3 px-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.length > 0 && selectedIds.length === parties.length ? (
                      <CheckSquare className="w-4 h-4 text-val-red" />
                    ) : (
                      <Square className="w-4 h-4 text-val-dim" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Squad Name / Code</th>
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-4">Slots</th>
                <th className="py-3 px-4">Rank / Role</th>
                <th className="py-3 px-4">Server</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Copies</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232E]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4 bg-[#15151C]/40" />
                  </tr>
                ))
              ) : parties.length > 0 ? (
                parties.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#1C1C26] transition-colors ${
                        isSelected ? "bg-[#1F1F2C]" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => toggleSelectOne(p.id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-val-red" />
                          ) : (
                            <Square className="w-4 h-4 text-val-dim" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-val-white block truncate max-w-xs">
                              {p.name}
                            </span>
                            {p.partyType === "DEMO" ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                DEMO
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                REAL
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] font-bold text-cyan-400 block tracking-wider mt-0.5">
                            {p.partyCode || (p.partyType === "DEMO" ? "NULL (DEMO)" : "NULL (EXPIRED)")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-val-white block truncate">
                          {p.owner?.username || "Unknown"}
                        </span>
                        <span className="text-[10px] text-val-dim font-mono block">
                          {p.owner?.rank}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-val-white">
                        {p.currentPlayers}/{p.maxPlayers}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <RankBadge rank={p.averageRank} size="sm" />
                          <RoleBadge role={p.preferredRole} size="sm" />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-val-muted">
                        <ServerBadge server={p.server} size="sm" />
                      </td>

                      <td className="py-3 px-4">
                        <PartyStatusBadge status={p.status} />
                      </td>

                      <td className="py-3 px-4 font-mono text-val-muted">
                        {p.copyCount || 0}
                      </td>

                      <td className="py-3 px-4 text-[11px] font-mono text-val-dim">
                        {formatTimeAgo(p.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <CopyCodeButton code={p.partyCode} partyId={p.id} variant="subtle" showLabel={false} />

                          <button
                            type="button"
                            onClick={() => setViewParty(p)}
                            className="p-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-val-muted hover:text-val-white transition-colors"
                            title="Inspect party details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditParty(p)}
                            className="p-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Edit party details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick close/reopen */}
                          {p.status === "Closed" || p.status === "Expired" ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(p.id, "Looking for players")}
                              className="p-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                              title="Reopen party"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(p.id, "Closed")}
                              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                              title="Close party"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteParty(p)}
                            className="p-1.5 rounded-lg border border-rose-950 bg-rose-950/40 text-rose-500 hover:bg-rose-900 transition-colors"
                            title="Delete party permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-val-dim">
                    No parties found matching criteria.
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

      {/* VIEW DETAILS MODAL */}
      {viewParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <div>
                <h3 className="text-lg font-bold text-val-white">{viewParty.name}</h3>
                <span className="text-xs font-mono text-cyan-400">
                  Party Code: {viewParty.partyCode}
                </span>
              </div>
              <button
                onClick={() => setViewParty(null)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Status</span>
                <PartyStatusBadge status={viewParty.status} />
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Players</span>
                <span className="font-bold text-val-white">
                  {viewParty.currentPlayers} / {viewParty.maxPlayers}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Avg Rank</span>
                <RankBadge rank={viewParty.averageRank} size="sm" />
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Copies</span>
                <span className="font-mono font-bold text-val-red">
                  {viewParty.copyCount || 0}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-val-dim block mb-1">
                Description
              </span>
              <p className="p-3 rounded-lg bg-[#1D1D27] text-xs text-val-muted leading-relaxed">
                {viewParty.description || "No description provided."}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#23232E]">
              <button
                onClick={() => setViewParty(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-[#1D1D27] text-val-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <h3 className="text-base font-bold text-val-white">
                Edit Party Announcement
              </h3>
              <button
                onClick={() => setEditParty(null)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Squad Name
                </label>
                <input
                  type="text"
                  required
                  value={editParty.name}
                  onChange={(e) => setEditParty({ ...editParty, name: e.target.value })}
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  VALORANT Party Code
                </label>
                <input
                  type="text"
                  required
                  value={editParty.partyCode || ""}
                  onChange={(e) => setEditParty({ ...editParty, partyCode: e.target.value })}
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white font-mono rounded-lg px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Current Players
                  </label>
                  <select
                    value={editParty.currentPlayers}
                    onChange={(e) =>
                      setEditParty({
                        ...editParty,
                        currentPlayers: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5 players
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Status
                  </label>
                  <select
                    value={editParty.status}
                    onChange={(e) =>
                      setEditParty({ ...editParty, status: e.target.value as any })
                    }
                    className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                  >
                    <option value="Looking for players">Looking for players</option>
                    <option value="Full">Full (5/5)</option>
                    <option value="In Game">In Game</option>
                    <option value="Closed">Closed</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Required Rank
                  </label>
                  <select
                    value={editParty.requiredRank}
                    onChange={(e) =>
                      setEditParty({ ...editParty, requiredRank: e.target.value })
                    }
                    className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                  >
                    {VALORANT_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Average Team Rank
                  </label>
                  <select
                    value={editParty.averageRank}
                    onChange={(e) =>
                      setEditParty({ ...editParty, averageRank: e.target.value })
                    }
                    className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                  >
                    {VALORANT_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editParty.description}
                  onChange={(e) =>
                    setEditParty({ ...editParty, description: e.target.value })
                  }
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
                <button
                  type="button"
                  onClick={() => setEditParty(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm"
                >
                  {isProcessing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#15151C] border border-rose-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-val-white">
                Delete Party: {deleteParty.name}
              </h3>
            </div>

            <p className="text-xs text-val-muted leading-relaxed">
              Are you sure you want to permanently delete this party announcement and code (
              <span className="font-mono text-val-white font-bold">{deleteParty.partyCode}</span>)?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => setDeleteParty(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-rose-700 hover:bg-rose-600 text-white"
              >
                {isProcessing ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

