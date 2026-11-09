"use client";

import React, { useState, useEffect } from "react";
import { UserSummary } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Lock,
  X,
} from "lucide-react";

export default function AdminManagementPage() {
  const { user: currentAdmin } = useAuth();
  const { success, error } = useToast();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Promote user modal
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<UserSummary[]>([]);
  const [selectedRole, setSelectedRole] = useState("MODERATOR");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      } else {
        error("Failed to load staff accounts");
      }
    } catch {
      error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSearchedUsers(data.users || []);
      }
    } catch {
      error("Failed to search users");
    }
  };

  const handlePromote = async (userId: string, newRole: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update role");
      } else {
        success(`Staff role updated to ${newRole}`);
        setPromoteModalOpen(false);
        setSearchedUsers([]);
        setSearchQuery("");
        fetchStaff();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentAdmin?.role !== "SUPER_ADMIN") {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-val-white">Super Admin Clearance Required</h3>
        <p className="text-xs text-val-muted mt-1">
          Only Super Administrators can manage team roles and staff accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Staff & Administrators Management
          </h2>
          <p className="text-xs text-val-muted">
            Manage administrative privileges, assign moderators, and configure platform personnel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPromoteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-val-red hover:bg-val-redHover text-white text-xs font-bold uppercase tracking-wider shadow-val-glow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Promote New Staff</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-[#23232E] bg-[#15151C] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#23232E] bg-[#1A1A24] text-[10px] font-bold uppercase tracking-wider text-val-dim">
                <th className="py-3 px-4">Administrator / Agent</th>
                <th className="py-3 px-4">Clearance Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Audit Logs Created</th>
                <th className="py-3 px-4">Reports Handled</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Role Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232E]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-[#15151C]/40" />
                  </tr>
                ))
              ) : staffList.length > 0 ? (
                staffList.map((admin) => {
                  const isSelf = admin.id === currentAdmin?.id;
                  return (
                    <tr key={admin.id} className="hover:bg-[#1C1C26] transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-val-white flex items-center gap-2">
                            <span>{admin.username}</span>
                            {isSelf && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-val-red/20 text-val-red border border-val-red/30">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-val-dim font-mono">{admin.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            admin.role === "SUPER_ADMIN"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : admin.role === "ADMIN"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-semibold">{admin.status}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-val-white font-bold">
                        {admin._count?.adminLogs || 0}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-val-white font-bold">
                        {admin._count?.resolvedReports || 0}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] font-mono text-val-dim">
                        {admin.lastLoginAt ? formatTimeAgo(admin.lastLoginAt) : "Never"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-val-dim italic">Protected</span>
                        ) : (
                          <select
                            value={admin.role}
                            onChange={(e) => handlePromote(admin.id, e.target.value)}
                            className="bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-val-red font-mono"
                          >
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="USER">Demote to USER</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-val-dim">
                    No staff members loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROMOTE MODAL */}
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <div className="flex items-center gap-2 text-val-red">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-val-white">
                  Assign Staff Permissions
                </h3>
              </div>
              <button
                onClick={() => setPromoteModalOpen(false)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchUser} className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim">
                Find User by Username or Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. PhoenixMain or agent@domain.com"
                  className="flex-1 bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#252533] border border-[#3E3E4E] text-xs font-bold uppercase text-val-white hover:bg-[#2E2E3E]"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Results List */}
            <div className="space-y-2 pt-2">
              {searchedUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-[#1D1D27] border border-[#2E2E3E] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-val-white block">{u.username}</span>
                    <span className="text-[10px] text-val-dim font-mono">{u.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromote(u.id, "MODERATOR")}
                      disabled={isProcessing}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60"
                    >
                      + Moderator
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromote(u.id, "ADMIN")}
                      disabled={isProcessing}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-950/60"
                    >
                      + Admin
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#23232E]">
              <button
                type="button"
                onClick={() => setPromoteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
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

