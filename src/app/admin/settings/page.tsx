"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Settings,
  Save,
  Shield,
  Gamepad2,
  Users,
  AlertTriangle,
  Lock,
  RefreshCw,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user: currentAdmin } = useAuth();
  const { success, error } = useToast();

  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  const [settings, setSettings] = useState<Record<string, string>>({
    "general.siteName": "LastMate",
    "general.siteLogo": "/logo.jpg",
    "general.description": "VALORANT Party Code Matchmaking Platform",
    "general.contactEmail": "support@lastmate.gg",
    "general.maintenanceMode": "false",
    "party.maxPartySize": "5",
    "party.defaultExpirationMinutes": "30",
    "party.maxActivePartiesPerUser": "3",
    "party.allowPublicParties": "true",
    "party.enablePartyCreation": "true",
    "party.enableCodeCopying": "true",
    "user.enableRegistration": "true",
    "user.enableEmailVerification": "false",
    "user.allowedRoles": "USER,MODERATOR,ADMIN,SUPER_ADMIN",
    "moderation.maxReportsBeforeAutoReview": "3",
    "moderation.autoExpireInactiveMinutes": "60",
    "moderation.rateLimitRequestsPerMin": "60",
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...(data.settings || {}) }));
      }
    } catch {
      error("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to persist settings");
      } else {
        success("System settings updated & applied.");
        fetchSettings();
      }
    } catch {
      error("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-val-red border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs uppercase font-mono tracking-widest text-val-muted">
          Loading System Configuration...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#15151C] border border-[#23232E] shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Global Website Configuration
          </h2>
          <p className="text-xs text-val-muted">
            Configure system rules, matchmaking limits, registration gates, and moderation thresholds.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-val-red hover:bg-val-redHover text-white text-xs font-bold uppercase tracking-wider shadow-val-glow transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Persisting..." : "Save All Settings"}</span>
        </button>
      </div>

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. GENERAL SETTINGS */}
        <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#23232E] text-val-white">
            <Settings className="w-4 h-4 text-val-red" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              General Platform Identity
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Website Name
              </label>
              <input
                type="text"
                value={settings["general.siteName"] || ""}
                onChange={(e) => handleChange("general.siteName", e.target.value)}
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Website Logo Path
              </label>
              <input
                type="text"
                value={settings["general.siteLogo"] || ""}
                onChange={(e) => handleChange("general.siteLogo", e.target.value)}
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={settings["general.contactEmail"] || ""}
                onChange={(e) => handleChange("general.contactEmail", e.target.value)}
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Platform Meta Description
              </label>
              <textarea
                rows={2}
                value={settings["general.description"] || ""}
                onChange={(e) => handleChange("general.description", e.target.value)}
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg p-2.5"
              />
            </div>

            {/* Maintenance Mode Toggle (Super Admin Only) */}
            <div className="pt-2 border-t border-[#23232E] flex items-center justify-between">
              <div>
                <span className="font-bold text-val-white block">Maintenance Mode</span>
                <span className="text-[10px] text-val-dim">
                  Temporarily suspend public operations {isSuperAdmin ? "" : "(Super Admin only)"}
                </span>
              </div>
              <button
                type="button"
                disabled={!isSuperAdmin}
                onClick={() => handleToggle("general.maintenanceMode")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                  settings["general.maintenanceMode"] === "true"
                    ? "bg-rose-950/60 border-val-red text-rose-300"
                    : "bg-[#1D1D27] border-[#2E2E3E] text-val-dim"
                } ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {settings["general.maintenanceMode"] === "true" ? "ACTIVE" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. PARTY SETTINGS */}
        <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#23232E] text-val-white">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Party Matchmaking Rules
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Max Party Size
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={settings["party.maxPartySize"] || "5"}
                  onChange={(e) => handleChange("party.maxPartySize", e.target.value)}
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Expiration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={settings["party.defaultExpirationMinutes"] || "30"}
                  onChange={(e) =>
                    handleChange("party.defaultExpirationMinutes", e.target.value)
                  }
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Max Active Parties Per User
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings["party.maxActivePartiesPerUser"] || "3"}
                onChange={(e) =>
                  handleChange("party.maxActivePartiesPerUser", e.target.value)
                }
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
              />
            </div>

            <div className="pt-2 space-y-2 border-t border-[#23232E]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-val-white block">Enable Party Publication</span>
                  <span className="text-[10px] text-val-dim">Allow users to publish new squad codes</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("party.enablePartyCreation")}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                    settings["party.enablePartyCreation"] === "true"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-[#1D1D27] border-[#2E2E3E] text-val-dim"
                  }`}
                >
                  {settings["party.enablePartyCreation"] === "true" ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="font-semibold text-val-white block">Enable Party Code Copying</span>
                  <span className="text-[10px] text-val-dim">Allow visitors to copy official codes to clipboard</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("party.enableCodeCopying")}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                    settings["party.enableCodeCopying"] === "true"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-[#1D1D27] border-[#2E2E3E] text-val-dim"
                  }`}
                >
                  {settings["party.enableCodeCopying"] === "true" ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. USER & AUTH SETTINGS */}
        <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#23232E] text-val-white">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              User Accounts & Gates
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-val-white block">Allow New Registrations</span>
                <span className="text-[10px] text-val-dim">Open registration to new players</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("user.enableRegistration")}
                className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                  settings["user.enableRegistration"] === "true"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                }`}
              >
                {settings["user.enableRegistration"] === "true" ? "Open" : "Closed"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#23232E]">
              <div>
                <span className="font-semibold text-val-white block">Email Verification Enforced</span>
                <span className="text-[10px] text-val-dim">Require email verification before publishing</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("user.enableEmailVerification")}
                className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                  settings["user.enableEmailVerification"] === "true"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-[#1D1D27] border-[#2E2E3E] text-val-dim"
                }`}
              >
                {settings["user.enableEmailVerification"] === "true" ? "Enforced" : "Optional"}
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Configured System Roles
              </label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={settings["user.allowedRoles"] || "USER,MODERATOR,ADMIN,SUPER_ADMIN"}
                onChange={(e) => handleChange("user.allowedRoles", e.target.value)}
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* 4. MODERATION & SECURITY SETTINGS */}
        <div className="p-6 rounded-2xl bg-[#15151C] border border-[#23232E] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#23232E] text-val-white">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Moderation & Anti-Spam
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Max Reports Before Auto Flagging
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings["moderation.maxReportsBeforeAutoReview"] || "3"}
                onChange={(e) =>
                  handleChange("moderation.maxReportsBeforeAutoReview", e.target.value)
                }
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Inactive Party Auto-Expire Threshold (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                value={settings["moderation.autoExpireInactiveMinutes"] || "60"}
                onChange={(e) =>
                  handleChange("moderation.autoExpireInactiveMinutes", e.target.value)
                }
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                API Rate Limit (Requests / Min / IP)
              </label>
              <input
                type="number"
                min={20}
                max={500}
                value={settings["moderation.rateLimitRequestsPerMin"] || "60"}
                onChange={(e) =>
                  handleChange("moderation.rateLimitRequestsPerMin", e.target.value)
                }
                className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

