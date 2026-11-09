"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminDashboardStats, UserSummary, PartySummary, ReportSummary, AdminLogSummary } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import PartyStatusBadge from "@/components/parties/PartyStatusBadge";
import {
  Users,
  Gamepad2,
  AlertTriangle,
  Copy,
  UserCheck,
  UserX,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<{
    stats: AdminDashboardStats;
    recentUsers: UserSummary[];
    recentParties: PartySummary[];
    recentReports: ReportSummary[];
    recentLogs: AdminLogSummary[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-val-red border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs uppercase font-mono tracking-widest text-val-muted">
          Aggregating Platform Intelligence...
        </span>
      </div>
    );
  }

  const { stats, recentUsers, recentParties, recentReports, recentLogs } = data;

  // Max value for bar heights in chart
  const maxReg = Math.max(...stats.registrationsByDate.map((d) => d.count), 1);
  const maxParty = Math.max(...stats.partiesByDate.map((d) => d.count), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#15151C] border border-[#23232E] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Live Real-Time Engine Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            System Operational Overview
          </h2>
          <p className="text-xs text-val-muted">
            Global metrics across user accounts, party codes, and community reports.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D1D27] hover:bg-[#252533] border border-[#2E2E3E] text-xs font-bold uppercase tracking-wider text-val-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-val-red" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary KPI Grid (12 key statistics requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-val-muted" />
          </div>
          <div className="text-2xl font-black font-mono text-val-white">{stats.totalUsers}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">
            +{stats.newUsersToday} joined today
          </span>
        </div>

        {/* Active Users */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{stats.activeUsers}</div>
          <span className="text-[10px] text-val-dim">In good standing</span>
        </div>

        {/* Total Parties */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Parties</span>
            <Gamepad2 className="w-4 h-4 text-val-red" />
          </div>
          <div className="text-2xl font-black font-mono text-val-white">{stats.totalParties}</div>
          <span className="text-[10px] text-val-muted">Published to date</span>
        </div>

        {/* Active / Looking for Players */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-emerald-500/30 bg-gradient-to-br from-[#15151C] to-emerald-950/20">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Seeking 5th
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {stats.lookingForPlayersParties}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-medium">Looking for players</span>
        </div>

        {/* Full Parties */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Full Squads</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">{stats.fullParties}</div>
          <span className="text-[10px] text-val-dim">5/5 players filled</span>
        </div>

        {/* Party Code Copies */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-val-red/30 bg-gradient-to-br from-[#15151C] to-rose-950/20">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
              Code Copies
            </span>
            <Copy className="w-4 h-4 text-val-red" />
          </div>
          <div className="text-2xl font-black font-mono text-val-red">
            {stats.totalPartyCopies}
          </div>
          <span className="text-[10px] text-val-muted">Clipboard clicks</span>
        </div>

        {/* Pending Reports */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-amber-500/30">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Pending Reports
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {stats.pendingReports}
          </div>
          <span className="text-[10px] text-val-muted">Needs review</span>
        </div>

        {/* Total Reports */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Reports</span>
            <Shield className="w-4 h-4 text-val-muted" />
          </div>
          <div className="text-2xl font-black font-mono text-val-white">{stats.totalReports}</div>
          <span className="text-[10px] text-val-dim">Historical total</span>
        </div>

        {/* Banned Users */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-rose-900/40">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Banned Users
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{stats.bannedUsers}</div>
          <span className="text-[10px] text-rose-500/80">Permanent bans</span>
        </div>

        {/* Suspended Accounts */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Suspended</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">
            {stats.suspendedUsers}
          </div>
          <span className="text-[10px] text-val-dim">Temporary holds</span>
        </div>

        {/* Expired / Closed */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Closed Parties</span>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-black font-mono text-zinc-400">{stats.expiredParties}</div>
          <span className="text-[10px] text-val-dim">Archived from feed</span>
        </div>

        {/* Fill Rate */}
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <div className="flex items-center justify-between text-val-muted mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Fill Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {stats.totalParties > 0
              ? `${Math.round((stats.fullParties / stats.totalParties) * 100)}%`
              : "0%"}
          </div>
          <span className="text-[10px] text-val-dim">Completed squads</span>
        </div>
      </div>

      {/* Real-Data Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations Trend (Last 14 days) */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
                User Registrations (Last 14 Days)
              </h3>
              <p className="text-[11px] text-val-dim">Real database acquisition rate</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#1D1D27] text-val-white border border-[#2E2E3E]">
              {stats.registrationsByDate.reduce((a, b) => a + b.count, 0)} total
            </span>
          </div>

          <div className="h-44 flex items-end gap-1.5 pt-6 border-b border-[#23232E] pb-2">
            {stats.registrationsByDate.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxReg) * 100));
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-black border border-[#2E2E3E] text-[10px] font-mono text-val-white whitespace-nowrap pointer-events-none z-10">
                    {item.date}: {item.count} users
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-val-red/40 to-val-red group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[9px] text-val-dim font-mono">
                    {item.date.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Party Creations Trend (Last 14 days) */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
                Party Publications (Last 14 Days)
              </h3>
              <p className="text-[11px] text-val-dim">Squad codes posted</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#1D1D27] text-val-white border border-[#2E2E3E]">
              {stats.partiesByDate.reduce((a, b) => a + b.count, 0)} total
            </span>
          </div>

          <div className="h-44 flex items-end gap-1.5 pt-6 border-b border-[#23232E] pb-2">
            {stats.partiesByDate.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxParty) * 100));
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-black border border-[#2E2E3E] text-[10px] font-mono text-val-white whitespace-nowrap pointer-events-none z-10">
                    {item.date}: {item.count} parties
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-cyan-600/40 to-cyan-400 group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[9px] text-val-dim font-mono">
                    {item.date.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdowns & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Ranks Breakdown */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
            Most Active Ranks in Parties
          </h3>
          <div className="space-y-2.5 pt-1">
            {stats.partiesByRank.length > 0 ? (
              stats.partiesByRank.map((r) => (
                <div key={r.rank} className="flex items-center justify-between text-xs">
                  <RankBadge rank={r.rank} size="sm" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-val-white font-bold">{r.count}</span>
                    <span className="text-[10px] text-val-dim">parties</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-val-dim">No rank data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Popular Server Breakdown */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
            Top Server Regions
          </h3>
          <div className="space-y-2.5 pt-1">
            {stats.partiesByServer.length > 0 ? (
              stats.partiesByServer.map((s) => (
                <div key={s.server} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-val-white">{s.server}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-val-white font-bold">{s.count}</span>
                    <span className="text-[10px] text-val-dim">parties</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-val-dim">No server data recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Sections (Users, Parties, Reports, Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
              Recent Registrations
            </h3>
            <Link
              href="/admin/users"
              className="text-xs text-val-red hover:underline flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#23232E]">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-val-white truncate">{u.username}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#1D1D27] text-val-muted">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-val-dim block truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RankBadge rank={u.rank} size="sm" />
                  <span className="text-[10px] text-val-dim font-mono">
                    {formatTimeAgo(u.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Parties */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
              Recent Parties Posted
            </h3>
            <Link
              href="/admin/parties"
              className="text-xs text-val-red hover:underline flex items-center gap-1"
            >
              <span>Manage Parties</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#23232E]">
            {recentParties.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-val-white truncate">{p.name}</span>
                    <PartyStatusBadge status={p.status} />
                  </div>
                  <span className="text-[11px] text-val-dim font-mono">
                    Code: {p.partyCode} • By {p.owner?.username}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-val-muted">
                    {p.currentPlayers}/{p.maxPlayers}
                  </span>
                  <span className="text-[10px] text-val-dim font-mono">
                    {formatTimeAgo(p.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
              Recent User Reports
            </h3>
            <Link
              href="/admin/reports"
              className="text-xs text-val-red hover:underline flex items-center gap-1"
            >
              <span>View All Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#23232E]">
            {recentReports.length > 0 ? (
              recentReports.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-amber-300 block truncate">{r.reason}</span>
                    <span className="text-[11px] text-val-dim block truncate">
                      Party: {r.party?.name || "Deleted Party"} • Reporter:{" "}
                      {r.reporter?.username || "Anonymous"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {r.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-val-dim py-4">No active moderation reports filed.</p>
            )}
          </div>
        </div>

        {/* Latest Audit Logs */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
              Recent Staff Audit Logs
            </h3>
            <Link
              href="/admin/logs"
              className="text-xs text-val-red hover:underline flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#23232E]">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-val-white">{log.adminName}</span>
                    <span className="font-mono text-[10px] text-val-red px-1.5 py-0.2 rounded bg-val-red/10 border border-val-red/20">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[11px] text-val-dim block truncate">
                    Target: {log.targetType} {log.targetId ? `(${log.targetId})` : ""}
                  </span>
                </div>
                <span className="text-[10px] text-val-dim font-mono shrink-0">
                  {formatTimeAgo(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

