"use client";

import React, { useState, useEffect } from "react";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import ServerBadge from "@/components/parties/ServerBadge";
import RoleBadge from "@/components/parties/RoleBadge";
import {
  Bot,
  RotateCcw,
  Trash2,
  Play,
  Save,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Users,
  RefreshCw,
} from "lucide-react";

export default function AdminDemoPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Settings form state
  const [demoEnabled, setDemoEnabled] = useState(true);
  const [targetCount, setTargetCount] = useState(12);
  const [rotationInterval, setRotationInterval] = useState(15);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true);
  const [cleanupInterval, setCleanupInterval] = useState(5);
  const [savingSettings, setSavingSettings] = useState(false);

  // Action loading states
  const [rotating, setRotating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/demo");
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Pre-fill form from stats
        if (json.stats) {
          setDemoEnabled(json.stats.demo.enabled);
          setTargetCount(json.stats.demo.targetCount);
          setRotationInterval(json.stats.demo.rotationIntervalMinutes);
          setAutoCleanupEnabled(json.stats.cleanup.autoCleanupEnabled);
          setCleanupInterval(json.stats.cleanup.intervalMinutes);
        }
      } else {
        error("Failed to load demo management data.");
      }
    } catch {
      error("Network error loading demo data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          settings: {
            "demo.enabled": demoEnabled ? "true" : "false",
            "demo.targetCount": targetCount.toString(),
            "demo.rotationIntervalMinutes": rotationInterval.toString(),
            "cleanup.autoCleanupEnabled": autoCleanupEnabled ? "true" : "false",
            "cleanup.intervalMinutes": cleanupInterval.toString(),
          },
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        success(resData.message || "Settings updated successfully.");
        loadData();
      } else {
        error(resData.error || "Failed to save settings.");
      }
    } catch {
      error("Network error while saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRotateNow = async () => {
    setRotating(true);
    try {
      const res = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate_now" }),
      });
      const resData = await res.json();
      if (res.ok) {
        success(resData.message || "Demo parties rotated successfully!");
        loadData();
      } else {
        error(resData.error || "Rotation failed.");
      }
    } catch {
      error("Network error during rotation.");
    } finally {
      setRotating(false);
    }
  };

  const handleDeleteAllDemo = async () => {
    if (!confirm("Are you sure you want to delete all demo parties? Real user parties will remain completely untouched.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all_demo" }),
      });
      const resData = await res.json();
      if (res.ok) {
        success(resData.message || "All demo parties deleted.");
        loadData();
      } else {
        error(resData.error || "Failed to delete demo parties.");
      }
    } catch {
      error("Network error.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCleanupExpiredNow = async () => {
    setCleaning(true);
    try {
      const res = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup_expired_now" }),
      });
      const resData = await res.json();
      if (res.ok) {
        success(resData.message || "Expired codes cleaned up successfully!");
        loadData();
      } else {
        error(resData.error || "Cleanup failed.");
      }
    } catch {
      error("Network error.");
    } finally {
      setCleaning(false);
    }
  };

  const formatUtcTime = (isoString?: string | null) => {
    if (!isoString) return "Not set / Pending";
    const d = new Date(isoString);
    return `${d.toUTCString().slice(17, 25)} UTC (${formatTimeAgo(d)})`;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col">
      <AdminTopNav
        onOpenMobile={() => setMobileSidebarOpen(true)}
        title="Demo Engine & Code Expiration"
        description="Automated fictional squad rotation and 60-minute real party code lifecycle"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#15151C] border border-[#23232E] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-val-muted mb-2">
              <span className="font-bold uppercase tracking-wider">Demo Parties</span>
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-val-white font-mono">
              {data?.stats?.demo?.count ?? "..."}{" "}
              <span className="text-xs text-val-muted font-normal">
                / {data?.stats?.demo?.targetCount ?? 12} Target
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Status: {data?.stats?.demo?.enabled ? "Automated Rotation ON" : "Disabled"}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#15151C] border border-[#23232E]">
            <div className="flex items-center justify-between text-xs text-val-muted mb-2">
              <span className="font-bold uppercase tracking-wider">Rotation Cadence</span>
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-val-white font-mono">
              {data?.stats?.demo?.rotationIntervalMinutes ?? 15}{" "}
              <span className="text-xs text-val-muted font-normal">Minutes</span>
            </div>
            <div className="text-[11px] text-val-dim mt-2 truncate">
              Next: {formatUtcTime(data?.stats?.demo?.nextRotationTime)}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#15151C] border border-[#23232E]">
            <div className="flex items-center justify-between text-xs text-val-muted mb-2">
              <span className="font-bold uppercase tracking-wider">Expired Real Codes</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-mono">
              {data?.stats?.cleanup?.realExpiredCount ?? 0}
            </div>
            <div className="text-[11px] text-val-dim mt-2">
              Active Real Parties: {data?.stats?.cleanup?.realActiveCount ?? 0}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#15151C] border border-[#23232E]">
            <div className="flex items-center justify-between text-xs text-val-muted mb-2">
              <span className="font-bold uppercase tracking-wider">Code Cleanup</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-val-white font-mono">
              {data?.stats?.cleanup?.intervalMinutes ?? 5}{" "}
              <span className="text-xs text-val-muted font-normal">Min Interval</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 truncate">
              Auto: {data?.stats?.cleanup?.autoCleanupEnabled ? "Enabled (Every 5m)" : "Disabled"}
            </div>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Demo Engine Configuration */}
          <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#23232E]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-val-white">
                    Dynamic Demo Squad Engine
                  </h2>
                  <p className="text-xs text-val-muted">
                    Always maintains 5/5 squads with simulated ranks and servers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotateNow}
                  disabled={rotating}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Generate and rotate new demo parties immediately"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rotating ? "animate-spin" : ""}`} />
                  <span>{rotating ? "Rotating..." : "Rotate Now"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAllDemo}
                  disabled={deleting}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/40 text-rose-400 text-xs font-bold hover:bg-rose-950/40 transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Delete all demo parties from database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0B0F] border border-[#23232E]">
                <div>
                  <span className="text-xs font-bold text-val-white block">
                    Automated Demo Rotation
                  </span>
                  <span className="text-[11px] text-val-dim">
                    Periodically generates and replaces fictional 5/5 squads
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={demoEnabled}
                  onChange={(e) => setDemoEnabled(e.target.checked)}
                  className="w-4 h-4 accent-val-red cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Active Demo Squads Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-[#0B0B0F] border border-[#23232E] text-val-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-val-dim mt-0.5 block">
                    Default: 12 squads
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                    Rotation Interval (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={rotationInterval}
                    onChange={(e) => setRotationInterval(parseInt(e.target.value, 10) || 15)}
                    className="w-full bg-[#0B0B0F] border border-[#23232E] text-val-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-val-dim mt-0.5 block">
                    Default: 15 minutes (server-side)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-val-dim">
                <span>Last Rotation: {formatUtcTime(data?.stats?.demo?.lastRotationTime)}</span>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-lg bg-val-red hover:bg-val-redHover text-white text-xs font-bold uppercase tracking-wider shadow-val-glow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Real Party Expiration & Cleanup Engine */}
          <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#23232E]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-val-white">
                    60-Minute Real Code Expiration
                  </h2>
                  <p className="text-xs text-val-muted">
                    Nullifies expired codes and removes them from active matchmaking
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCleanupExpiredNow}
                disabled={cleaning}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Execute cleanup on all expired real party codes"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{cleaning ? "Cleaning..." : "Run Cleanup"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0B0B0F] border border-[#23232E] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-val-white">Lifecycle Security Rules:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <ul className="space-y-1 text-val-dim list-disc list-inside text-[11px]">
                  <li>Real user codes expire exactly <strong>60 minutes</strong> after publication.</li>
                  <li>After 60m: <code>partyCode = NULL</code> in database (preserves non-sensitive metrics).</li>
                  <li>Status set to <code>EXPIRED</code>, hidden from active search.</li>
                  <li>Hosts can refresh their party code at any time to reset 60m validity.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0B0F] border border-[#23232E]">
                <div>
                  <span className="text-xs font-bold text-val-white block">
                    Automatic Expiration Worker
                  </span>
                  <span className="text-[11px] text-val-dim">
                    Runs every 5 minutes in background transaction
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCleanupEnabled}
                  onChange={(e) => setAutoCleanupEnabled(e.target.checked)}
                  className="w-4 h-4 accent-val-red cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-val-dim">
                <span>Last Cleanup: {formatUtcTime(data?.stats?.cleanup?.lastCleanupTime)}</span>
                <span className="text-val-muted">
                  Next: {formatUtcTime(data?.stats?.cleanup?.nextCleanupTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Live Active Demo Parties Table */}
        <div className="rounded-2xl bg-[#15151C] border border-[#23232E] overflow-hidden">
          <div className="p-5 border-b border-[#23232E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-val-white">
                Active Fictional Demo Parties ({data?.demoParties?.length || 0})
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              partyCode = NULL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B0F] text-val-dim uppercase tracking-wider border-b border-[#23232E] text-[10px]">
                <tr>
                  <th className="px-4 py-3">Squad Name</th>
                  <th className="px-4 py-3">Roster</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Server</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232E] text-val-muted">
                {(!data?.demoParties || data.demoParties.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-val-dim">
                      No active demo parties. Click &ldquo;Rotate Now&rdquo; above to generate 12 fresh squads.
                    </td>
                  </tr>
                ) : (
                  data.demoParties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#1A1A24] transition-colors">
                      <td className="px-4 py-3 font-semibold text-val-white">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-val-white font-bold">
                        5/5 (Full)
                      </td>
                      <td className="px-4 py-3">
                        <RankBadge rank={p.averageRank} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <ServerBadge server={p.server} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={p.preferredRole} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          FULL
                        </span>
                      </td>
                      <td className="px-4 py-3 text-val-dim">
                        {formatTimeAgo(p.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recently Expired Real Party Codes Table */}
        <div className="rounded-2xl bg-[#15151C] border border-[#23232E] overflow-hidden">
          <div className="p-5 border-b border-[#23232E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-val-white">
                Expired Real User Parties ({data?.expiredRealParties?.length || 0})
              </h3>
            </div>
            <span className="text-xs text-val-dim">
              Codes automatically set to NULL after 60 minutes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B0F] text-val-dim uppercase tracking-wider border-b border-[#23232E] text-[10px]">
                <tr>
                  <th className="px-4 py-3">Squad Name</th>
                  <th className="px-4 py-3">Host User</th>
                  <th className="px-4 py-3">Party Code in DB</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Expired At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232E] text-val-muted">
                {(!data?.expiredRealParties || data.expiredRealParties.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-val-dim">
                      No expired real user parties currently recorded.
                    </td>
                  </tr>
                ) : (
                  data.expiredRealParties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#1A1A24] transition-colors">
                      <td className="px-4 py-3 font-semibold text-val-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-val-white">{p.owner?.username}</span>{" "}
                        <span className="text-[11px] text-val-dim">({p.owner?.rank})</span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {p.partyCode ? (
                          <span className="text-amber-400">{p.partyCode} (Pending cleanup)</span>
                        ) : (
                          <span className="text-rose-400 font-bold">NULL (Sanitized)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-val-dim">
                        {formatTimeAgo(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-val-dim font-mono">
                        {p.expiresAt ? formatTimeAgo(p.expiresAt) : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

