"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserSummary } from "@/lib/types";
import { VALORANT_RANKS, VALORANT_ROLES, VALORANT_SERVERS } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertOctagon,
  RotateCcw,
  Check,
  X,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editUser, setEditUser] = useState<UserSummary | null>(null);
  const [banUser, setBanUser] = useState<UserSummary | null>(null);
  const [banReason, setBanReason] = useState("");
  const [suspendUser, setSuspendUser] = useState<UserSummary | null>(null);
  const [suspendDurationDays, setSuspendDurationDays] = useState(7);
  const [deleteUser, setDeleteUser] = useState<UserSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (rankFilter !== "all") params.set("rank", rankFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, rankFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // View full user details
  const handleOpenView = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setViewUser(data);
      } else {
        error("Failed to load user profile");
      }
    } catch {
      error("Network error");
    }
  };

  // Edit user save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          username: editUser.username,
          email: editUser.email,
          riotId: editUser.riotId,
          rank: editUser.rank,
          mainRole: editUser.mainRole,
          preferredServer: editUser.preferredServer,
          role: editUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update user");
      } else {
        success(`User ${editUser.username} updated.`);
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ban user
  const handleConfirmBan = async () => {
    if (!banUser) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: banUser.id,
          status: "BANNED",
          banReason: banReason.trim() || "Violation of platform terms of service",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to ban user");
      } else {
        success(`User ${banUser.username} has been permanently banned.`);
        setBanUser(null);
        setBanReason("");
        fetchUsers();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Unban user
  const handleUnban = async (u: UserSummary) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id,
          status: "ACTIVE",
          banReason: null,
          suspendedUntil: null,
        }),
      });

      if (res.ok) {
        success(`User ${u.username} unbanned and restored to ACTIVE.`);
        fetchUsers();
      } else {
        const data = await res.json();
        error(data.error || "Failed to unban user");
      }
    } catch {
      error("Network error");
    }
  };

  // Suspend user
  const handleConfirmSuspend = async () => {
    if (!suspendUser) return;
    setIsProcessing(true);

    const until = new Date();
    until.setDate(until.getDate() + suspendDurationDays);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: suspendUser.id,
          status: "SUSPENDED",
          suspendedUntil: until.toISOString(),
          banReason: `Suspended for ${suspendDurationDays} days`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to suspend user");
      } else {
        success(`User ${suspendUser.username} suspended until ${until.toLocaleDateString()}`);
        setSuspendUser(null);
        fetchUsers();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete user
  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/users?userId=${deleteUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to delete user");
      } else {
        success(`Account ${deleteUser.username} deleted permanently.`);
        setDeleteUser(null);
        fetchUsers();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Suspended
          </span>
        );
      case "BANNED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Banned
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Super Admin
          </span>
        );
      case "ADMIN":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Admin
          </span>
        );
      case "MODERATOR":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Moderator
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
            User
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
            User Accounts Management
          </h2>
          <p className="text-xs text-val-muted">
            Inspect player profiles, adjust roles, enforce bans, or manage suspensions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-val-muted">
            Total users: <strong className="text-val-white">{totalCount}</strong>
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
              placeholder="Search by username, email, Riot ID..."
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Roles</option>
              <option value="USER">User Only</option>
              <option value="MODERATOR">Moderator Only</option>
              <option value="ADMIN">Admin Only</option>
              <option value="SUPER_ADMIN">Super Admin Only</option>
            </select>
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
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
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
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-[#23232E] bg-[#15151C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#23232E] bg-[#1A1A24] text-[10px] font-bold uppercase tracking-wider text-val-dim">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Rank / Role</th>
                <th className="py-3 px-4">Server</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Parties</th>
                <th className="py-3 px-4">Joined / Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232E]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4 bg-[#15151C]/40" />
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1C1C26] transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-val-white flex items-center gap-1.5">
                          <span>{u.username}</span>
                          {u.riotId && (
                            <span className="text-[10px] text-val-dim font-mono">
                              ({u.riotId})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-val-dim font-mono">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <RankBadge rank={u.rank} size="sm" />
                        <span className="text-[10px] text-val-dim">{u.mainRole}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-val-muted">
                      {u.preferredServer.split(" ")[0]}
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(u.status)}
                    </td>

                    <td className="py-3 px-4">
                      {getRoleBadge(u.role)}
                    </td>

                    <td className="py-3 px-4 font-mono text-val-muted">
                      {u._count?.parties || 0}
                    </td>

                    <td className="py-3 px-4 text-[11px] font-mono text-val-dim">
                      <div>Joined {formatTimeAgo(u.createdAt)}</div>
                      {u.lastLoginAt && (
                        <div className="text-[10px] text-val-muted">
                          Login {formatTimeAgo(u.lastLoginAt)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View full drawer */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(u.id)}
                          className="p-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-val-muted hover:text-val-white transition-colors"
                          title="View complete profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit User */}
                        <button
                          type="button"
                          onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Edit user info & role"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban / Unban */}
                        {u.status === "BANNED" ? (
                          <button
                            type="button"
                            onClick={() => handleUnban(u)}
                            className="p-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                            title="Unban account"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBanUser(u);
                              setBanReason("");
                            }}
                            className="p-1.5 rounded-lg border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Ban account permanently"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Suspend */}
                        {u.status !== "BANNED" && (
                          <button
                            type="button"
                            onClick={() => setSuspendUser(u)}
                            className="p-1.5 rounded-lg border border-amber-900/60 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 transition-colors"
                            title="Suspend temporarily"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => setDeleteUser(u)}
                          className="p-1.5 rounded-lg border border-rose-950 bg-rose-950/40 text-rose-500 hover:bg-rose-900 transition-colors"
                          title="Delete account permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-val-dim">
                    No users matching criteria.
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

      {/* VIEW USER DETAILS MODAL */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <div>
                <h3 className="text-lg font-bold text-val-white">
                  {viewUser.user.username}
                </h3>
                <span className="text-xs font-mono text-val-dim">{viewUser.user.email}</span>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="text-val-muted hover:text-val-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Rank</span>
                <RankBadge rank={viewUser.user.rank} size="sm" />
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Role</span>
                <span className="font-bold text-val-white">{viewUser.user.role}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Status</span>
                {getStatusBadge(viewUser.user.status)}
              </div>
              <div className="p-3 rounded-lg bg-[#1D1D27] border border-[#2E2E3E]">
                <span className="text-[10px] text-val-dim uppercase block">Riot ID</span>
                <span className="font-bold text-val-white">{viewUser.user.riotId || "None"}</span>
              </div>
            </div>

            {/* Published Parties */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-val-dim mb-2">
                Published Parties ({viewUser.user.parties?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {viewUser.user.parties?.length > 0 ? (
                  viewUser.user.parties.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-[#1D1D27] border border-[#2E2E3E] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-val-white">{p.name}</span>
                        <span className="text-[10px] text-val-dim font-mono block">
                          Code: {p.partyCode} • Status: {p.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-val-dim font-mono">
                        {formatTimeAgo(p.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-val-dim">No parties published by this user.</p>
                )}
              </div>
            </div>

            {/* Reports Filed Against Parties */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Reports Filed Against User&apos;s Parties ({viewUser.reportsAgainstUser?.length || 0})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {viewUser.reportsAgainstUser?.length > 0 ? (
                  viewUser.reportsAgainstUser.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-amber-300">{r.reason}</span>
                        <span className="text-[10px] text-val-dim block">
                          Party: {r.party?.name} • Reporter: {r.reporter?.username}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400">{r.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-val-dim">Clean record. No complaints filed.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#23232E]">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-[#1D1D27] text-val-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <h3 className="text-base font-bold text-val-white">
                Edit User: {editUser.username}
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Rank
                  </label>
                  <select
                    value={editUser.rank}
                    onChange={(e) => setEditUser({ ...editUser, rank: e.target.value })}
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
                    System Role
                  </label>
                  <select
                    value={editUser.role}
                    disabled={currentAdmin?.role !== "SUPER_ADMIN" && editUser.role === "SUPER_ADMIN"}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value as any })
                    }
                    className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                  >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    {currentAdmin?.role === "SUPER_ADMIN" && (
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
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

      {/* BAN USER MODAL */}
      {banUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#15151C] border border-rose-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-val-white">
                Ban User: {banUser.username}
              </h3>
            </div>

            <p className="text-xs text-val-muted leading-relaxed">
              This will permanently revoke the user&apos;s ability to sign in, publish party codes, or interact with other agents on LastMate.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Reason for Ban
              </label>
              <textarea
                rows={3}
                required
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Toxic hate speech, fake party codes, or account selling..."
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg p-3 focus:outline-none focus:border-val-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => setBanUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-rose-600 hover:bg-rose-500 text-white shadow-val-glow-sm"
              >
                {isProcessing ? "Banning..." : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND USER MODAL */}
      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#15151C] border border-amber-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-val-white">
                Suspend: {suspendUser.username}
              </h3>
            </div>

            <p className="text-xs text-val-muted">
              Select the duration of the temporary suspension:
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSuspendDurationDays(days)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                    suspendDurationDays === days
                      ? "bg-amber-500 text-black border-amber-400"
                      : "bg-[#1D1D27] border-[#2E2E3E] text-val-muted hover:text-val-white"
                  }`}
                >
                  {days} {days === 1 ? "Day" : "Days"}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => setSuspendUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                {isProcessing ? "Suspending..." : `Suspend for ${suspendDurationDays} Days`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#15151C] border border-rose-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-val-white">
                Delete Account: {deleteUser.username}
              </h3>
            </div>

            <p className="text-xs text-val-muted leading-relaxed">
              Are you sure you want to permanently delete this user account? All their parties and reports will be removed from the database.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
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

