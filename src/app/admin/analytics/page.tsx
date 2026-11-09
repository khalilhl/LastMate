"use client";

import React, { useState, useEffect } from "react";
import { AdminDashboardStats } from "@/lib/types";
import RankBadge from "@/components/parties/RankBadge";
import RoleBadge from "@/components/parties/RoleBadge";
import ServerBadge from "@/components/parties/ServerBadge";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Gamepad2,
  Copy,
  TrendingUp,
  Percent,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState<"parties" | "users" | "reports">("parties");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    window.location.href = `/api/admin/analytics/export?type=${exportType}`;
  };

  if (loading || !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-val-red border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs uppercase font-mono tracking-widest text-val-muted">
          Computing Platform Metrics...
        </span>
      </div>
    );
  }

  const completionRate =
    stats.totalParties > 0
      ? Math.round((stats.fullParties / stats.totalParties) * 100)
      : 0;

  const expirationRate =
    stats.totalParties > 0
      ? Math.round((stats.expiredParties / stats.totalParties) * 100)
      : 0;

  const maxReg = Math.max(...stats.registrationsByDate.map((d) => d.count), 1);
  const maxParty = Math.max(...stats.partiesByDate.map((d) => d.count), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with CSV Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#15151C] border border-[#23232E] shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Platform Analytics & Data Intelligence
          </h2>
          <p className="text-xs text-val-muted">
            Aggregated trends for player growth, squad completion rates, and regional traffic.
          </p>
        </div>

        {/* CSV Export Form */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as any)}
            className="bg-[#1D1D27] border border-[#2E2E3E] text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red font-mono"
          >
            <option value="parties">Parties Data (CSV)</option>
            <option value="users">Users Data (CSV)</option>
            <option value="reports">Reports Audit (CSV)</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-val-red hover:bg-val-redHover text-white text-xs font-bold uppercase tracking-wider shadow-val-glow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <span className="text-[10px] uppercase font-bold text-val-dim block mb-1">
            Total Party Code Copies
          </span>
          <div className="text-2xl font-black font-mono text-val-red">
            {stats.totalPartyCopies}
          </div>
          <span className="text-[10px] text-val-muted">Clicks across all cards</span>
        </div>

        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <span className="text-[10px] uppercase font-bold text-val-dim block mb-1">
            Squad Fill / Completion Rate
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {completionRate}%
          </div>
          <span className="text-[10px] text-val-muted">5/5 squads assembled</span>
        </div>

        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <span className="text-[10px] uppercase font-bold text-val-dim block mb-1">
            Expiration Rate
          </span>
          <div className="text-2xl font-black font-mono text-zinc-400">
            {expirationRate}%
          </div>
          <span className="text-[10px] text-val-muted">Auto or manually closed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#15151C] border border-[#23232E]">
          <span className="text-[10px] uppercase font-bold text-val-dim block mb-1">
            Avg. Estimated Fill Time
          </span>
          <div className="text-2xl font-black font-mono text-cyan-400">
            ~42 sec
          </div>
          <span className="text-[10px] text-val-muted">Peak hours fill speed</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Velocity */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
                Registration Velocity (Daily Trend)
              </h3>
              <p className="text-[11px] text-val-dim">14-day chronological distribution</p>
            </div>
            <Users className="w-4 h-4 text-val-muted" />
          </div>

          <div className="h-44 flex items-end gap-1.5 pt-6 border-b border-[#23232E] pb-2">
            {stats.registrationsByDate.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxReg) * 100));
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
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

        {/* Publication Velocity */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
                Party Publication Velocity (Daily Trend)
              </h3>
              <p className="text-[11px] text-val-dim">14-day chronological distribution</p>
            </div>
            <Gamepad2 className="w-4 h-4 text-val-muted" />
          </div>

          <div className="h-44 flex items-end gap-1.5 pt-6 border-b border-[#23232E] pb-2">
            {stats.partiesByDate.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxParty) * 100));
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
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

      {/* Rank & Server Demographic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Ranks */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
            Parties by Skill Tier (Rank Breakdown)
          </h3>
          <div className="space-y-3">
            {stats.partiesByRank.map((r) => {
              const share =
                stats.totalParties > 0
                  ? Math.round((r.count / stats.totalParties) * 100)
                  : 0;
              return (
                <div key={r.rank} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <RankBadge rank={r.rank} size="sm" />
                    <span className="font-mono text-val-white text-xs">
                      {r.count} squads ({share}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1D1D27] overflow-hidden">
                    <div
                      style={{ width: `${share}%` }}
                      className="h-full bg-val-red rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Server Regions */}
        <div className="p-5 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <h3 className="text-sm font-bold text-val-white uppercase tracking-wider">
            Server Traffic Distribution
          </h3>
          <div className="space-y-3">
            {stats.partiesByServer.map((s) => {
              const share =
                stats.totalParties > 0
                  ? Math.round((s.count / stats.totalParties) * 100)
                  : 0;
              return (
                <div key={s.server} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-val-white">{s.server}</span>
                    <span className="font-mono text-val-white text-xs">
                      {s.count} squads ({share}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1D1D27] overflow-hidden">
                    <div
                      style={{ width: `${share}%` }}
                      className="h-full bg-cyan-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

