"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, AlertTriangle, ShieldCheck, LogOut, ExternalLink, RefreshCw } from "lucide-react";

interface AdminTopNavProps {
  onOpenMobile: () => void;
  title?: string;
  description?: string;
}

export default function AdminTopNav({
  onOpenMobile,
  title = "Command Dashboard",
  description = "Platform oversight and real-time operations",
}: AdminTopNavProps) {
  const { user, logout } = useAuth();
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);

  useEffect(() => {
    async function checkPending() {
      try {
        const res = await fetch("/api/admin/reports?limit=1&status=PENDING");
        if (res.ok) {
          const data = await res.json();
          setPendingReportsCount(data.pagination?.total || 0);
        }
      } catch {}
    }
    checkPending();
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-[#0B0B0F]/90 backdrop-blur-md border-b border-[#23232E] px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg bg-[#15151C] border border-[#23232E] text-val-muted hover:text-val-white"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-val-white flex items-center gap-2">
              <span>{title}</span>
            </h1>
            <p className="text-[11px] text-val-dim hidden sm:block">
              {description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Pending Reports Pill */}
          <Link
            href="/admin/reports"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              pendingReportsCount > 0
                ? "bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse"
                : "bg-[#15151C] border-[#23232E] text-val-muted hover:text-val-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {pendingReportsCount} {pendingReportsCount === 1 ? "Report" : "Reports"}
            </span>
          </Link>

          {/* Quick Home view */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15151C] border border-[#23232E] text-xs font-semibold text-val-muted hover:text-val-white transition-colors"
            title="Open Public Website in new tab"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-val-dim" />
          </Link>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => logout()}
            className="p-2 rounded-lg bg-[#15151C] border border-[#23232E] text-val-muted hover:text-rose-400 hover:border-rose-900/60 transition-colors"
            title="Sign out of Admin session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

